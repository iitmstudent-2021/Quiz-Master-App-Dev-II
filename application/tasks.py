# tasks.py
from celery import shared_task
import requests
from application.models import User_Info, Quiz, Score, User
from flask_mail import Message
from application import db, mail
from flask import render_template
import datetime
import csv
import os

@shared_task(ignore_results=False, name="daily_quiz_reminder")
def daily_quiz_reminder():
    users = User_Info.query.all()
    new_quizzes = Quiz.query.filter(Quiz.quiz_date >= datetime.datetime.utcnow().date()).all()
    three_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=3)

    if not new_quizzes:
        return "No new quizzes today."

    sent_count = 0
    for user in users:
        recent_attempts = Score.query.filter(
            Score.user_id == user.id,
            Score.time_stamp_of_attempt >= three_days_ago
        ).first()

        if not recent_attempts:
            message_body = f"Hello {user.full_name},\n\nYou haven't taken any quizzes recently! New quizzes are available. Visit your dashboard to attempt them."

            try:
                msg = Message("Daily Quiz Reminder", recipients=[user.email])
                msg.body = message_body
                mail.send(msg)
                sent_count += 1
            except Exception as e:
                print(f" Failed to send email to {user.email}: {e}")

    return f"Daily Reminders Sent! ({sent_count} users notified)"

@shared_task(ignore_results=False, name="monthly_report")
def monthly_report():
    from flask import current_app
    users = User_Info.query.all()
    sent_count = 0

    with current_app.app_context():
        for user in users:
            user_scores = Score.query.filter_by(user_id=user.id).all()

            if not user_scores:
                continue

            total_attempts = len(user_scores)
            total_score = sum(score.total_score for score in user_scores)
            avg_score = total_score / total_attempts if total_attempts else 0

            quiz_list = [
                {
                    "name": score.quiz.name,
                    "date": score.time_stamp_of_attempt.strftime("%Y-%m-%d"),
                    "score": score.total_score
                }
                for score in user_scores
            ]

            user_data = {
                "username": user.full_name,
                "total_attempts": total_attempts,
                "quizzes": quiz_list
            }

            try:
                message_body = render_template("mail_details.html", data=user_data)
                msg = Message(" Your Monthly Quiz Report", recipients=[user.email])
                msg.body = message_body
                msg.html = message_body
                mail.send(msg)
                sent_count += 1
            except Exception as e:
                print(f" Failed to send monthly report to {user.email}: {e}")

    return f"Monthly Reports Sent! ({sent_count} users notified)"

@shared_task(bind=True)
def export_quiz_attempts(self, user_id):
    user = User_Info.query.get(user_id)
    if not user:
        return "no_attempts.csv"

    attempts = Score.query.filter_by(user_id=user_id).all()

    if not attempts:
        return "no_attempts.csv"

    static_dir = os.path.join(os.getcwd(), "static")
    if not os.path.exists(static_dir):
        os.makedirs(static_dir)

    file_name = f"quiz_attempts_{user.full_name}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.csv"
    file_path = f'static/{file_name}'

    with open(file_path, "w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["Quiz ID", "Quiz Name", "Date of Attempt", "Total Score"])
        for attempt in attempts:
            writer.writerow([attempt.quiz_id, attempt.quiz.name, attempt.time_stamp_of_attempt, attempt.total_score])

    return file_name

@shared_task(ignore_results=False, name="export_all_user_performance")
def export_all_user_performance():
    static_dir = os.path.join(os.getcwd(), "static")
    if not os.path.exists(static_dir):
        os.makedirs(static_dir)

    file_name = f"user_performance_report_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.csv"
    file_path = os.path.join(static_dir, file_name)

    with open(file_path, "w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(["User ID", "Username", "Quizzes Taken", "Average Score"])

        users = User.query.all()
        for user in users:
            attempts = Score.query.filter_by(user_id=user.id).all()
            total = len(attempts)
            avg = round(sum(a.total_score for a in attempts) / total, 2) if total else 0.0
            writer.writerow([user.id, user.username, total, avg])

    return file_name

@shared_task(ignore_results=False, name="quiz_status_update")
def quiz_status_update(username, update_type="new_quiz"):
    """
    Sends a Google Chat notification to the user regarding quiz updates.
    
    update_type can be:
    - "new_quiz"
    - "reminder"
    - "result"
    """
    base_url = "http://127.0.0.1:5000"

    if update_type == "new_quiz":
        message = f"📢 Hi {username}, a new quiz has been published! Head over to {base_url} to check it out."
    elif update_type == "reminder":
        message = f"⏰ Hey {username}, don't forget to attempt your pending quizzes! Visit {base_url} to stay on track."
    elif update_type == "result":
        message = f"📊 Hi {username}, your quiz results are now available. Log in to {base_url} to see your performance!"
    else:
        message = f"👋 Hi {username}, there is an update on your quiz dashboard. Visit {base_url} for more info."

    webhook_url = "https://chat.googleapis.com/v1/spaces/AAAAVOV8Gb4/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=h6tP9jF89G3Loc6ZeqTiHj_jJ-MbhmbBmaj_8wYTcjo"
    response = requests.post(webhook_url, json={"text": message})

    print(f"✅ Google Chat Notification sent to {username}: {response.status_code}")
    return f"Notification sent to {username}"


@shared_task(ignore_results=False, name="notify_all_users_reminder")
def notify_all_users_reminder():
    """
    Weekly reminder to all users about quiz activity.
    """
    from application.models import User_Info

    users = User_Info.query.all()
    count = 0

    for user in users:
        quiz_status_update.delay(user.full_name, update_type="weekly_reminder")
        count += 1

    return f"✅ Weekly reminders sent to {count} users."
