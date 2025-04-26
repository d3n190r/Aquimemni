from .init_flask import db
from datetime import datetime

class QuizSession(db.Model):
    __tablename__ = 'quiz_sessions'
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    host_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    code = db.Column(db.String(10), unique=True, nullable=False)
    started = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    team_mode = db.Column(db.Boolean, default=False)  # NEW FIELD!!

    quiz = db.relationship('Quiz', backref='sessions')
    host = db.relationship('User', backref='hosted_sessions')
    participants = db.relationship('SessionParticipant', backref='session', cascade="all, delete-orphan")


class SessionParticipant(db.Model):
    __tablename__ = 'session_participants'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('quiz_sessions.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    team = db.Column(db.String(20))  # 'A', 'B' or None for individual mode
    score = db.Column(db.Float, default=0.0)

    user = db.relationship('User', backref='session_participations')
