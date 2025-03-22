from .app import db
from datetime import datetime

class Answer(db.Model):
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
    __tablename__ = 'text_input_answers'
    id = db.Column(db.Integer, db.ForeignKey('answers.id'), primary_key=True)
    text = db.Column(db.String(1000))

    __mapper_args__ = {'polymorphic_identity': 'text_input'}

class MultipleChoiceAnswer(Answer):
    __tablename__ = 'multiple_choice_answers'
    id = db.Column(db.Integer, db.ForeignKey('answers.id'), primary_key=True)
    option_id = db.Column(db.Integer, db.ForeignKey('multiple_choice_options.id'))

    option = db.relationship('MultipleChoiceOption', backref='answers')

    __mapper_args__ = {'polymorphic_identity': 'multiple_choice'}

class SliderAnswer(Answer):
    __tablename__ = 'slider_answers'
    id = db.Column(db.Integer, db.ForeignKey('answers.id'), primary_key=True)
    value = db.Column(db.Integer, nullable=False)

    __mapper_args__ = {'polymorphic_identity': 'slider'}