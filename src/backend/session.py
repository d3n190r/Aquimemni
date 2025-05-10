# src/backend/session.py
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
    num_teams = db.Column(db.Integer, default=1, nullable=False) # Default to 1 (individual mode)

    # Modified line:
    quiz = db.relationship('Quiz', backref=db.backref('sessions', cascade='all, delete-orphan', lazy='dynamic'))
    # End of modified line

    host = db.relationship('User', backref='hosted_sessions')
    participants = db.relationship('SessionParticipant', backref='session', cascade="all, delete-orphan")

    # Helper property to check if it's team mode (>1 team)
    @property
    def is_team_mode(self):
        return self.num_teams > 1


class SessionParticipant(db.Model):
    __tablename__ = 'session_participants'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('quiz_sessions.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    team_number = db.Column(db.Integer) # 1, 2, 3... or None if num_teams is 1
    score = db.Column(db.Float, default=0.0)

    user = db.relationship('User', backref='session_participations')

    # Add a unique constraint to ensure a user can only join a session once
    __table_args__ = (db.UniqueConstraint('session_id', 'user_id', name='_session_user_uc'),)
