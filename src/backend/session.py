# src/backend/session.py
from .init_flask import db
from datetime import datetime

class QuizSession(db.Model):
    __tablename__ = 'quiz_sessions'
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id', ondelete='CASCADE'), nullable=False)
    host_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    code = db.Column(db.String(10), unique=True, nullable=False, index=True)
    started = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    num_teams = db.Column(db.Integer, default=1, nullable=False)

    # quiz = db.relationship('Quiz', backref='sessions') # Wordt gedefinieerd in app.py
    # host = db.relationship('User', backref='hosted_sessions') # Wordt gedefinieerd in app.py

    participants = db.relationship('SessionParticipant', backref='session', lazy='selectin', cascade="all, delete-orphan") # GEWIJZIGD
    
    # NIEUWE RELATIE voor notificaties gerelateerd aan deze sessie
    invites = db.relationship('Notification', foreign_keys='Notification.session_id', backref='session_info', lazy='dynamic', cascade='all, delete-orphan')

    @property
    def is_team_mode(self):
        return self.num_teams > 1

class SessionParticipant(db.Model):
    __tablename__ = 'session_participants'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('quiz_sessions.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    team_number = db.Column(db.Integer)
    score = db.Column(db.Float, default=0.0)

    # user = db.relationship('User', backref='session_participations') # Wordt gedefinieerd in app.py

    __table_args__ = (db.UniqueConstraint('session_id', 'user_id', name='_session_user_uc'),)