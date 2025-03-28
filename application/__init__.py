from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_security import Security, SQLAlchemyUserDatastore
from application.config import LocalDevelopmentConfig

# Initialize extensions
db = SQLAlchemy()
mail = Mail()

def create_app():
    """Initialize Flask application"""
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)

    # Initialize extensions
    db.init_app(app)
    mail.init_app(app)

    from application.models import User, Role  # Import models here after db initialization
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore)

    with app.app_context():
        db.create_all()  # Ensure database tables are created

    return app
