# routes.py
from .database import db 
from flask import current_app as app, jsonify, request, render_template, send_from_directory
from flask_security import auth_required, roles_required, roles_accepted, current_user, login_user
from werkzeug.security import check_password_hash, generate_password_hash
from .models import db, User, Role, User_Info, Quiz, Score, Question, Subject
from flask_security.utils import hash_password
import uuid
from .utils import roles_list
import calendar
from collections import defaultdict
import traceback  # Import traceback for better debugging
from .models import db, User, Role, User_Info, Quiz, Score, Question, Subject, Chapter
from celery.result import AsyncResult
from .tasks import export_quiz_attempts, monthly_report, daily_quiz_reminder, export_all_user_performance, quiz_status_update
# from application.tasks import export_quiz_attempts, monthly_report, daily_quiz_reminder, quiz_report
from celery.result import AsyncResult
import os
from flask import send_from_directory


@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/api/admin')
@auth_required('token')
@roles_required('admin')
def admin_home():
    return jsonify({"message": "Admin logged in successfully"}), 200

@app.route('/api/home')
@auth_required('token')
@roles_accepted('admin', 'user')
def user_home():
    user = current_user
    user_info = User_Info.query.filter_by(email=user.email).first()
    extra_info = {}
    if user_info:
        extra_info = {
            "full_name": user_info.full_name,
            "qualification": user_info.qualification,
            "date_of_birth": user_info.date_of_birth
        }
    return jsonify({
        "username": user.username,
        "email": user.email,
        "roles": [r.name for r in user.roles],
        **extra_info
    }), 200

@app.route('/api/login', methods=['POST'])
def user_login():
    body = request.get_json()
    email = body.get('email')
    password = body.get('password')
    if not email or not password:
        return jsonify({"message": "Email and password are required!"}), 400
    user = app.security.datastore.find_user(email=email)
    if not user:
        return jsonify({"message": "User Not Found!"}), 404
    try:
        if check_password_hash(user.password, password):
            login_user(user)
            user_roles = [r.name for r in user.roles]
            role = "admin" if 'admin' in user_roles else "user"
            return jsonify({
                "id": user.id,
                "username": user.username,
                "auth-token": user.get_auth_token(),
                "role": role
            }), 200
        else:
            return jsonify({"message": "Incorrect Password"}), 400
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@app.route('/api/register', methods=['POST'])
def create_user():
    credentials = request.get_json()
    email = credentials.get("email")
    username = credentials.get("username")
    password = credentials.get("password")
    full_name = credentials.get("full_name")
    qualification = credentials.get("qualification")
    date_of_birth = credentials.get("date_of_birth")
    if not all([email, username, password, full_name, qualification, date_of_birth]):
        return jsonify({"message": "Missing required fields"}), 400
    if app.security.datastore.find_user(email=email):
        return jsonify({"message": "User already exists!"}), 400
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=8)
    user_role = app.security.datastore.find_or_create_role(name="user")
    new_user = app.security.datastore.create_user(
        email=email,
        username=username,
        password=hashed_password,
        active=True,
        fs_uniquifier=str(uuid.uuid4()),
        roles=[user_role] 
        # roles=[app.security.datastore.find_or_create_role(name="user")] 
    )
    new_user_info = User_Info(
        email=email,
        password=hashed_password,
        role=1,  # Default role (not used by Flask-Security)
        full_name=full_name,
        qualification=qualification,
        date_of_birth=date_of_birth
    )
    db.session.add(new_user_info)
    db.session.commit()
    return jsonify({
    "message": "User created successfully",
    "user_id": new_user.id,  # Include user ID
    "email": new_user.email,
    "role": "user"
}), 201


