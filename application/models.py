from .database import db
from flask_security import UserMixin, RoleMixin
from datetime import datetime, timezone

class User(db.Model, UserMixin):
    # required for flask security
    id = db.Column(db.Integer, primary_key = True)
    email = db.Column(db.String, unique = True, nullable = False)
    username = db.Column(db.String, unique = True, nullable = False)
    password = db.Column(db.String, nullable = False)
    fs_uniquifier = db.Column(db.String, unique = True, nullable = False)
    active = db.Column(db.Boolean, nullable = False)
    roles = db.relationship('Role', backref = 'bearer', secondary = 'users_roles')
   

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String, unique = True, nullable = False)
    description = db.Column(db.String)

# many-to-many
class UsersRoles(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

class User_Info(db.Model):
    __tablename__ = "user_info"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    role = db.Column(db.Integer, default=1)
    full_name = db.Column(db.String, nullable=False)
    qualification = db.Column(db.String, nullable=False) 
    date_of_birth = db.Column(db.String, nullable=False)  
    scores = db.relationship("Score", cascade = "all,delete", backref="user_info", lazy = True)
    summary_charts = db.relationship("Summary_Charts", cascade = "all,delete", backref="user_info", lazy = True)

  
class Subject(db.Model):
    __tablename__ = "subject"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)    
    chapters = db.relationship("Chapter", cascade = "all,delete", backref="subject", lazy = True)

class Chapter(db.Model):
    __tablename__ = "chapter"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)
    no_of_questions = db.Column(db.Integer, nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey("subject.id"), nullable=False)
    quizes = db.relationship("Quiz", cascade = "all,delete", backref="chapter", lazy = True)

class Quiz(db.Model):
    __tablename__ = "quiz"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey("chapter.id"), nullable=False)
    quiz_date = db.Column(db.DateTime, nullable=False)
    duration_time = db.Column(db.Interval, nullable=False)    
    questions = db.relationship("Question", cascade = "all,delete", backref="quiz", lazy = True)
    scores = db.relationship("Score", cascade = "all,delete", backref="quiz", lazy = True)
    summary_charts = db.relationship("Summary_Charts", cascade = "all,delete", backref="quiz", lazy = True)

class Question(db.Model):
    __tablename__ = "question"
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quiz.id"), nullable=False)
    name = db.Column(db.String, nullable=False)
    question_statement = db.Column(db.String, nullable=False)
    option_1 = db.Column(db.String, nullable=False)
    option_2 = db.Column(db.String, nullable=False)
    option_3 = db.Column(db.String, nullable=False)
    option_4 = db.Column(db.String, nullable=False)
    correct_option = db.Column(db.Integer, nullable=False)
    marks = db.Column(db.Integer, nullable=False, default=1)



class Score(db.Model):
    __tablename__ = "score"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user_info.id"), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quiz.id"), nullable=False)
    total_score  = db.Column(db.Integer, nullable=False)
    time_stamp_of_attempt = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)  
    )
    

class Summary_Charts(db.Model):
    __tablename__ = "summary_charts"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user_info.id"), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quiz.id"), nullable=False)
    total_score  = db.Column(db.Integer, nullable=False)