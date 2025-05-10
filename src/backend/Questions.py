from .init_flask import db
from datetime import datetime

"""
Questions
"""
class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    question_text = db.Column(db.String(1000), nullable=False)
    question_type = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __mapper_args__ = {
        'polymorphic_identity': 'question',
        'polymorphic_on': question_type
    }

class TextInputQuestion(Question):
    __tablename__ = 'text_input_questions'
    id = db.Column(db.Integer, db.ForeignKey('questions.id'), primary_key=True)
    max_length = db.Column(db.Integer)

    correct_answer = db.Column(db.String(255))

    __mapper_args__ = {'polymorphic_identity': 'text_input'}


class MultipleChoiceQuestion(Question):
    __tablename__ = 'multiple_choice_questions'
    id = db.Column(db.Integer, db.ForeignKey('questions.id'), primary_key=True)
    options = db.relationship('MultipleChoiceOption',
                              backref='question',
                              lazy=True,
                              cascade='all, delete-orphan')

    __mapper_args__ = {'polymorphic_identity': 'multiple_choice'}

class SliderQuestion(Question):
    __tablename__ = 'slider_questions'
    id = db.Column(db.Integer, db.ForeignKey('questions.id'), primary_key=True)
    min_value = db.Column(db.Integer, nullable=False)
    max_value = db.Column(db.Integer, nullable=False)
    step = db.Column(db.Integer, default=1)

    correct_value = db.Column(db.Integer)

    __mapper_args__ = {'polymorphic_identity': 'slider'}    


"""
OPTIONS
"""
class MultipleChoiceOption(db.Model):
    __tablename__ = 'multiple_choice_options'
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('multiple_choice_questions.id', ondelete='CASCADE'), nullable=False)
    text = db.Column(db.String(255), nullable=False)
    is_correct = db.Column(db.Boolean, default=False)