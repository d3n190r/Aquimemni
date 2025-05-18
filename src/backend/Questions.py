# src/backend/Questions.py
"""
Defines the database models for questions and their variants (Text Input, Multiple Choice, Slider).
Uses SQLAlchemy's single table inheritance pattern for different question types.
"""
from .init_flask import db
from datetime import datetime

class Question(db.Model):
    """
    Base class for all question types.

    This is the parent class in the single table inheritance pattern for questions.
    It stores common attributes for all question types, such as the question text,
    the quiz it belongs to, and when it was created.
    """
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id', ondelete='CASCADE'), nullable=False)
    question_text = db.Column(db.String(1000), nullable=False)
    question_type = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __mapper_args__ = {
        'polymorphic_identity': 'question',
        'polymorphic_on': question_type
    }

class TextInputQuestion(Question):
    """
    Represents a question that requires a text input answer.

    This class extends the base Question class to include properties specific to text input questions,
    such as the maximum length of the answer and the correct answer text.
    """
    __tablename__ = 'text_input_questions'
    id = db.Column(db.Integer, db.ForeignKey('questions.id', ondelete='CASCADE'), primary_key=True)
    max_length = db.Column(db.Integer, default=255)
    correct_answer = db.Column(db.String(255))

    __mapper_args__ = {'polymorphic_identity': 'text_input'}

class MultipleChoiceQuestion(Question):
    """
    Represents a multiple-choice question with predefined options.

    This class extends the base Question class to include a relationship with multiple choice options.
    It provides properties to easily access the correct option's ID and text.
    """
    __tablename__ = 'multiple_choice_questions'
    id = db.Column(db.Integer, db.ForeignKey('questions.id', ondelete='CASCADE'), primary_key=True)
    options = db.relationship('MultipleChoiceOption',
                              backref='question', 
                              lazy='selectin',  # GEWIJZIGD
                              cascade='all, delete-orphan')

    __mapper_args__ = {'polymorphic_identity': 'multiple_choice'}

    @property
    def correct_option_id(self):
        """
        Gets the ID of the correct option for this question.

        Returns:
            int or None: The ID of the correct option if one exists, otherwise None.
        """
        for option in self.options: # Directe iteratie dankzij lazy='selectin'
            if option.is_correct:
                return option.id
        return None

    @property
    def correct_answer_text(self):
        """
        Gets the text of the correct option for this question.

        Returns:
            str or None: The text of the correct option if one exists, otherwise None.
        """
        for option in self.options: # Directe iteratie
            if option.is_correct:
                return option.text
        return None

class SliderQuestion(Question):
    """
    Represents a question that requires selecting a value on a slider.

    This class extends the base Question class to include properties specific to slider questions,
    such as the minimum and maximum values, step size, and the correct value.
    """
    __tablename__ = 'slider_questions'
    id = db.Column(db.Integer, db.ForeignKey('questions.id', ondelete='CASCADE'), primary_key=True)
    min_value = db.Column(db.Integer, nullable=False, default=0)
    max_value = db.Column(db.Integer, nullable=False, default=10)
    step = db.Column(db.Integer, default=1)
    correct_value = db.Column(db.Integer)

    __mapper_args__ = {'polymorphic_identity': 'slider'}

class MultipleChoiceOption(db.Model):
    """
    Represents an option for a multiple-choice question.

    Each option has text content and a flag indicating whether it is the correct answer.
    Multiple options are associated with a single MultipleChoiceQuestion.
    """
    __tablename__ = 'multiple_choice_options'
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('multiple_choice_questions.id', ondelete='CASCADE'), nullable=False)
    text = db.Column(db.String(255), nullable=False)
    is_correct = db.Column(db.Boolean, default=False, nullable=False)
