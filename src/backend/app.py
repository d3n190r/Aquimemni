# src/backend/app.py
import random  # For session code generation
import string
from datetime import datetime

from flask import Blueprint, request, jsonify, session
from flask_cors import CORS  # Add CORS support
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError  # Import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash

from .Questions import (
    Question,
    TextInputQuestion,
    MultipleChoiceOption,
    SliderQuestion,
    MultipleChoiceQuestion
)
from .init_flask import db, main_bp
# --- Import Updated Models ---
from .session import (
    QuizSession,
    SessionParticipant,
)

followers = db.Table('followers',
                     db.Column('follower_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
                     db.Column('followed_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
                     )


# ------------------------------
# DATABASE MODELLEN (User, Quiz - unchanged)
# ------------------------------

class User(db.Model):
    """
    User Model
    Slaat gebruikersgegevens op.
    - id: Primaire sleutel
    - username: Unieke gebruikersnaam
    - password_hash: Gehashte wachtwoord
    - avatar: gekozen avatar
    """
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    bio = db.Column(db.Text)
    avatar = db.Column(db.Integer)
    registered_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    followed = db.relationship(
        'User', secondary=followers,
        primaryjoin=(followers.c.follower_id == id),
        secondaryjoin=(followers.c.followed_id == id),
        backref=db.backref('followers', lazy='dynamic'), lazy='dynamic'
    )
    quizzes = db.relationship('Quiz',
                             backref="user",
                             lazy=True,
                             cascade='all, delete-orphan')  # Cascade toegevoegd

    def is_following(self, user):
        # Ensure user object is valid before filtering
        if not user or not user.id:
             return False
        return self.followed.filter(followers.c.followed_id == user.id).count() > 0

    def follow(self, user):
        if user and user.id and not self.is_following(user):
            self.followed.append(user)

    def unfollow(self, user):
        if user and user.id and self.is_following(user):
            self.followed.remove(user)


class Quiz(db.Model):
    """
    Quiz Model
    Houdt vast welke quiz door welke gebruiker is aangemaakt.
    - id: Primaire sleutel voor de quiz
    - user_id: Buitenlandse sleutel naar de gebruiker
    - name: Naam van de quiz
    - created_at: Datum en tijd van aanmaak
    """
    __tablename__ = 'quizzes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    questions = db.relationship('Question', backref='quiz', lazy=True, cascade='all, delete-orphan')


# ------------------------------
# ROUTES / ENDPOINTS
# ------------------------------

# --- User Search, Follow/Unfollow, Auth ---
# ... (Houd bestaande routes ongewijzigd) ...
@main_bp.route('/users/search', methods=['GET'])
def search_users():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    current_user = User.query.get(session['user_id'])
    if not current_user: # Handle case where user might have been deleted
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    search_query = request.args.get('q', '').strip().lower()

    if not search_query:
        return jsonify([]), 200

    sanitized_query = search_query.replace('%', '\\%').replace('_', '\\_')

    users = User.query.filter(
        User.username.ilike(f'{sanitized_query}%'),
        User.id != current_user.id
    ).order_by(
        User.username.asc()
    ).limit(10).all()

    return jsonify([{
        "id": u.id,
        "username": u.username,
        "avatar": u.avatar,
        "is_following": current_user.is_following(u)
    } for u in users]), 200

@main_bp.route('/quizzes/search', methods=['GET'])
def search_quizzes():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    current_user = User.query.get(session['user_id'])
    if not current_user: # Handle case where user might have been deleted
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    q = request.args.get('q', '').strip()
    if not q:
        return jsonify([]), 200

    # prefix‐match voor name én username
    name_pattern = f"{q}%"
    user_pattern = f"{q}%"

    quizzes = (
        Quiz.query
            .join(User)
            .filter(
                Quiz.user_id != session['user_id'],
                or_(
                    Quiz.name.ilike(name_pattern),
                    User.username.ilike(user_pattern)
                )
            )
            .order_by(Quiz.name.asc())
            .limit(10)
            .all()
    )

    result = [{
        "id": quiz.id,
        "name": quiz.name,
        "creator": quiz.user.username if quiz.user else 'Unknown', # Handle potential missing user
        "creator_avatar": quiz.user.avatar if quiz.user else None,
        "created_at": quiz.created_at.isoformat(),
        "questions_count": len(quiz.questions)
    } for quiz in quizzes]

    return jsonify(result), 200

@main_bp.route('/users/all', methods=['GET'])
def get_all_users():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    current_user = User.query.get(session['user_id'])
    if not current_user:
        session.clear()
        return jsonify({"error": "Invalid session"}), 401
    users = User.query.filter(User.id != current_user.id).order_by(User.username.asc()).all()
    return jsonify([{
        "id": u.id,
        "username": u.username,
        "avatar": u.avatar,
        "is_following": current_user.is_following(u)
    } for u in users]), 200

@main_bp.route('/follow/<int:user_id>', methods=['POST'])
def follow_user(user_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    current_user = User.query.get(session['user_id'])
    user_to_follow = User.query.get(user_id)

    if not current_user:
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    if not user_to_follow or current_user.id == user_id:
        return jsonify({"error": "Invalid request"}), 400

    if current_user.is_following(user_to_follow):
        return jsonify({"error": "Already following user"}), 400

    current_user.follow(user_to_follow)
    db.session.commit()
    return jsonify({"message": f"Now following {user_to_follow.username}"}), 200

@main_bp.route('/unfollow/<int:user_id>', methods=['POST'])
def unfollow_user(user_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    current_user = User.query.get(session['user_id'])
    user_to_unfollow = User.query.get(user_id)

    if not current_user:
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    if not user_to_unfollow or not current_user.is_following(user_to_unfollow):
        return jsonify({"error": "Invalid request"}), 400

    current_user.unfollow(user_to_unfollow)
    db.session.commit()
    return jsonify({"message": f"Unfollowed {user_to_unfollow.username}"}), 200

@main_bp.route('/followers/<int:follower_id>', methods=['DELETE'])
def remove_follower(follower_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    current_user = User.query.get(session['user_id'])
    follower = User.query.get(follower_id)

    if not current_user:
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    if not follower or not current_user.followers.filter_by(id=follower_id).first():
        return jsonify({"error": "Invalid request"}), 400

    # A follower unfollows the current user
    follower.unfollow(current_user)
    db.session.commit()
    return jsonify({"message": "Follower removed successfully"}), 200

@main_bp.route('/followers', methods=['GET'])
def get_followers():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    current_user = User.query.get(session['user_id'])
    if not current_user:
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    return jsonify([{
        "id": u.id,
        "username": u.username,
        "avatar": u.avatar,
        "is_following": current_user.is_following(u) # Check if current user follows their follower back
    } for u in current_user.followers.all()]), 200


@main_bp.route('/following', methods=['GET'])
def get_following():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user = User.query.get(session['user_id'])
    if not user:
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    return jsonify([{
        "id": u.id,
        "username": u.username,
        "avatar": u.avatar
    } for u in user.followed.all()]), 200

@main_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Gebruikersnaam en wachtwoord vereist"}), 400

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"error": "Gebruikersnaam bestaat al"}), 409

    hashed_pw = generate_password_hash(password)
    new_user = User(username=username, password_hash=hashed_pw)
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": f"Gebruiker {username} geregistreerd"}), 201
    except IntegrityError: # Catch potential race conditions
        db.session.rollback()
        return jsonify({"error": "Gebruikersnaam bestaat al"}), 409
    except Exception as e:
        db.session.rollback()
        print(f"Error during signup: {e}") # Log the error server-side
        return jsonify({"error": "Kon gebruiker niet registreren"}), 500


@main_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Gebruikersnaam en wachtwoord vereist"}), 400

    user = User.query.filter_by(username=username).first()
    if user is None or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Ongeldige login"}), 401

    session.clear()
    session['user_id'] = user.id
    session['username'] = user.username
    # Consider adding session['avatar'] = user.avatar if needed frequently

    return jsonify({"message": f"Ingelogd als {user.username}", "user": {"id": user.id, "username": user.username, "avatar": user.avatar}}), 200


@main_bp.route('/home', methods=['GET'])
def home():
    if 'user_id' not in session:
        return jsonify({"error": "Niet gemachtigd"}), 401

    user = User.query.get(session['user_id'])
    if not user: # Check if user still exists
        session.clear()
        return jsonify({"error": "Niet gemachtigd"}), 401

    username = session.get('username', 'Onbekend') # Fallback, though should be set on login
    return jsonify({"message": f"Welkom, {username}! Dit is een beschermde pagina."}), 200


@main_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Uitgelogd"}), 200

# --- Quiz Management ---
# ... (Houd bestaande quiz routes ongewijzigd) ...
@main_bp.route('/quizzes', methods=['GET'])
def get_user_quizzes():
    if 'user_id' not in session:
        return jsonify({"error": "Niet ingelogd"}), 401

    user_id = session['user_id']
    user = User.query.get(user_id)
    if not user:
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    quizzes = Quiz.query.filter_by(user_id=user_id).order_by(Quiz.created_at.desc()).all()
    quizzes_data = []

    for quiz in quizzes:
        global_questions = []
        for question in quiz.questions:
            q_data = {
                "id": question.id,
                "type": question.question_type,
                "text": question.question_text
            }

            if hasattr(question, 'options'): # Check if it's MultipleChoiceQuestion
                 q_data['options'] = [{
                    "id": opt.id,
                    "text": opt.text,
                    "is_correct": opt.is_correct
                } for opt in question.options]
            elif hasattr(question, 'min_value'): # Check if it's SliderQuestion
                q_data.update({
                    "min": question.min_value,
                    "max": question.max_value,
                    "step": question.step,
                    "correct_value": question.correct_value
                })
            elif hasattr(question, 'max_length'): # Check if it's TextInputQuestion
                q_data.update({
                    "max_length": question.max_length,
                    "correct_answer": question.correct_answer
                })

            global_questions.append(q_data)

        quizzes_data.append({
            "id": quiz.id,
            "name": quiz.name,
            "created_at": quiz.created_at.isoformat(),
            "questions": global_questions,
            "questions_count": len(global_questions) # Add question count
        })

    return jsonify(quizzes_data), 200


@main_bp.route('/quiz', methods=['POST'])
def create_quiz():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user_id = session['user_id']
    user = User.query.get(user_id)
    if not user:
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    data = request.get_json()
    if not data or 'name' not in data or not data['name'].strip():
        return jsonify({"error": "Quiz name required"}), 400
    if 'questions' not in data or not isinstance(data['questions'], list):
         return jsonify({"error": "Invalid questions format"}), 400

    try:
        new_quiz = Quiz(
            user_id=session['user_id'],
            name=data['name'].strip() # Trim whitespace
        )
        db.session.add(new_quiz)
        # Flush to get the new_quiz.id before creating questions
        db.session.flush()

        for q_data in data.get('questions', []):
            # Basic validation for question data
            if not q_data or 'type' not in q_data or 'text' not in q_data or not q_data['text'].strip():
                raise ValueError("Invalid question data: Missing type or text.")

            question = None
            q_type = q_data['type']
            q_text = q_data['text'].strip()

            if q_type == 'text_input':
                question = TextInputQuestion(
                    quiz_id=new_quiz.id,
                    # quiz=new_quiz, # Relationship backref handles this
                    question_text=q_text,
                    max_length=q_data.get('max_length', 255),
                    correct_answer=q_data.get('correct_answer')
                )
            elif q_type == 'multiple_choice':
                question = MultipleChoiceQuestion(
                    quiz_id=new_quiz.id,
                    question_text=q_text
                )
                db.session.add(question)
                db.session.flush() # Flush to get question.id for options

                options_data = q_data.get('options', [])
                if not options_data or not isinstance(options_data, list):
                     raise ValueError("Multiple choice question requires options.")

                correct_options_count = 0
                for opt_data in options_data:
                    if not opt_data or 'text' not in opt_data or not opt_data['text'].strip():
                         raise ValueError("Invalid option data: Missing text.")
                    is_correct = opt_data.get('isCorrect', False)
                    if is_correct:
                        correct_options_count += 1
                    option = MultipleChoiceOption(
                        question_id=question.id, # Use flushed ID
                        # question=question, # Relationship backref handles this
                        text=opt_data['text'].strip(),
                        is_correct=is_correct
                    )
                    db.session.add(option)
                # Optional: Validate if at least one correct answer exists for MC questions
                # if correct_options_count == 0:
                #     raise ValueError("Multiple choice question must have at least one correct option.")


            elif q_type == 'slider':
                 # Validate slider values
                min_val = q_data.get('min', 0)
                max_val = q_data.get('max', 10)
                step_val = q_data.get('step', 1)
                correct_val = q_data.get('correct_value')

                if not isinstance(min_val, int) or not isinstance(max_val, int) or not isinstance(step_val, int):
                    raise ValueError("Slider min, max, and step must be integers.")
                if min_val >= max_val:
                    raise ValueError("Slider min value must be less than max value.")
                if step_val <= 0:
                    raise ValueError("Slider step must be positive.")
                if correct_val is not None:
                    if not isinstance(correct_val, int):
                         raise ValueError("Slider correct value must be an integer.")
                    if not (min_val <= correct_val <= max_val):
                         raise ValueError("Slider correct value must be within min/max range.")
                    # Optional: Check if correct_value is reachable with the step
                    # if (correct_val - min_val) % step_val != 0:
                    #    raise ValueError("Slider correct value is not reachable with the given step.")


                question = SliderQuestion(
                    quiz_id=new_quiz.id,
                    question_text=q_text,
                    min_value=min_val,
                    max_value=max_val,
                    step=step_val,
                    correct_value=correct_val
                )
            else:
                # Handle unknown question type if necessary, or raise error
                 raise ValueError(f"Unsupported question type: {q_type}")


            if question: # Only add if a question object was created
                 db.session.add(question)

        # Final commit after processing all questions
        db.session.commit()
        return jsonify({"message": "Quiz created", "quiz_id": new_quiz.id}), 201

    except ValueError as ve: # Catch specific validation errors
        db.session.rollback()
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Error creating quiz: {e}") # Log the error
        return jsonify({"error": "Could not create quiz due to an internal error."}), 500


@main_bp.route('/quizzes/<int:quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    # No auth check needed here if quizzes can be publicly viewed/simulated once created
    # Add auth check if only owners/participants should see details:
    # if 'user_id' not in session:
    #     return jsonify({"error": "Not logged in"}), 401

    quiz = db.session.get(Quiz, quiz_id) # Use newer db.session.get
    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404

    questions = []
    for question in quiz.questions:
        q_data = {
            "id": question.id,
            "type": question.question_type,
            "text": question.question_text
        }

        # Use hasattr for safer attribute access, especially with polymorphism
        if hasattr(question, 'options'):
            q_data['options'] = [{
                "id": opt.id,
                "text": opt.text,
                "is_correct": opt.is_correct
            } for opt in question.options]
        elif hasattr(question, 'min_value'):
            q_data.update({
                "min": question.min_value,
                "max": question.max_value,
                "step": question.step,
                "correct_value": question.correct_value
            })
        elif hasattr(question, 'max_length'):
            q_data.update({
                "max_length": question.max_length,
                "correct_answer": question.correct_answer
            })

        questions.append(q_data)

    creator_username = quiz.user.username if quiz.user else "Unknown User"
    creator_avatar = quiz.user.avatar if quiz.user else None

    return jsonify({
        "id": quiz.id,
        "name": quiz.name,
        "created_at": quiz.created_at.isoformat(),
        "creator": creator_username,
        "creator_avatar": creator_avatar,
        "questions": questions,
        "questions_count": len(questions) # Include question count
    }), 200


@main_bp.route('/quizzes/<int:quiz_id>', methods=['DELETE'])
def delete_quiz(quiz_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user_id = session['user_id']
    user = User.query.get(user_id)
    if not user:
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    quiz = Quiz.query.filter_by(id=quiz_id, user_id=user_id).first()

    if not quiz:
        # Check if the quiz exists but belongs to another user
        existing_quiz = db.session.get(Quiz, quiz_id)
        if existing_quiz:
             return jsonify({"error": "Forbidden: You do not own this quiz"}), 403
        else:
             return jsonify({"error": "Quiz not found"}), 404

    try:
        # Cascade delete should handle questions and options if configured correctly
        db.session.delete(quiz)
        db.session.commit()
        return jsonify({"message": "Quiz deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error deleting quiz {quiz_id}: {e}")
        return jsonify({"error": "Could not delete quiz due to an internal error."}), 500


@main_bp.route('/quizzes/<int:quiz_id>', methods=['PUT'])
def update_quiz(quiz_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user_id = session['user_id']
    user = User.query.get(user_id)
    if not user:
        session.clear()
        return jsonify({"error": "Invalid session"}), 401

    quiz = Quiz.query.filter_by(id=quiz_id, user_id=user_id).first()

    if not quiz:
        existing_quiz = db.session.get(Quiz, quiz_id)
        if existing_quiz:
             return jsonify({"error": "Forbidden: You do not own this quiz"}), 403
        else:
             return jsonify({"error": "Quiz not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    if 'name' not in data or not data['name'].strip():
        return jsonify({"error": "Quiz name required"}), 400
    if 'questions' not in data or not isinstance(data['questions'], list):
         return jsonify({"error": "Invalid questions format"}), 400

    try:
        quiz.name = data['name'].strip()

        # --- Efficient Update Strategy ---
        existing_question_ids = {q.id for q in quiz.questions}
        incoming_questions_map = {} # Use map for quick lookup if needed later
        questions_to_add = []
        updated_question_ids = set()

        for q_data in data.get('questions', []):
            if not q_data or 'type' not in q_data or 'text' not in q_data or not q_data['text'].strip():
                raise ValueError("Invalid question data: Missing type or text.")

            q_id = q_data.get('id') # Check for existing question ID
            q_type = q_data['type']
            q_text = q_data['text'].strip()

            # --- Update Existing Question ---
            if q_id and q_id in existing_question_ids:
                question = db.session.get(Question, q_id)
                if not question or question.quiz_id != quiz.id:
                     raise ValueError(f"Invalid question ID {q_id} for this quiz.")
                if question.question_type != q_type:
                     raise ValueError(f"Changing question type (from {question.question_type} to {q_type}) is not supported via update. Delete and recreate.")

                question.question_text = q_text
                updated_question_ids.add(q_id)

                if q_type == 'text_input':
                    question.max_length = q_data.get('max_length', 255)
                    question.correct_answer = q_data.get('correct_answer')
                elif q_type == 'multiple_choice':
                    MultipleChoiceOption.query.filter_by(question_id=q_id).delete()
                    options_data = q_data.get('options', [])
                    if not options_data: raise ValueError("MC Question needs options.")
                    for opt_data in options_data:
                        if not opt_data or 'text' not in opt_data or not opt_data['text'].strip():
                             raise ValueError("Invalid option data.")
                        db.session.add(MultipleChoiceOption(
                            question_id=q_id,
                            text=opt_data['text'].strip(),
                            is_correct=opt_data.get('isCorrect', False)
                        ))
                elif q_type == 'slider':
                    min_val = q_data.get('min', 0)
                    max_val = q_data.get('max', 10)
                    if min_val >= max_val: raise ValueError("Slider min >= max")
                    question.min_value = min_val
                    question.max_value = max_val
                    question.step = q_data.get('step', 1)
                    question.correct_value = q_data.get('correct_value')

            # --- Add New Question ---
            else:
                new_question = None
                if q_type == 'text_input':
                    new_question = TextInputQuestion(quiz_id=quiz.id, question_text=q_text, max_length=q_data.get('max_length', 255), correct_answer=q_data.get('correct_answer'))
                elif q_type == 'multiple_choice':
                    new_question = MultipleChoiceQuestion(quiz_id=quiz.id, question_text=q_text)
                    db.session.add(new_question)
                    db.session.flush() # Need ID for options
                    options_data = q_data.get('options', [])
                    if not options_data: raise ValueError("MC Question needs options.")
                    for opt_data in options_data:
                         if not opt_data or 'text' not in opt_data or not opt_data['text'].strip():
                             raise ValueError("Invalid option data.")
                         db.session.add(MultipleChoiceOption(question_id=new_question.id, text=opt_data['text'].strip(), is_correct=opt_data.get('isCorrect', False)))
                elif q_type == 'slider':
                    min_val = q_data.get('min', 0)
                    max_val = q_data.get('max', 10)
                    if min_val >= max_val: raise ValueError("Slider min >= max")
                    new_question = SliderQuestion(quiz_id=quiz.id, question_text=q_text, min_value=min_val, max_value=max_val, step=q_data.get('step', 1), correct_value=q_data.get('correct_value'))
                else:
                    raise ValueError(f"Unsupported question type: {q_type}")

                if new_question:
                    questions_to_add.append(new_question)

        # --- Delete questions that were not in the incoming data ---
        question_ids_to_delete = existing_question_ids - updated_question_ids
        if question_ids_to_delete:
            mc_questions_to_delete = db.session.query(MultipleChoiceQuestion.id).filter(MultipleChoiceQuestion.id.in_(question_ids_to_delete)).all()
            if mc_questions_to_delete:
                mc_ids = [q_id for q_id, in mc_questions_to_delete]
                MultipleChoiceOption.query.filter(MultipleChoiceOption.question_id.in_(mc_ids)).delete(synchronize_session=False)
            Question.query.filter(Question.id.in_(question_ids_to_delete)).delete(synchronize_session=False)

        if questions_to_add:
            db.session.add_all(questions_to_add)

        db.session.commit()
        return jsonify({"message": "Quiz updated", "quiz_id": quiz.id}), 200

    except ValueError as ve:
        db.session.rollback()
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Error updating quiz {quiz_id}: {e}")
        return jsonify({"error": "Could not update quiz due to an internal error."}), 500


# --- Profile Management ---
# ... (Houd bestaande profiel routes ongewijzigd) ...
@main_bp.route('/profile', methods=['GET', 'POST'])
def handle_profile():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user = db.session.get(User, session['user_id'])
    if not user:
        session.clear() # Clear invalid session
        return jsonify({"error": "User not found or session invalid"}), 404

    if request.method == 'GET':
        return jsonify({
            "id": user.id,
            "username": user.username,
            "bio": user.bio,
            "avatar": user.avatar,
            "registered_at": user.registered_at.isoformat() if user.registered_at else None # Handle potential None
        }), 200

    # --- POST Method ---
    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        updated = False # Flag to check if any changes were made

        if 'username' in data:
            new_username = data['username'].strip()
            if not new_username:
                 return jsonify({"error": "Username cannot be empty"}), 400
            if new_username != user.username:
                existing_user = User.query.filter(User.username == new_username, User.id != user.id).first()
                if existing_user:
                    return jsonify({"error": "Username already taken"}), 409
                user.username = new_username
                session['username'] = new_username # Update session username
                updated = True

        if 'bio' in data:
             if data['bio'] is not None and data['bio'] != user.bio:
                 user.bio = data['bio']
                 updated = True

        if 'avatar' in data:
            new_avatar = data['avatar']
            if isinstance(new_avatar, int) and 1 <= new_avatar <= 12:
                 if new_avatar != user.avatar:
                     user.avatar = new_avatar
                     updated = True
            else:
                return jsonify({"error": "Invalid avatar number. Must be between 1 and 12."}), 400

        if not updated:
             return jsonify({"message": "No changes detected"}), 200

        try:
            db.session.commit()
            return jsonify({
                "message": "Profile updated",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "bio": user.bio,
                    "avatar": user.avatar
                }
            }), 200
        except Exception as e:
            db.session.rollback()
            print(f"Error updating profile for user {user.id}: {e}")
            return jsonify({"error": "Could not update profile due to an internal error."}), 500


@main_bp.route('/change-password', methods=['POST'])
def change_password():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user = db.session.get(User, session['user_id'])
    if not user:
        session.clear()
        return jsonify({"error": "User not found or session invalid"}), 401

    data = request.get_json()
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')
    confirm_password = data.get('confirmPassword') # Add confirmation check

    if not current_password or not new_password or not confirm_password:
        return jsonify({"error": "All password fields required"}), 400

    if not check_password_hash(user.password_hash, current_password):
        return jsonify({"error": "Current password is incorrect"}), 401

    if new_password != confirm_password:
        return jsonify({"error": "New passwords do not match"}), 400

    try:
        user.password_hash = generate_password_hash(new_password)
        db.session.commit()
        return jsonify({"message": "Password updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error changing password for user {user.id}: {e}")
        return jsonify({"error": "Could not change password due to an internal error."}), 500

@main_bp.route('/delete-account', methods=['DELETE'])
def delete_account():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user_id = session['user_id'] # Get user_id from session
    user = db.session.get(User, user_id) # Fetch user using the ID
    if not user:
        session.clear()
        return jsonify({"error": "User not found or session invalid"}), 401

    data = request.get_json()
    password = data.get('password')

    if not password:
        return jsonify({"error": "Password required to delete account"}), 400

    if not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Incorrect password"}), 401

    try:
        # Deletion Order: Sessions, Participants, Follows, Quiz Content, Quizzes, User
        hosted_session_ids_query = QuizSession.query.filter_by(host_id=user.id).with_entities(QuizSession.id)
        hosted_session_ids = [id_tuple[0] for id_tuple in hosted_session_ids_query.all()]
        if hosted_session_ids:
            SessionParticipant.query.filter(SessionParticipant.session_id.in_(hosted_session_ids)).delete(synchronize_session=False)
            QuizSession.query.filter(QuizSession.id.in_(hosted_session_ids)).delete(synchronize_session=False)
        SessionParticipant.query.filter_by(user_id=user.id).delete(synchronize_session=False)
        db.session.execute(followers.delete().where((followers.c.follower_id == user.id) | (followers.c.followed_id == user.id)))

        user_quiz_ids_query = Quiz.query.filter_by(user_id=user.id).with_entities(Quiz.id)
        user_quiz_ids = [id_tuple[0] for id_tuple in user_quiz_ids_query.all()]
        if user_quiz_ids:
            question_ids_query = Question.query.filter(Question.quiz_id.in_(user_quiz_ids)).with_entities(Question.id)
            question_ids = [id_tuple[0] for id_tuple in question_ids_query.all()]
            if question_ids:
                mc_question_ids_query = MultipleChoiceQuestion.query.filter(MultipleChoiceQuestion.id.in_(question_ids)).with_entities(MultipleChoiceQuestion.id)
                mc_question_ids = [id_tuple[0] for id_tuple in mc_question_ids_query.all()]
                if mc_question_ids:
                    MultipleChoiceOption.query.filter(MultipleChoiceOption.question_id.in_(mc_question_ids)).delete(synchronize_session=False)
                TextInputQuestion.query.filter(TextInputQuestion.id.in_(question_ids)).delete(synchronize_session=False)
                MultipleChoiceQuestion.query.filter(MultipleChoiceQuestion.id.in_(question_ids)).delete(synchronize_session=False)
                SliderQuestion.query.filter(SliderQuestion.id.in_(question_ids)).delete(synchronize_session=False)
                Question.query.filter(Question.id.in_(question_ids)).delete(synchronize_session=False)
            Quiz.query.filter(Quiz.id.in_(user_quiz_ids)).delete(synchronize_session=False)

        db.session.delete(user)
        db.session.commit()
        session.clear()
        return jsonify({"message": "Account deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        import traceback
        print(f"ERROR deleting account for user {user.id} ({user.username}): {type(e).__name__} - {e}")
        traceback.print_exc()
        return jsonify({"error": "Could not delete account due to an internal error. Please check server logs."}), 500

# ------------------------------
# SESSION MANAGEMENT ROUTES
# ------------------------------
# ... (Houd bestaande sessie routes ongewijzigd: /sessions POST, /sessions/<code>/join POST, /sessions/<code>/start POST, /sessions/<code> GET, /sessions/<code>/participants GET, /sessions/<code>/submit-score POST) ...
@main_bp.route('/sessions', methods=['POST'])
def create_session():
    """Creates a new quiz session."""
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    user_id = session['user_id']
    host_user = User.query.get(user_id)
    if not host_user:
        session.clear()
        return jsonify({'error': 'Invalid session'}), 401

    data = request.get_json()
    quiz_id = data.get('quiz_id')
    num_teams_req = data.get('num_teams')

    if not quiz_id:
        return jsonify({'error': 'Quiz ID is required'}), 400

    quiz = db.session.get(Quiz, quiz_id)
    if not quiz:
         return jsonify({'error': 'Quiz not found'}), 404
    if len(quiz.questions) == 0: # Check if quiz has questions
        return jsonify({'error': 'Cannot host a quiz with no questions'}), 400

    try:
        num_teams = int(num_teams_req)
        if num_teams < 1:
             raise ValueError()
    except (ValueError, TypeError):
        num_teams = 1

    def generate_code(length=6):
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

    code = generate_code()
    while QuizSession.query.filter_by(code=code).first():
        code = generate_code()

    try:
        new_session = QuizSession(
            quiz_id=quiz_id,
            host_id=user_id,
            code=code,
            num_teams=num_teams
        )
        db.session.add(new_session)
        db.session.commit()
        return jsonify({'message': 'Session created', 'code': code, 'quiz_id': quiz_id, 'num_teams': num_teams}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating session: {e}")
        return jsonify({'error': 'Could not create session'}), 500


@main_bp.route('/sessions/<string:code>/join', methods=['POST'])
def join_session(code):
    """Allows a logged-in user to join or switch teams in a session."""
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    user_id = session['user_id']
    user = User.query.get(user_id)
    if not user:
        session.clear()
        return jsonify({'error': 'Invalid session'}), 401

    data = request.get_json()
    team_number_req = data.get('team_number')

    quiz_session = QuizSession.query.filter_by(code=code).first()
    if not quiz_session:
        return jsonify({'error': 'Session not found'}), 404

    if quiz_session.started:
        return jsonify({'error': 'Session has already started'}), 403

    team_number = None
    if quiz_session.is_team_mode:
        try:
            team_number = int(team_number_req)
            if not (1 <= team_number <= quiz_session.num_teams):
                return jsonify({'error': f'Invalid team number. Choose between 1 and {quiz_session.num_teams}.'}), 400
        except (ValueError, TypeError):
             return jsonify({'error': 'Team number is required for this session'}), 400

    participant = SessionParticipant.query.filter_by(
        session_id=quiz_session.id,
        user_id=user_id
    ).first()

    try:
        if participant:
            if participant.team_number != team_number:
                participant.team_number = team_number
                db.session.commit()
                return jsonify({'message': f'Switched to Team {team_number}' if team_number else 'Switched to individual participation', 'action': 'switched_team'}), 200
            else:
                return jsonify({'message': 'Already in this team' if team_number else 'Already participating individually', 'action': 'no_change'}), 200
        else:
            new_participant = SessionParticipant(
                session_id=quiz_session.id,
                user_id=user_id,
                team_number=team_number
            )
            db.session.add(new_participant)
            db.session.commit()
            return jsonify({'message': f'Joined Team {team_number}' if team_number else 'Joined session', 'action': 'joined'}), 200

    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Could not join session due to a conflict. Please try again.'}), 409
    except Exception as e:
        db.session.rollback()
        print(f"Error joining/switching team for session {code}, user {user_id}: {e}")
        return jsonify({'error': 'Could not join session'}), 500


@main_bp.route('/sessions/<string:code>/start', methods=['POST'])
def start_session(code):
    """Starts the quiz session (only host)."""
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    user_id = session['user_id']
    quiz_session = QuizSession.query.filter_by(code=code).first()

    if not quiz_session:
        return jsonify({'error': 'Session not found'}), 404

    if quiz_session.host_id != user_id:
        return jsonify({'error': 'Only the host can start this session'}), 403

    if quiz_session.started:
        return jsonify({'error': 'Session already started'}), 400

    try:
        quiz_session.started = True
        db.session.commit()
        return jsonify({'message': 'Session started'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error starting session {code}: {e}")
        return jsonify({'error': 'Could not start session'}), 500


@main_bp.route('/sessions/<string:code>', methods=['GET'])
def get_session_info(code):
    """Gets basic information about a session."""
    quiz_session = QuizSession.query.filter_by(code=code).first()
    if not quiz_session:
        return jsonify({'error': 'Session not found'}), 404

    host_username = quiz_session.host.username if quiz_session.host else "Unknown Host"
    quiz_name = quiz_session.quiz.name if quiz_session.quiz else "Unknown Quiz"

    return jsonify({
        'code': quiz_session.code,
        'quiz_id': quiz_session.quiz_id,
        'quiz_name': quiz_name,
        'host_id': quiz_session.host_id,
        'host_username': host_username,
        'started': quiz_session.started,
        'created_at': quiz_session.created_at.isoformat(),
        'num_teams': quiz_session.num_teams,
        'is_team_mode': quiz_session.is_team_mode
    }), 200


@main_bp.route('/sessions/<string:code>/participants', methods=['GET'])
def get_participants(code):
    """Gets the list of participants in a session."""
    quiz_session = QuizSession.query.filter_by(code=code).first()
    if not quiz_session:
        return jsonify({'error': 'Session not found'}), 404

    participants_data = []
    for p in quiz_session.participants:
         if p.user:
             participants_data.append({
                 'user_id': p.user.id,
                 'username': p.user.username,
                 'avatar': p.user.avatar,
                 'team_number': p.team_number,
                 'score': p.score
             })
         else:
             print(f"Warning: Participant record {p.id} in session {code} has no associated user.")

    return jsonify(participants_data), 200


@main_bp.route('/sessions/<string:code>/submit-score', methods=['POST'])
def submit_score(code):
    """Submits the score for a participant in a session."""
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    user_id = session['user_id']
    data = request.get_json()
    score_req = data.get('score')

    if score_req is None:
        return jsonify({'error': 'Score is required'}), 400

    try:
        score = float(score_req)
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid score format'}), 400


    quiz_session = QuizSession.query.filter_by(code=code).first()
    if not quiz_session:
        return jsonify({'error': 'Session not found'}), 404

    participant = SessionParticipant.query.filter_by(
        session_id=quiz_session.id,
        user_id=user_id
    ).first()

    if not participant:
        return jsonify({'error': 'You are not part of this session'}), 403

    try:
        participant.score = score
        db.session.commit()
        print(f'Score {score} submitted for user {user_id} in session {code}')
        return jsonify({'message': 'Score submitted'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error submitting score for user {user_id}, session {code}: {e}")
        return jsonify({'error': 'Could not submit score'}), 500

# --- NIEUW ENDPOINT ---
@main_bp.route('/sessions/<string:code>/results', methods=['GET'])
def get_session_results(code):
    """Gets the final results/scores for a session."""
    quiz_session = QuizSession.query.filter_by(code=code).first()
    if not quiz_session:
        return jsonify({'error': 'Session not found'}), 404

    # Haal deelnemers op, gesorteerd op score (hoogste eerst)
    participants = SessionParticipant.query.filter_by(
        session_id=quiz_session.id
    ).order_by(SessionParticipant.score.desc()).all()

    results = []
    for p in participants:
        if p.user: # Controleer of de gebruiker bestaat
            results.append({
                'user_id': p.user.id,
                'username': p.user.username,
                'avatar': p.user.avatar,
                'score': p.score,
                'team_number': p.team_number # Voeg teamnummer toe
            })

    # Stuur alleen de lijst met individuele resultaten terug
    return jsonify(results), 200
# --- EINDE NIEUW ENDPOINT ---

# --- Simulatie Route (bestaande, geen wijziging nodig hier) ---
@main_bp.route('/simulate/<int:quiz_id>', methods=['GET'])
def simulate_session(quiz_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401 # Add auth if needed

    quiz = db.session.get(Quiz, quiz_id) # Use the integer quiz_id directly
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404

    questions_data = []
    for question in quiz.questions:
        q_data = {
            'id': question.id,
            'type': question.question_type,
            'text': question.question_text
        }
        if hasattr(question, 'options'):
            q_data['options'] = [{'id': opt.id, 'text': opt.text} for opt in question.options]
            correct_option = next((opt for opt in question.options if opt.is_correct), None)
            q_data['correct_option_id'] = correct_option.id if correct_option else None
            q_data['correct_answer_text'] = correct_option.text if correct_option else None # Voeg juiste antwoordtekst toe
        elif hasattr(question, 'min_value'):
            q_data.update({
                'min': question.min_value, 'max': question.max_value,
                'step': question.step, 'correct_value': question.correct_value
            })
        elif hasattr(question, 'max_length'):
            q_data.update({
                'max_length': question.max_length, 'correct_answer': question.correct_answer
            })
        questions_data.append(q_data)

    return jsonify({
        'quiz_id': quiz.id,
        'quiz_name': quiz.name,
        'questions': questions_data
    }), 200

# --- App Creation Functie (ongewijzigd) ---
def create_app():
    from .init_flask import create_app as flask_create_app
    app = flask_create_app()
    return app