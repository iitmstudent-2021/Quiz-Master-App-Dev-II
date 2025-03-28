from flask_restful import Api, Resource
from flask_security import auth_required, roles_accepted, current_user
from application.models import Quiz, Subject, Chapter
from application.database import db
from application.utils import roles_list
from flask_caching import Cache
from flask import current_app

api = Api()
cache = Cache(config={
    'CACHE_TYPE': 'RedisCache',
    'CACHE_REDIS_HOST': 'localhost',
    'CACHE_REDIS_PORT': 6379,
    'CACHE_REDIS_DB': 0,
    'CACHE_DEFAULT_TIMEOUT': 300
})
cache.init_app(current_app)

# ─────────────────────────────────────────────────────
# CACHED QUIZZES API (Admin + User)
# ─────────────────────────────────────────────────────
class CachedQuizList(Resource):
    @auth_required('token')
    @roles_accepted('admin', 'user')
    @cache.cached(timeout=300, key_prefix="all_quizzes_cache")
    def get(self):
        quizzes = Quiz.query.all()
        result = []
        for q in quizzes:
            result.append({
                "id": q.id,
                "name": q.name,
                "chapter_id": q.chapter_id,
                "quiz_date": q.quiz_date.isoformat() if q.quiz_date else None,
                "duration_time": str(q.duration_time)
            })
        return result, 200

# ─────────────────────────────────────────────────────
# CACHED SUBJECTS API (Admin + User)
# ─────────────────────────────────────────────────────
class CachedSubjects(Resource):
    @auth_required('token')
    @roles_accepted('admin', 'user')
    @cache.cached(timeout=300, key_prefix="subjects_cache")
    def get(self):
        subjects = Subject.query.all()
        data = []
        for s in subjects:
            chapters = [{
                "id": c.id,
                "name": c.name,
                "description": c.description,
                "no_of_questions": c.no_of_questions
            } for c in s.chapters]

            data.append({
                "id": s.id,
                "name": s.name,
                "description": s.description,
                "chapters": chapters
            })
        return data, 200


# ─────────────────────────────────────────────────────
# Resource Bindings
# ─────────────────────────────────────────────────────
api.add_resource(CachedQuizList, '/api/cached/quizzes')
api.add_resource(CachedSubjects, '/api/cached/subjects')
