"""
Defines the database models for answers to different types of questions.
Uses SQLAlchemy's single table inheritance pattern for different answer types (Text Input, Multiple Choice, Slider).
"""
from .app import db
from datetime import datetime

class Answer(db.Model):
    """
    Base class for all answer types.

    This is the parent class in the single table inheritance pattern for answers.
    It stores common attributes for all answer types, such as the user who provided the answer,
    the question being answered, and when the answer was submitted.
    """
    __tablename__ = 'answers'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    answered_at = db.Column(db.DateTime, default=datetime.utcnow)
    answer_type = db.Column(db.String(50))

    __mapper_args__ = {
        'polymorphic_identity': 'answer',
        'polymorphic_on': answer_type
    }

class TextInputAnswer(Answer):
    """
    Represents a text-based answer to a question.

    This class extends the base Answer class to store the text content provided by the user.
    """
    __tablename__ = 'text_input_answers'
    id = db.Column(db.Integer, db.ForeignKey('answers.id'), primary_key=True)
    text = db.Column(db.String(1000))

    __mapper_args__ = {'polymorphic_identity': 'text_input'}

class MultipleChoiceAnswer(Answer):
    """
    Represents a multiple-choice answer to a question.

    This class extends the base Answer class to store which option the user selected
    from a set of predefined choices.
    """
    __tablename__ = 'multiple_choice_answers'
    id = db.Column(db.Integer, db.ForeignKey('answers.id'), primary_key=True)
    option_id = db.Column(db.Integer, db.ForeignKey('multiple_choice_options.id'))

    option = db.relationship('MultipleChoiceOption', backref='answers')

    __mapper_args__ = {'polymorphic_identity': 'multiple_choice'}

class SliderAnswer(Answer):
    """
    Represents a numeric answer to a slider-based question.

    This class extends the base Answer class to store the numeric value selected by the user
    on a slider with a defined range.
    """
    __tablename__ = 'slider_answers'
    id = db.Column(db.Integer, db.ForeignKey('answers.id'), primary_key=True)
    value = db.Column(db.Integer, nullable=False)

    __mapper_args__ = {'polymorphic_identity': 'slider'}
