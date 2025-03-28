# resources.py
from flask_restful import Api, Resource, reqparse
from flask_security import auth_required, roles_required, roles_accepted, current_user
from datetime import datetime, timedelta
from .models import db, Subject, Chapter, Quiz, Question, Score, User_Info
import math
from .utils import roles_list
from application.cache_config import cache


api = Api()

# ──────────────────────────────────────────────────────────
# SUBJECT RESOURCE
# ──────────────────────────────────────────────────────────
subject_parser = reqparse.RequestParser()
subject_parser.add_argument('name', type=str, required=True, help='Subject name is required')
subject_parser.add_argument('description', type=str, required=False, default='')

class SubjectResource(Resource):
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self, subject_id=None):
        """
        GET /api/subjects
        GET /api/subjects/<subject_id>
        Returns subjects including their chapters.
        """
        if subject_id:
            subject = Subject.query.get(subject_id)
            if not subject:
                return {"message": "Subject not found"}, 404
            chapters_list = []
            for c in subject.chapters:
                chapters_list.append({
                    "id": c.id,
                    "name": c.name,
                    "description": c.description,
                    "no_of_questions": c.no_of_questions,
                    "subject_id": c.subject_id
                })
            return {
                "id": subject.id,
                "name": subject.name,
                "description": subject.description,
                "chapters": chapters_list
            }, 200
        else:
            subjects = Subject.query.all()
            result = []
            for s in subjects:
                chapters_list = []
                for c in s.chapters:
                    chapters_list.append({
                        "id": c.id,
                        "name": c.name,
                        "description": c.description,
                        "no_of_questions": c.no_of_questions,
                        "subject_id": c.subject_id
                    })
                result.append({
                    "id": s.id,
                    "name": s.name,
                    "description": s.description,
                    "chapters": chapters_list
                })
            return result, 200

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        args = subject_parser.parse_args()
        new_subject = Subject(
            name=args['name'],
            description=args['description']
        )
        db.session.add(new_subject)
        db.session.commit()
        return {"message": "Subject created", "subject_id": new_subject.id}, 201

    @auth_required('token')
    @roles_required('admin')
    def put(self, subject_id):
        args = subject_parser.parse_args()
        subject = Subject.query.get(subject_id)
        if not subject:
            return {"message": "Subject not found"}, 404
        subject.name = args['name']
        subject.description = args['description']
        db.session.commit()
        return {"message": "Subject updated"}, 200

    @auth_required('token')
    @roles_required('admin')
    def delete(self, subject_id):
        subject = Subject.query.get(subject_id)
        if not subject:
            return {"message": "Subject not found"}, 404
        db.session.delete(subject)
        db.session.commit()
        return {"message": "Subject deleted"}, 200

# ──────────────────────────────────────────────────────────
# CHAPTER RESOURCE
# ──────────────────────────────────────────────────────────
chapter_parser = reqparse.RequestParser()
chapter_parser.add_argument('name', type=str, required=True, help='Chapter name is required')
chapter_parser.add_argument('description', type=str, required=False, default='')
chapter_parser.add_argument('no_of_questions', type=int, required=True, help='Number of questions is required')
chapter_parser.add_argument('subject_id', type=int, required=True, help='Subject ID is required')

class ChapterResource(Resource):
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self, chapter_id=None):
        if chapter_id:
            chapter = Chapter.query.get(chapter_id)
            if not chapter:
                return {"message": "Chapter not found"}, 404
            return {
                "id": chapter.id,
                "name": chapter.name,
                "description": chapter.description,
                "no_of_questions": chapter.no_of_questions,
                "subject_id": chapter.subject_id
            }, 200
        else:
            chapters = Chapter.query.all()
            result = []
            for c in chapters:
                result.append({
                    "id": c.id,
                    "name": c.name,
                    "description": c.description,
                    "no_of_questions": c.no_of_questions,
                    "subject_id": c.subject_id
                })
            return result, 200

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        args = chapter_parser.parse_args()
        new_chapter = Chapter(
            name=args['name'],
            description=args['description'],
            no_of_questions=args['no_of_questions'],
            subject_id=args['subject_id']
        )
        db.session.add(new_chapter)
        db.session.commit()
        return {"message": "Chapter created", "chapter_id": new_chapter.id}, 201

    @auth_required('token')
    @roles_required('admin')
    def put(self, chapter_id):
        args = chapter_parser.parse_args()
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {"message": "Chapter not found"}, 404
        chapter.name = args['name']
        chapter.description = args['description']
        chapter.no_of_questions = args['no_of_questions']
        chapter.subject_id = args['subject_id']
        db.session.commit()
        return {"message": "Chapter updated"}, 200

    @auth_required('token')
    @roles_required('admin')
    def delete(self, chapter_id):
        chapter = Chapter.query.get(chapter_id)
        if not chapter:
            return {"message": "Chapter not found"}, 404
        db.session.delete(chapter)
        db.session.commit()
        return {"message": "Chapter deleted"}, 200