@app.route('/api/search', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def search():
    query = request.args.get('query', '').strip().lower()
    
    if not query:
        return jsonify({"message": "No search query provided"}), 400

    # Search Users
    users = User.query.filter(
        (User.username.ilike(f"%{query}%")) | (User.email.ilike(f"%{query}%"))
    ).all()
    user_results = [{"id": u.id, "username": u.username, "email": u.email} for u in users]

    # Search Subjects
    subjects = Subject.query.filter(Subject.name.ilike(f"%{query}%")).all()
    subject_results = [{"id": s.id, "name": s.name} for s in subjects]

    # Search Quizzes
    quizzes = Quiz.query.filter(Quiz.name.ilike(f"%{query}%")).all()
    quiz_results = [{"id": q.id, "name": q.name, "quiz_date": q.quiz_date} for q in quizzes]

    return jsonify({
        "users": user_results,
        "subjects": subject_results,
        "quizzes": quiz_results
    }), 200

# ----------------------------
# Summary Endpoints
# ----------------------------

@app.route('/api/summary/admin', methods=['GET'])
@auth_required('token')
@roles_required('admin')
def admin_summary():
    try:
        scores = Score.query.all()
        if not scores:
            return jsonify({"message": "No scores found"}), 404
        avg_score = sum(s.total_score for s in scores) / len(scores)
        quiz_count = Quiz.query.count()
        user_count = User.query.count()

        subject_scores = {}
        subject_attempts = {}
        subjects = Subject.query.all()
        for subject in subjects:
            quiz_ids = [quiz.id for chapter in subject.chapters for quiz in chapter.quizes]
            subj_scores = Score.query.filter(Score.quiz_id.in_(quiz_ids)).all() if quiz_ids else []
            subject_scores[subject.name] = max((s.total_score for s in subj_scores), default=0)
            subject_attempts[subject.name] = len(subj_scores)

        return jsonify({
            "role": "admin",
            "avg_score_global": avg_score,
            "quiz_count": quiz_count,
            "user_count": user_count,
            "subject_top_scores": subject_scores,
            "subject_user_attempts": subject_attempts
        }), 200

    except Exception as e:
        app.logger.error(f"ERROR in /api/summary/admin: {str(e)}")
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

@app.route('/api/summary/user', methods=['GET'])
@auth_required('token')
@roles_required('user')
def user_summary():
    try:
        # Fetch user scores from DB
        user_scores = Score.query.filter_by(user_id=current_user.id).all()

        if not user_scores:
            return jsonify({"message": "No scores found for this user"}), 404

        # Calculate the average score (avoid division by zero)
        avg_score = sum(s.total_score for s in user_scores) / len(user_scores) if user_scores else 0
        attempts = len(user_scores)

        # Compute subject-wise attempts for this user
        subject_attempts = defaultdict(int)
        for score in user_scores:
            subject = db.session.query(Subject.name)\
                .join(Chapter, Subject.id == Chapter.subject_id)\
                .join(Quiz, Chapter.id == Quiz.chapter_id)\
                .filter(Quiz.id == score.quiz_id).scalar()
            
            if subject:
                subject_attempts[subject] += 1

        # Compute month-wise attempts
        month_attempts = defaultdict(int)
        for score in user_scores:
            month_name = score.time_stamp_of_attempt.strftime('%b')  # Convert to 'Jan', 'Feb' format
            month_attempts[month_name] += 1

        return jsonify({
            "role": "user",
            "avg_score_user": avg_score,
            "attempts": attempts,
            "subject_wise_attempts": dict(subject_attempts),
            "month_wise_attempts": dict(month_attempts)
        }), 200

    except Exception as e:
        error_message = traceback.format_exc()  # Get detailed traceback
        app.logger.error(f"ERROR in /api/summary/user: {error_message}")
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500


@app.route('/api/export_quiz_attempts', methods=['GET'])
@auth_required('token')
@roles_accepted('admin')  # Fix: Allow both Admin and User
def export_quiz_attempts_route():
    """
    Manually triggers the Celery task to export the current user's quiz attempts.
    """
    result = export_quiz_attempts.delay(current_user.id)
    return jsonify({
        "message": "Exporting quiz attempts. Check status using task ID.",
        "task_id": result.id
    }), 202

@app.route('/api/csv_result/<task_id>', methods=['GET'])
def csv_result(task_id):
    """
    Check CSV export task status and return the file if completed.
    """
    res = AsyncResult(task_id)

    if res.state == "PENDING":
        return jsonify({"status": "Pending", "message": "Your request is still being processed."}), 202
    elif res.state == "FAILURE":
        return jsonify({"status": "Failed", "message": "There was an error generating the CSV."}), 500
    elif res.result:
        file_path = f"static/{res.result}"

        # Ensure the file exists before sending
        if not os.path.exists(file_path):
            return jsonify({"status": "Failed", "message": "File not found."}), 404

        return send_from_directory('static', res.result, as_attachment=True)  # Uses just the filename

    return jsonify({"status": "Processing", "message": "Your CSV is still being generated."}), 202


@app.route('/api/send_daily_reminder', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def trigger_daily_reminder():
    """
    Manually triggers the daily reminder task for all users.
    """
    result = daily_quiz_reminder.delay()
    return jsonify({
        "message": "Daily reminders are being sent.",
        "task_id": result.id
    }), 202

@app.route('/api/send_monthly_report', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def trigger_monthly_report():
    """
    Manually triggers the monthly activity report generation and email task.
    """
    result = monthly_report.delay()
    return jsonify({
        "message": "Monthly reports are being generated and sent.",
        "task_id": result.id
    }), 202

@app.route("/api/export_all_user_performance", methods=["GET"])
def export_all_user_performance_route():
    result = export_all_user_performance.delay()
    return jsonify({
        "message": "Performance report is being generated.",
        "task_id": result.id
    }), 202


@app.route('/api/quizzes', methods=['POST'])
@auth_required('token')
@roles_required('admin')
def create_quiz():
    data = request.get_json()
    new_quiz = Quiz(
        name=data['name'],
        chapter_id=data['chapter_id'],
        quiz_date=data['quiz_date'],
        duration_time=data['duration_time']
    )
    db.session.add(new_quiz)
    db.session.commit()

    # 🔔 Send notifications via Google Chat
    users = User_Info.query.all()
    for user in users:
        quiz_status_update.delay(user.full_name, update_type="new_quiz")

    return jsonify({"message": "Quiz created and users notified!"}), 201
