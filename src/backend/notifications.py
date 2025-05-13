# src/backend/notifications.py
from .init_flask import db
from datetime import datetime, timezone # Import timezone

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True) # SET NULL if sender is deleted
    session_id = db.Column(db.Integer, db.ForeignKey('quiz_sessions.id', ondelete='CASCADE'), nullable=True) # For session invites
    notification_type = db.Column(db.String(50), nullable=False, index=True) # e.g., 'new_follower', 'session_invite'
    message = db.Column(db.Text, nullable=True) # Optional: for custom messages or system generated ones
    is_read = db.Column(db.Boolean, default=False, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships are defined via backref in User and QuizSession models

    def __repr__(self):
        return f'<Notification {self.id} for User {self.recipient_id} Type: {self.notification_type}>'

    def to_dict(self):
        sender_username = self.sender.username if self.sender else "System"
        sender_avatar = self.sender.avatar if self.sender else None
        quiz_name = None
        session_code = None

        if self.session_info: # This backref will be 'session_info' from QuizSession
            session_code = self.session_info.code
            if self.session_info.quiz:
                 quiz_name = self.session_info.quiz.name

        display_message = self.message
        if not display_message: # Auto-generate message if not explicitly set
            if self.notification_type == 'session_invite':
                if sender_username and quiz_name and session_code:
                    display_message = f"{sender_username} invited you to join the quiz '{quiz_name}'."
                elif sender_username and session_code: # Fallback if quiz name isn't available for some reason
                    display_message = f"{sender_username} invited you to join a session (Code: {session_code})."
                else:
                    display_message = "You received a session invitation." # Generic fallback
            elif self.notification_type == 'new_follower':
                 display_message = f"{sender_username} started following you."
            else:
                 display_message = f"You have a new notification of type: {self.notification_type}."
        
        # Make created_at timezone-aware (UTC) before formatting
        # This ensures the ISO string includes UTC timezone information (e.g., 'Z' or +00:00)
        aware_created_at = self.created_at.replace(tzinfo=timezone.utc)
        
        return {
            'id': self.id,
            'recipient_id': self.recipient_id,
            'sender_id': self.sender_id,
            'sender_username': sender_username,
            'sender_avatar': sender_avatar,
            'session_id': self.session_id,
            'session_code': session_code,
            'quiz_name': quiz_name,
            'notification_type': self.notification_type,
            'message': display_message,
            'is_read': self.is_read,
            'created_at': aware_created_at.isoformat() # Now it will be like '2023-10-27T12:34:56+00:00'
        }