# ──────────────────────────────────────────────────────────
# QUIZ RESOURCE (EMBEDS QUESTIONS IN GET)
# ──────────────────────────────────────────────────────────
quiz_parser = reqparse.RequestParser()
quiz_parser.add_argument('name', type=str, required=True, help='Quiz name is required')
quiz_parser.add_argument('chapter_id', type=int, required=True, help='Chapter ID is required')
quiz_parser.add_argument('quiz_date', type=str, required=True, help='Format: YYYY-MM-DD HH:MM:SS')
quiz_parser.add_argument('duration_time', type=int, required=True, help='Duration in minutes')

class QuizResource(Resource):
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self, quiz_id=None):
        """
        GET /api/quizzes
        GET /api/quizzes/<quiz_id>
        Returns quiz objects with an embedded 'questions' array.
        """
        user_roles = [r.name for r in current_user.roles]

        if quiz_id:
            quiz = Quiz.query.get(quiz_id)
            if not quiz:
                return {"message": "Quiz not found"}, 404

            question_list = []
            for question in quiz.questions:
                question_list.append({
                    "id": question.id,
                    "quiz_id": question.quiz_id,
                    "name": question.name,
                    "question_statement": question.question_statement,
                    "option_1": question.option_1,
                    "option_2": question.option_2,
                    "option_3": question.option_3,
                    "option_4": question.option_4,
                    "correct_option": question.correct_option,
                    "marks": question.marks
                })

            return {
                "id": quiz.id,
                "name": quiz.name,
                "chapter_id": quiz.chapter_id,
                "quiz_date": quiz.quiz_date.isoformat() if quiz.quiz_date else None,
                "duration_time": str(quiz.duration_time),
                "questions": question_list
            }, 200

        else:
            # Admins see all quizzes
            if 'admin' in user_roles:
                quizzes = Quiz.query.all()
            else:
                # For normal user, either show all or filter. 
                # If you do not store user_id in Quiz, just return all.
                quizzes = Quiz.query.all()

            result = []
            for q in quizzes:
                question_list = []
                for question in q.questions:
                    question_list.append({
                        "id": question.id,
                        "quiz_id": question.quiz_id,
                        "name": question.name,
                        "question_statement": question.question_statement,
                        "option_1": question.option_1,
                        "option_2": question.option_2,
                        "option_3": question.option_3,
                        "option_4": question.option_4,
                        "correct_option": question.correct_option,
                        "marks": question.marks
                    })

                result.append({
                    "id": q.id,
                    "name": q.name,
                    "chapter_id": q.chapter_id,
                    "quiz_date": q.quiz_date.isoformat() if q.quiz_date else None,
                    "duration_time": str(q.duration_time),
                    "questions": question_list
                })
            return result, 200

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        args = quiz_parser.parse_args()
        try:
            quiz_date = datetime.strptime(args['quiz_date'], "%Y-%m-%d %H:%M:%S")
        except:
            return {"message": "Invalid date format"}, 400

        duration = timedelta(minutes=args['duration_time'])
        new_quiz = Quiz(
            name=args['name'],
            chapter_id=args['chapter_id'],
            quiz_date=quiz_date,
            duration_time=duration
        )
        db.session.add(new_quiz)
        db.session.commit()
        return {"message": "Quiz created", "quiz_id": new_quiz.id}, 201

    @auth_required('token')
    @roles_required('admin')
    def put(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"message": "Quiz not found"}, 404
        args = quiz_parser.parse_args()
        quiz.name = args['name']
        quiz.chapter_id = args['chapter_id']
        try:
            quiz.quiz_date = datetime.strptime(args['quiz_date'], "%Y-%m-%d %H:%M:%S")
        except:
            return {"message": "Invalid date format"}, 400
        quiz.duration_time = timedelta(minutes=args['duration_time'])
        db.session.commit()
        return {"message": "Quiz updated"}, 200

    @auth_required('token')
    @roles_required('admin')
    def delete(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"message": "Quiz not found"}, 404
        db.session.delete(quiz)
        db.session.commit()
        return {"message": "Quiz deleted"}, 200

