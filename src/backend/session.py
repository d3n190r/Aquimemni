# src/backend/session.py
"""
Defines the database models for quiz sessions and session participants.
Handles the relationship between quizzes, users, and their participation in quiz sessions.
"""
from .init_flask import db
from datetime import datetime

class QuizSession(db.Model):
    """
    Represents a quiz session that users can join and participate in.

    A quiz session is created by a host user for a specific quiz and can be joined by multiple participants.
    Sessions can be configured for individual or team-based participation.
    """
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
        """
        Determines if the session is configured for team-based participation.

        Returns:
            bool: True if the session has more than one team, False otherwise.
        """
        return self.num_teams > 1

class SessionParticipant(db.Model):
    """
    Represents a user's participation in a quiz session.

    Tracks which user is participating in which session, their team assignment (if applicable),
    and their score in the quiz.
    """
    __tablename__ = 'session_participants'
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('quiz_sessions.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    team_number = db.Column(db.Integer)
    score = db.Column(db.Float, default=0.0)

    # user = db.relationship('User', backref='session_participations') # Wordt gedefinieerd in app.py

    __table_args__ = (db.UniqueConstraint('session_id', 'user_id', name='_session_user_uc'),)
