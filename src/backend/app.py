# src/backend/app.py
from flask import Blueprint, request, jsonify, session
from .init_flask import db, main_bp
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from flask_cors import CORS  # Add CORS support

from .Questions import (
    Question,
    TextInputQuestion,
    MultipleChoiceOption,
    SliderQuestion,
    MultipleChoiceQuestion
)

from .session import (
    QuizSession,
    SessionParticipant,
)

followers = db.Table('followers',
                     db.Column('follower_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
                     db.Column('followed_id', db.Integer, db.ForeignKey('users.id'), primary_key=True)
                     )


# ------------------------------
# DATABASE MODELLEN
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

    def is_following(self, user):
        return self.followed.filter(followers.c.followed_id == user.id).count() > 0

    def follow(self, user):
        if not self.is_following(user):
            self.followed.append(user)

    def unfollow(self, user):
        if self.is_following(user):
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
    user = db.relationship("User", backref="quizzes", lazy=True)


# ------------------------------
# ROUTES / ENDPOINTS
# ------------------------------

@main_bp.route('/users/search', methods=['GET'])
def search_users():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    current_user = User.query.get(session['user_id'])
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

    search_query = request.args.get('q', '').strip().lower()
    current_user_id = session['user_id']

    if not search_query:
        return jsonify([]), 200

    # Escape % and _ before building the LIKE pattern
    escaped = search_query.replace("%", r"\%").replace("_", r"\_")
    sanitized_query = f"%{escaped}%"

    quizzes = Quiz.query.join(User).filter(
        Quiz.name.ilike(sanitized_query),
        Quiz.user_id != current_user_id  # Exclude current user's quizzes
    ).order_by(
        Quiz.name.asc()
    ).limit(10).all()

    quizzes_data = [{
        "id": quiz.id,
        "name": quiz.name,
        "creator": quiz.user.username,
        "created_at": quiz.created_at.isoformat(),
        "questions_count": len(quiz.questions),
        "creator_avatar": quiz.user.avatar
    } for quiz in quizzes]

    return jsonify(quizzes_data), 200

@main_bp.route('/users/all', methods=['GET'])
def get_all_users():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401
    current_user = User.query.get(session['user_id'])
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

    if not follower or not current_user.followers.filter_by(id=follower_id).first():
        return jsonify({"error": "Invalid request"}), 400

    follower.unfollow(current_user)
    db.session.commit()
    return jsonify({"message": "Follower removed successfully"}), 200

@main_bp.route('/followers', methods=['GET'])
def get_followers():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    current_user = User.query.get(session['user_id'])
    return jsonify([{
        "id": u.id,
        "username": u.username,
        "avatar": u.avatar,
        "is_following": current_user.is_following(u)
    } for u in current_user.followers.all()]), 200

@main_bp.route('/following', methods=['GET'])
def get_following():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user = User.query.get(session['user_id'])
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
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": f"Gebruiker {username} geregistreerd"}), 201


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

    return jsonify({"message": f"Ingelogd als {user.username}"}), 200


@main_bp.route('/home', methods=['GET'])
def home():
    if 'user_id' not in session:
        return jsonify({"error": "Niet gemachtigd"}), 401

    username = session.get('username', 'Onbekend')
    return jsonify({"message": f"Welkom, {username}! Dit is een beschermde pagina."}), 200


@main_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Uitgelogd"}), 200


@main_bp.route('/quizzes', methods=['GET'])
def get_user_quizzes():
    if 'user_id' not in session:
        return jsonify({"error": "Niet ingelogd"}), 401

    user_id = session['user_id']
    quizzes = Quiz.query.filter_by(user_id=user_id).all()
    quizzes_data = []

    for quiz in quizzes:
        global_questions = []
        for question in quiz.questions:
            q_data = {
                "id": question.id,
                "type": question.question_type,
                "text": question.question_text
            }

            if question.question_type == 'multiple_choice':
                q_data['options'] = [{
                    "id": opt.id,
                    "text": opt.text,
                    "is_correct": opt.is_correct
                } for opt in question.options]
            elif question.question_type == 'slider':
                q_data.update({
                    "min": question.min_value,
                    "max": question.max_value,
                    "step": question.step,
                    "correct_value": question.correct_value
                })
            elif question.question_type == 'text_input':
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
        })

    return jsonify(quizzes_data), 200