# ──────────────────────────────────────────────────────────
# QUESTION RESOURCE
# ──────────────────────────────────────────────────────────
question_parser = reqparse.RequestParser()
question_parser.add_argument('quiz_id', type=int, required=True, help='Quiz ID is required')
question_parser.add_argument('name', type=str, required=True, help='Short question name is required')
question_parser.add_argument('question_statement', type=str, required=True, help='Question statement is required')
question_parser.add_argument('option_1', type=str, required=True)
question_parser.add_argument('option_2', type=str, required=True)
question_parser.add_argument('option_3', type=str, required=True)
question_parser.add_argument('option_4', type=str, required=True)
question_parser.add_argument('correct_option', type=int, required=True, help='1, 2, 3, or 4')
question_parser.add_argument('marks', type=int, required=False, default=1)

class QuestionResource(Resource):
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self, question_id=None):
        if question_id:
            q = Question.query.get(question_id)
            if not q:
                return {"message": "Question not found"}, 404
            return {
                "id": q.id,
                "quiz_id": q.quiz_id,
                "name": q.name,
                "question_statement": q.question_statement,
                "option_1": q.option_1,
                "option_2": q.option_2,
                "option_3": q.option_3,
                "option_4": q.option_4,
                "correct_option": q.correct_option,
                "marks": q.marks
            }, 200
        else:
            questions = Question.query.all()
            result = []
            for qq in questions:
                result.append({
                    "id": qq.id,
                    "quiz_id": qq.quiz_id,
                    "name": qq.name,
                    "question_statement": qq.question_statement,
                    "option_1": qq.option_1,
                    "option_2": qq.option_2,
                    "option_3": qq.option_3,
                    "option_4": qq.option_4,
                    "correct_option": qq.correct_option,
                    "marks": qq.marks
                })
            return result, 200

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        args = question_parser.parse_args()
        new_question = Question(
            quiz_id=args['quiz_id'],
            name=args['name'],
            question_statement=args['question_statement'],
            option_1=args['option_1'],
            option_2=args['option_2'],
            option_3=args['option_3'],
            option_4=args['option_4'],
            correct_option=args['correct_option'],
            marks=args['marks']
        )
        db.session.add(new_question)
        db.session.commit()
        return {"message": "Question created", "question_id": new_question.id}, 201

    @auth_required('token')
    @roles_required('admin')
    def put(self, question_id):
        question = Question.query.get(question_id)
        if not question:
            return {"message": "Question not found"}, 404
        args = question_parser.parse_args()
        question.quiz_id = args['quiz_id']
        question.name = args['name']
        question.question_statement = args['question_statement']
        question.option_1 = args['option_1']
        question.option_2 = args['option_2']
        question.option_3 = args['option_3']
        question.option_4 = args['option_4']
        question.correct_option = args['correct_option']
        question.marks = args['marks']
        db.session.commit()
        return {"message": "Question updated"}, 200

    @auth_required('token')
    @roles_required('admin')
    def delete(self, question_id):
        question = Question.query.get(question_id)
        if not question:
            return {"message": "Question not found"}, 404
        db.session.delete(question)
        db.session.commit()
        return {"message": "Question deleted"}, 200

# ──────────────────────────────────────────────────────────
# QUIZ ATTEMPT RESOURCE
# ──────────────────────────────────────────────────────────
attempt_parser = reqparse.RequestParser()
attempt_parser.add_argument('answers', type=dict, required=True, help='Answers must be a dict of question_id -> selected_option')

