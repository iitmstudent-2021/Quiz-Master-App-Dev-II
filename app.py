from flask import Flask 
from application.database import db 
from application.models import User, Role 
from application.resources import api
from application.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore
from werkzeug.security import generate_password_hash
from application.celery_init import celery_init_app
from celery.schedules import crontab
from application.tasks import notify_all_users_reminder
from application.cache_config import setup_cache 
from application.cache_config import cache


def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)

    db.init_app(app)
    api.init_app(app)
    cache.init_app(app)

    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore)

    setup_cache(app) 

    app.app_context().push()
    return app


app = create_app()
celery = celery_init_app(app)
celery.autodiscover_tasks()

with app.app_context():
    db.create_all()

    app.security.datastore.find_or_create_role(name="admin", description="Superuser of app")
    app.security.datastore.find_or_create_role(name="user", description="General user of app")
    db.session.commit()

    if not app.security.datastore.find_user(email="user0@admin.com"):
        admin_role = app.security.datastore.find_or_create_role(name="admin")
        app.security.datastore.create_user(
            email="user0@admin.com",
            username="admin01",
            password=generate_password_hash("1234"),
            roles=[admin_role]
        )
        
    if not app.security.datastore.find_user(email="user1@user.com"):
        user_role = app.security.datastore.find_or_create_role(name="user")
        app.security.datastore.create_user(
            email="user1@user.com",
            username="user01",
            password=generate_password_hash("1234"),
            roles=[user_role]
        )
    db.session.commit()

from application.routes import *

@celery.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        # crontab(hour=23, minute=34),
        crontab(minute='*'),  
        notify_all_users_reminder.s(),
        name="Weekly Quiz Reminder"
    )

if __name__ == "__main__":
    app.run()