@main_bp.route('/quiz', methods=['POST'])
def create_quiz():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({"error": "Quiz name required"}), 400

    try:
        questions = list()
        new_quiz = Quiz(
            user_id=session['user_id'],
            name=data['name']
        )

        db.session.add(new_quiz)
        db.session.flush()

        for q_data in data.get('questions', []):
            question = None
            if q_data['type'] == 'text_input':
                question = TextInputQuestion(
                    quiz_id=new_quiz.id,
                    quiz=new_quiz,
                    question_text=q_data['text'],
                    max_length=q_data.get('max_length', 255),
                    correct_answer=q_data.get('correct_answer')
                )
                db.session.add(question)

            elif q_data['type'] == 'multiple_choice':
                question = MultipleChoiceQuestion(
                    quiz=new_quiz,
                    quiz_id=new_quiz.id,
                    question_text=q_data['text']
                )
                db.session.add(question)
                db.session.flush()

                for opt in q_data.get('options', []):
                    option = MultipleChoiceOption(
                        question=question,
                        question_id=question.id,
                        text=opt['text'],
                        is_correct=opt.get('isCorrect', False)
                    )
                    db.session.add(option)

            elif q_data['type'] == 'slider':
                question = SliderQuestion(
                    quiz=new_quiz,
                    quiz_id=new_quiz.id,
                    question_text=q_data['text'],
                    min_value=q_data.get('min', 0),
                    max_value=q_data.get('max', 10),
                    step=q_data.get('step', 1),
                    correct_value=q_data.get('correct_value')
                )
                db.session.add(question)

        db.session.commit()
        return jsonify({"message": "Quiz created", "quiz_id": new_quiz.id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@main_bp.route('/quizzes/<int:quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    quiz = Quiz.query.get_or_404(quiz_id)
    questions = []

    for question in quiz.questions:
        q_data = {
            "id": question.id,
            "type": question.question_type,
            "text": question.question_text
        }

        if question.question_type == 'multiple_choice':
            q_data['options'] = [{
                "id": opt.id,
                "text": opt.text,
                "is_correct": opt.is_correct
            } for opt in question.options]
        elif question.question_type == 'slider':
            q_data.update({
                "min": question.min_value,
                "max": question.max_value,
                "step": question.step,
                "correct_value": question.correct_value
            })
        elif question.question_type == 'text_input':
            q_data.update({
                "max_length": question.max_length,
                "correct_answer": question.correct_answer
            })

        questions.append(q_data)

    return jsonify({
        "id": quiz.id,
        "name": quiz.name,
        "created_at": quiz.created_at.isoformat(),
        "questions": questions
    })


@main_bp.route('/profile', methods=['GET', 'POST'])
def handle_profile():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    user = db.session.get(User, session['user_id'])
    if not user:
        return jsonify({"error": "User not found"}), 404

    if request.method == 'GET':
        return jsonify({
            "id": user.id,
            "username": user.username,
            "bio": user.bio,
            "avatar": user.avatar,
            "registered_at": user.registered_at.isoformat() if user.registered_at else "miauw"
        }), 200

    if request.method == 'POST':
        data = request.get_json()

        if 'username' in data:
            new_username = data['username'].strip()
            if new_username != user.username:
                existing_user = User.query.filter_by(username=new_username).first()
                if existing_user:
                    return jsonify({"error": "Username already taken"}), 409
                user.username = new_username
                session['username'] = new_username

        if 'bio' in data:
            user.bio = data['bio']
        if 'avatar' in data and 1 <= data['avatar'] <= 12:
            user.avatar = data['avatar']

        db.session.commit()
        return jsonify({"message": "Profile updated"}), 200


@main_bp.route('/change-password', methods=['POST'])
def change_password():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    data = request.get_json()
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')

    if not current_password or not new_password:
        return jsonify({"error": "Current and new password required"}), 400

    user = User.query.get(session['user_id'])
    if not user or not check_password_hash(user.password_hash, current_password):
        return jsonify({"error": "Current password is incorrect"}), 401

    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({"message": "Password updated successfully"}), 200


@main_bp.route('/delete-account', methods=['DELETE'])
def delete_account():
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    data = request.get_json()
    password = data.get('password')

    user = User.query.get(session['user_id'])
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Incorrect password"}), 401

    db.session.delete(user)
    db.session.commit()
    session.clear()
    return jsonify({"message": "Account deleted successfully"}), 200


@main_bp.route('/quizzes/<int:quiz_id>', methods=['DELETE'])
def delete_quiz(quiz_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    try:
        user_id = session['user_id']
        if not User.query.get(user_id):
            session.clear()
            return jsonify({"error": "Session invalid"}), 401

        quiz = Quiz.query.filter_by(
            id=quiz_id,
            user_id=user_id
        ).first()

        if not quiz:
            return jsonify({"error": "Quiz not found"}), 404

        for question in quiz.questions:
            if question.question_type == 'multiple_choice':
                MultipleChoiceOption.query.filter_by(
                    question_id=question.id
                ).delete()

        db.session.delete(quiz)
        db.session.commit()

        return jsonify({"message": "Quiz deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@main_bp.route('/quizzes/<int:quiz_id>', methods=['PUT'])
def update_quiz(quiz_id):
    if 'user_id' not in session:
        return jsonify({"error": "Not logged in"}), 401

    data = request.get_json()
    quiz = Quiz.query.filter_by(id=quiz_id, user_id=session['user_id']).first()

    if not quiz:
        return jsonify({"error": "Quiz not found"}), 404

    try:
        user_id = session['user_id']
        if not User.query.get(user_id):
            session.clear()
            return jsonify({"error": "Session invalid"}), 401

        quiz.name = data.get('name', quiz.name)

        for question in quiz.questions:
            if question.question_type == 'multiple_choice':
                MultipleChoiceOption.query.filter_by(question_id=question.id).delete()
            db.session.delete(question)

        for q_data in data.get('questions', []):
            question = None
            if q_data['type'] == 'text_input':
                question = TextInputQuestion(
                    quiz_id=quiz.id,
                    question_text=q_data['text'],
                    max_length=q_data.get('max_length', 255),
                    correct_answer=q_data.get('correct_answer')
                )
                db.session.add(question)

            elif q_data['type'] == 'multiple_choice':
                question = MultipleChoiceQuestion(
                    quiz_id=quiz.id,
                    question_text=q_data['text']
                )
                db.session.add(question)
                db.session.flush()

                for opt in q_data.get('options', []):
                    option = MultipleChoiceOption(
                        question_id=question.id,
                        text=opt['text'],
                        is_correct=opt.get('isCorrect', False)
                    )
                    db.session.add(option)

            elif q_data['type'] == 'slider':
                question = SliderQuestion(
                    quiz_id=quiz.id,
                    question_text=q_data['text'],
                    min_value=q_data.get('min', 0),
                    max_value=q_data.get('max', 10),
                    step=q_data.get('step', 1),
                    correct_value=q_data.get('correct_value')
                )
                db.session.add(question)

        db.session.commit()
        return jsonify({"message": "Quiz updated", "quiz_id": quiz.id}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@main_bp.route('/sessions', methods=['POST'])
def create_session():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    data = request.get_json()
    quiz_id = data.get('quiz_id')
    team_mode = data.get('team_mode', False)  # default = False

    if not quiz_id:
        return jsonify({'error': 'Quiz ID is required'}), 400

    # Generate code
    import string, random
    def generate_code():
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

    code = generate_code()
    while QuizSession.query.filter_by(code=code).first():
        code = generate_code()

    new_session = QuizSession(
        quiz_id=quiz_id,
        host_id=session['user_id'],
        code=code,
        team_mode=team_mode
    )
    db.session.add(new_session)
    db.session.commit()

    return jsonify({'message': 'Session created', 'code': code }), 201

@main_bp.route('/sessions/<string:code>/join', methods=['POST'])
def join_session(code):
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    data = request.get_json()
    team = data.get('team')

    quiz_session = QuizSession.query.filter_by(code=code).first()
    if not quiz_session:
        return jsonify({'error': 'Session not found'}), 404

    if quiz_session.started:
        return jsonify({'error': 'Session already started'}), 403

    existing = SessionParticipant.query.filter_by(
        session_id=quiz_session.id,
        user_id=session['user_id']
    ).first()

    if existing:
        return jsonify({'message': 'Already joined'}), 200

    participant = SessionParticipant(
        session_id=quiz_session.id,
        user_id=session['user_id'],
        team=team  # Save chosen team
    )
    db.session.add(participant)
    db.session.commit()

    return jsonify({'message': 'Joined session'}), 200

@main_bp.route('/sessions/<string:code>/start', methods=['POST'])
def start_session(code):
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    quiz_session = QuizSession.query.filter_by(code=code).first()
    if not quiz_session:
        return jsonify({'error': 'Session not found'}), 404

    if quiz_session.host_id != session['user_id']:
        return jsonify({'error': 'Only the host can start this session'}), 403

    quiz_session.started = True
    db.session.commit()
    return jsonify({'message': 'Session started'}), 200

@main_bp.route('/sessions/<string:code>', methods=['GET'])
def get_session_info(code):
    quiz_session = QuizSession.query.filter_by(code=code).first()
    if not quiz_session:
        return jsonify({'error': 'Session not found'}), 404

    return jsonify({
        'code': quiz_session.code,
        'quiz_id': quiz_session.quiz_id,
        'host_id': quiz_session.host_id,
        'started': quiz_session.started,
        'created_at': quiz_session.created_at.isoformat(),
        'team_mode': quiz_session.team_mode,
    })

@main_bp.route('/sessions/<string:code>/participants', methods=['GET'])
def get_participants(code):
    quiz_session = QuizSession.query.filter_by(code=code).first()
    if not quiz_session:
        return jsonify({'error': 'Session not found'}), 404

    participants = [{
        'id': p.user.id,
        'username': p.user.username,
        'avatar': p.user.avatar,
        'team': p.team
    } for p in quiz_session.participants]

    return jsonify(participants)

@main_bp.route('/sessions/<string:code>/submit-score', methods=['POST'])
def submit_score(code):
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    data = request.get_json()
    score = data.get('score')

    quiz_session = QuizSession.query.filter_by(code=code).first()
    if not quiz_session:
        return jsonify({'error': 'Session not found'}), 404

    participant = SessionParticipant.query.filter_by(
        session_id=quiz_session.id,
        user_id=session['user_id']
    ).first()

    if not participant:
        return jsonify({'error': 'You are not part of this session'}), 403

    participant.score = score
    db.session.commit()
    print('commited')
    return jsonify({'message': 'Score submitted'}), 200

@main_bp.route('/sessions/<string:code>/results', methods=['GET'])
def get_session_results(code):
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    quiz_session = QuizSession.query.filter_by(code=code).first()
    if not quiz_session:
        return jsonify({'error': 'Session not found'}), 404

    participants = SessionParticipant.query.filter_by(session_id=quiz_session.id).all()

    results = []
    for p in participants:
        results.append({
            'username': p.user.username,
            'avatar': p.user.avatar,
            'score': p.score,
            'team': p.team
        })

    return jsonify(results), 200

@main_bp.route('/simulate/<string:code>', methods=['GET'])
def simulate_session(code):
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    quiz_session = QuizSession.query.filter_by(code=code).first()
    if not quiz_session:
        return jsonify({'error': 'Session not found'}), 404

    quiz = Quiz.query.get(quiz_session.quiz_id)
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404

    questions_data = []
    for question in quiz.questions:
        q_data = {
            'id': question.id,
            'type': question.question_type,
            'text': question.question_text
        }

        if question.question_type == 'multiple_choice':
            q_data['options'] = [{
                'id': opt.id,
                'text': opt.text,
                'is_correct': opt.is_correct
            } for opt in question.options]
        elif question.question_type == 'slider':
            q_data.update({
                'min': question.min_value,
                'max': question.max_value,
                'step': question.step,
                'correct_value': question.correct_value
            })
        elif question.question_type == 'text_input':
            q_data.update({
                'max_length': question.max_length,
                'correct_answer': question.correct_answer
            })

        questions_data.append(q_data)

    return jsonify({
        'quiz_id': quiz.id,
        'quiz_name': quiz.name,
        'questions': questions_data
    }), 200

def create_app():
    from .init_flask import create_app as flask_create_app
    app = flask_create_app()
    CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
    return app