class AttemptResource(Resource):
    @auth_required('token')
    @roles_required('user')
    def post(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"message": "Quiz not found"}, 404

        args = attempt_parser.parse_args()
        answers = args['answers']

        total_score = 0
        for q_id, chosen_option in answers.items():
            question = Question.query.get(q_id)
            if question and question.quiz_id == quiz.id:
                if question.correct_option == chosen_option:
                    total_score += question.marks

        new_score = Score(
            user_id=current_user.id,
            quiz_id=quiz.id,
            total_score=total_score,
            time_stamp_of_attempt=datetime.now()
        )
        db.session.add(new_score)
        db.session.commit()

        return {
            "message": "Quiz attempt recorded",
            "score": total_score
        }, 200

# ──────────────────────────────────────────────────────────
# SCORES RESOURCE
# ──────────────────────────────────────────────────────────
class ScoreResource(Resource):
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self, score_id=None):
        if score_id:
            score = Score.query.get(score_id)
            if not score:
                return {"message": "Score not found"}, 404
            # Non-admin can only see their own score
            if "admin" not in [r.name for r in current_user.roles]:
                if score.user_id != current_user.id:
                    return {"message": "Not authorized"}, 403
            return {
                "id": score.id,
                "user_id": score.user_id,
                "quiz_id": score.quiz_id,
                "total_score": score.total_score,
                "time_stamp_of_attempt": score.time_stamp_of_attempt.isoformat()
            }, 200
        else:
            if "admin" in [r.name for r in current_user.roles]:
                all_scores = Score.query.all()
            else:
                all_scores = Score.query.filter_by(user_id=current_user.id).all()
            if not all_scores:
                return [], 200  # or a 404 with a message
            result = []
            for sc in all_scores:
                result.append({
                    "id": sc.id,
                    "user_id": sc.user_id,
                    "quiz_id": sc.quiz_id,
                    "total_score": sc.total_score,
                    "time_stamp_of_attempt": sc.time_stamp_of_attempt.isoformat()
                })
            return result, 200


class AdminSummaryResource(Resource):
    """
    GET /api/admin/summary
    Only for admin users. Returns global stats across all users/quizzes.
    """
    @auth_required('token')
    @roles_required('admin')  # strictly admin
    def get(self):
        scores = Score.query.all()
        if not scores:
            return {"message": "No scores found"}, 404

        avg_score = sum(s.total_score for s in scores) / len(scores)
        quiz_count = Quiz.query.count()
        user_count = User_Info.query.count()

        return {
            "role": "admin",
            "avg_score_global": avg_score,
            "quiz_count": quiz_count,
            "user_count": user_count
            # Add more data as needed, e.g. subject-level breakdown
        }, 200


class UserSummaryResource(Resource):
    """
    GET /api/user/summary
    Only for normal user. Returns stats for the *current* user only.
    """
    @auth_required('token')
    @roles_required('user')  # strictly user
    def get(self):
        user_scores = Score.query.filter_by(user_id=current_user.id).all()
        if not user_scores:
            return {"message": "No scores found for this user"}, 404

        avg_score = sum(s.total_score for s in user_scores) / len(user_scores)
        attempts = len(user_scores)
        # e.g. subject wise attempts, monthly attempts, etc.

        return {
            "role": "user",
            "avg_score_user": avg_score,
            "attempts": attempts
            # Add more data if needed
        }, 200




# ──────────────────────────────────────────────────────────
# ADDING RESOURCES TO API
# ──────────────────────────────────────────────────────────
api.add_resource(SubjectResource, '/api/subjects', '/api/subjects/<int:subject_id>')
api.add_resource(ChapterResource, '/api/chapters', '/api/chapters/<int:chapter_id>')
api.add_resource(QuizResource, '/api/quizzes', '/api/quizzes/<int:quiz_id>')
api.add_resource(QuestionResource, '/api/questions', '/api/questions/<int:question_id>')
api.add_resource(AttemptResource, '/api/quizzes/<int:quiz_id>/attempt')
api.add_resource(ScoreResource, '/api/scores', '/api/scores/<int:score_id>')
api.add_resource(AdminSummaryResource, '/api/admin/summary')
api.add_resource(UserSummaryResource,  '/api/user/summary')