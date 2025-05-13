# src/backend/app.py
import random
import string
from datetime import datetime, timedelta, timezone # Added timezone
import re

from flask import Flask, request, jsonify, session, current_app
from sqlalchemy import or_, and_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload
from werkzeug.security import generate_password_hash, check_password_hash

from .init_flask import db, migrate, main_bp
from .config import Config
from flask_cors import CORS

from .Questions import (
    Question, TextInputQuestion, MultipleChoiceOption,
    SliderQuestion, MultipleChoiceQuestion
)
from .session import QuizSession, SessionParticipant
from .notifications import Notification # Import Notification model

followers = db.Table('followers',
    db.Column('follower_id', db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    db.Column('followed_id', db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    bio = db.Column(db.Text)
    avatar = db.Column(db.Integer, default=1)
    registered_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    # Banner fields
    banner_type = db.Column(db.String(50), default='color')
    banner_value = db.Column(db.String(255), default='#6c757d')
    # Notification preference
    notifications_enabled = db.Column(db.Boolean, default=True, nullable=False)


    followed = db.relationship(
        'User', secondary=followers,
        primaryjoin=(followers.c.follower_id == id),
        secondaryjoin=(followers.c.followed_id == id),
        backref=db.backref('followers', lazy='dynamic'), lazy='dynamic'
    )
    quizzes = db.relationship('Quiz', backref="user", lazy='select', cascade='all, delete-orphan') # Changed from dynamic
    hosted_sessions = db.relationship('QuizSession', backref='host', lazy='dynamic', foreign_keys='QuizSession.host_id', cascade='all, delete-orphan')
    session_participations = db.relationship('SessionParticipant', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    # Notification relationships
    notifications_received = db.relationship('Notification', foreign_keys=[Notification.recipient_id], backref='recipient', lazy='dynamic', cascade='all, delete-orphan')
    notifications_sent = db.relationship('Notification', foreign_keys=[Notification.sender_id], backref='sender', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password):
         self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def is_following(self, other_user):
        if not other_user or not other_user.id: return False
        return self.followed.filter(followers.c.followed_id == other_user.id).count() > 0

    def follow(self, other_user):
        if other_user and other_user.id != self.id and not self.is_following(other_user):
            self.followed.append(other_user)
            # Create a notification for the followed user only if their notifications are enabled
            if other_user.notifications_enabled:
                notification = Notification(
                    recipient_id=other_user.id,
                    sender_id=self.id,
                    notification_type='new_follower'
                )
                db.session.add(notification)

    def unfollow(self, other_user):
        if other_user and other_user.id and self.is_following(other_user):
            self.followed.remove(other_user)

    def remove_follower(self, user_to_remove): # A user (user_to_remove) stops following self
        if user_to_remove and self.followers.filter(followers.c.follower_id == user_to_remove.id).count() > 0:
            # The 'followers' backref means: self.followers is a list of users who follow self.
            # So, user_to_remove is in that list. We need user_to_remove to unfollow self.
            user_to_remove.unfollow(self)

class Quiz(db.Model):
    __tablename__ = 'quizzes'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # GEWIJZIGD: lazy='selectin' voor efficiënt laden van vragen
    questions = db.relationship('Question', backref='quiz', lazy='selectin', cascade='all, delete-orphan')
    sessions = db.relationship('QuizSession', backref='quiz', lazy='dynamic', cascade='all, delete-orphan')


# --- APPLICATION FACTORY ---
def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
    db.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(main_bp)

    return app

# --- ROUTES ---

@main_bp.route('/users/<int:user_id_param>/profile', methods=['GET'])
def get_public_profile(user_id_param):
    profile_user = db.session.query(User).options(
        db.selectinload(User.quizzes)
    ).get(user_id_param)

    if not profile_user:
        return jsonify({"error": "User not found"}), 404

    is_following_profile_user = False
    current_user_session_id = session.get('user_id')
    viewing_own_profile = False

    if current_user_session_id:
        current_user_obj = db.session.get(User, current_user_session_id)
        if current_user_obj:
            if current_user_obj.id == profile_user.id:
                viewing_own_profile = True
            else:
                is_following_profile_user = current_user_obj.is_following(profile_user)
        else:
            session.clear()

    public_quizzes_data = []
    for quiz_item in profile_user.quizzes:
        aware_created_at = quiz_item.created_at.replace(tzinfo=timezone.utc) if quiz_item.created_at else None
        public_quizzes_data.append({
            "id": quiz_item.id, "name": quiz_item.name,
            "created_at": aware_created_at.isoformat() if aware_created_at else None,
            "questions_count": len(quiz_item.questions)
        })

    aware_registered_at = profile_user.registered_at.replace(tzinfo=timezone.utc) if profile_user.registered_at else None
    return jsonify({
        "id": profile_user.id, "username": profile_user.username, "bio": profile_user.bio,
        "avatar": profile_user.avatar,
        "registered_at": aware_registered_at.isoformat() if aware_registered_at else None,
        "is_following": is_following_profile_user, "viewing_own_profile": viewing_own_profile,
        "quizzes": public_quizzes_data,
        "followers_count": profile_user.followers.count(),
        "following_count": profile_user.followed.count(),
        "banner_type": profile_user.banner_type, "banner_value": profile_user.banner_value,
        "notifications_enabled": profile_user.notifications_enabled # Added for consistency
    }), 200

@main_bp.route('/users/search', methods=['GET'])
def search_users():
    if 'user_id' not in session: return jsonify({"error": "Not logged in"}), 401
    current_user_obj = db.session.get(User, session['user_id'])
    if not current_user_obj:
        session.clear(); return jsonify({"error": "Invalid session"}), 401

    search_query = request.args.get('q', '').strip().lower()
    if not search_query: return jsonify([]), 200
    sanitized_query = search_query.replace('%', '\\%').replace('_', '\\_')

    users_list = User.query.filter(
        User.username.ilike(f'{sanitized_query}%'), User.id != current_user_obj.id
    ).order_by(User.username.asc()).limit(10).all()

    return jsonify([{
        "id": u.id, "username": u.username, "avatar": u.avatar,
        "is_following": current_user_obj.is_following(u)
    } for u in users_list]), 200

@main_bp.route('/quizzes/search', methods=['GET'])
def search_quizzes():
    if 'user_id' not in session: return jsonify({"error": "Not logged in"}), 401
    current_user_id = session['user_id']
    q_search = request.args.get('q', '').strip()
    if not q_search: return jsonify([]), 200

    name_pattern = f"{q_search}%"; user_pattern = f"{q_search}%"
    quizzes_list = (Quiz.query.join(User)
               .options(joinedload(Quiz.user),
                        db.selectinload(Quiz.questions))
               .filter(Quiz.user_id != current_user_id,
                       or_(Quiz.name.ilike(name_pattern), User.username.ilike(user_pattern)))
               .order_by(Quiz.name.asc()).limit(10).all())

    results = []
    for quiz_item in quizzes_list:
        aware_created_at = quiz_item.created_at.replace(tzinfo=timezone.utc) if quiz_item.created_at else None
        results.append({
            "id": quiz_item.id, "name": quiz_item.name,
            "creator": quiz_item.user.username if quiz_item.user else 'Unknown',
            "creator_avatar": quiz_item.user.avatar if quiz_item.user else None,
            "created_at": aware_created_at.isoformat() if aware_created_at else None,
            "questions_count": len(quiz_item.questions)
        })
    return jsonify(results), 200

@main_bp.route('/users/all', methods=['GET'])
def get_all_users():
    if 'user_id' not in session: return jsonify({"error": "Not logged in"}), 401
    current_user_obj = db.session.get(User, session['user_id'])
    if not current_user_obj: session.clear(); return jsonify({"error": "Invalid session"}), 401

    users_list = User.query.filter(User.id != current_user_obj.id).order_by(User.username.asc()).all()
    return jsonify([{
        "id": u.id, "username": u.username, "avatar": u.avatar,
        "is_following": current_user_obj.is_following(u)
    } for u in users_list]), 200

@main_bp.route('/users/invitable', methods=['GET'])
def get_invitable_users():
    if 'user_id' not in session: return jsonify({"error": "Not logged in"}), 401
    host_id_val = session['user_id']
    session_code_param = request.args.get('session_code')
    if not session_code_param: return jsonify({"error": "Session code parameter is required"}), 400

    quiz_session_obj = QuizSession.query.filter_by(code=session_code_param).first()
    if not quiz_session_obj: return jsonify({"error": "Session not found"}), 404
    if quiz_session_obj.host_id != host_id_val: return jsonify({"error": "Only the host can view invitable users"}), 403

    participant_user_ids = {p.user_id for p in quiz_session_obj.participants}

    pending_invite_user_ids = {
        n.recipient_id for n in Notification.query.filter_by(
            session_id=quiz_session_obj.id,
            notification_type='session_invite',
            is_read=False
        ).all()
    }

    excluded_user_ids = participant_user_ids.union(pending_invite_user_ids)
    excluded_user_ids.add(host_id_val)

    invitable_users_list = User.query.filter(
        User.id.notin_(excluded_user_ids)
    ).order_by(User.username.asc()).all()

    return jsonify([{"id": u.id, "username": u.username, "avatar": u.avatar} for u in invitable_users_list]), 200

@main_bp.route('/follow/<int:user_id_to_follow>', methods=['POST'])
def follow_user(user_id_to_follow):
    if 'user_id' not in session: return jsonify({"error": "Not logged in"}), 401
    current_user_id_val = session['user_id']
    current_user_obj = db.session.get(User, current_user_id_val)
    user_to_follow_obj = db.session.get(User, user_id_to_follow)

    if not current_user_obj: session.clear(); return jsonify({"error": "Invalid session"}), 401
    if not user_to_follow_obj: return jsonify({"error": "User to follow not found"}), 404
    if current_user_id_val == user_id_to_follow: return jsonify({"error": "Cannot follow yourself"}), 400
    if current_user_obj.is_following(user_to_follow_obj): return jsonify({"error": "Already following this user"}), 400

    current_user_obj.follow(user_to_follow_obj)
    try:
        db.session.commit()
        return jsonify({"message": f"Now following {user_to_follow_obj.username}"}), 200
    except Exception as e:
        db.session.rollback(); print(f"Error following user: {e}")
        return jsonify({"error": "Could not follow user"}), 500

@main_bp.route('/unfollow/<int:user_id_to_unfollow>', methods=['POST'])
def unfollow_user(user_id_to_unfollow):
    if 'user_id' not in session: return jsonify({"error": "Not logged in"}), 401
    current_user_id_val = session['user_id']
    current_user_obj = db.session.get(User, current_user_id_val)
    user_to_unfollow_obj = db.session.get(User, user_id_to_unfollow)

    if not current_user_obj: session.clear(); return jsonify({"error": "Invalid session"}), 401
    if not user_to_unfollow_obj: return jsonify({"error": "User to unfollow not found"}), 404
    if not current_user_obj.is_following(user_to_unfollow_obj): return jsonify({"error": "Not following this user"}), 400

    current_user_obj.unfollow(user_to_unfollow_obj)
    try:
        db.session.commit()
        return jsonify({"message": f"Unfollowed {user_to_unfollow_obj.username}"}), 200
    except Exception as e:
        db.session.rollback(); print(f"Error unfollowing user: {e}")
        return jsonify({"error": "Could not unfollow user"}), 500

@main_bp.route('/followers/<int:follower_id_to_remove>', methods=['DELETE'])
def remove_follower(follower_id_to_remove):
    if 'user_id' not in session: return jsonify({"error": "Not logged in"}), 401
    current_user_id_val = session['user_id']
    current_user_obj = db.session.get(User, current_user_id_val)
    follower_to_remove_obj = db.session.get(User, follower_id_to_remove)

    if not current_user_obj: session.clear(); return jsonify({"error": "Invalid session"}), 401
    if not follower_to_remove_obj: return jsonify({"error": "Follower not found"}), 404

    if not current_user_obj.followers.filter(followers.c.follower_id == follower_id_to_remove).count() > 0:
         return jsonify({"error": f"{follower_to_remove_obj.username} is not following you"}), 400

    current_user_obj.remove_follower(follower_to_remove_obj)
    try:
        db.session.commit()
        return jsonify({"message": f"Removed {follower_to_remove_obj.username} from your followers"}), 200
    except Exception as e:
        db.session.rollback(); print(f"Error removing follower: {e}")
        return jsonify({"error": "Could not remove follower"}), 500

@main_bp.route('/followers', methods=['GET'])
def get_followers_list():
    if 'user_id' not in session: return jsonify({"error": "Not logged in"}), 401
    current_user_obj = db.session.get(User, session['user_id'])
    if not current_user_obj: session.clear(); return jsonify({"error": "Invalid session"}), 401

    return jsonify([{
        "id": u.id, "username": u.username, "avatar": u.avatar,
        "is_following": current_user_obj.is_following(u)
    } for u in current_user_obj.followers.all()]), 200


@main_bp.route('/following', methods=['GET'])
def get_following_list():
    if 'user_id' not in session: return jsonify({"error": "Not logged in"}), 401
    current_user_obj = db.session.get(User, session['user_id'])
    if not current_user_obj: session.clear(); return jsonify({"error": "Invalid session"}), 401

    return jsonify([{"id": u.id, "username": u.username, "avatar": u.avatar} for u in current_user_obj.followed.all()]), 200


@main_bp.route('/signup', methods=['POST'])
def signup():
    data_dict = request.get_json() or {}
    username_val = data_dict.get('username','').strip()
    password_val = data_dict.get('password','').strip()

    if not username_val or not password_val: return jsonify({"error": "Username and password required and cannot be empty"}), 400
    if len(username_val) > 32: return jsonify({"error": "Username cannot exceed 32 characters"}), 400
    if len(password_val) > 64: return jsonify({"error": "Password cannot exceed 64 characters"}), 400
    if User.query.filter_by(username=username_val).first(): return jsonify({"error": "Username already exists"}), 409

    new_user_obj = User(username=username_val)
    new_user_obj.set_password(password_val)
    try:
        db.session.add(new_user_obj); db.session.commit()
        return jsonify({"message": f"User {username_val} registered successfully"}), 201
    except IntegrityError:
        db.session.rollback(); return jsonify({"error": "Username already exists (DB)"}), 409
    except Exception as e:
        db.session.rollback(); print(f"Error during signup: {e}")
        return jsonify({"error": "Could not register user"}), 500

@main_bp.route('/login', methods=['POST'])
def login():
    data_dict = request.get_json() or {}
    username_val = data_dict.get('username','').strip()
    password_val = data_dict.get('password','').strip()

    if not username_val or not password_val: return jsonify({"error": "Username and password required"}), 400
    if len(username_val) > 32 or len(password_val) > 64: return jsonify({"error": "Invalid login credentials (length)"}), 401

    user_obj = User.query.filter_by(username=username_val).first()
    if user_obj is None or not user_obj.check_password(password_val):
        return jsonify({"error": "Invalid login credentials"}), 401

    session.clear(); session['user_id'] = user_obj.id; session['username'] = user_obj.username
    session.permanent = True
    current_app.permanent_session_lifetime = timedelta(days=7)

    return jsonify({"message": f"Logged in as {user_obj.username}",
                    "user": {"id": user_obj.id, "username": user_obj.username, "avatar": user_obj.avatar}}), 200

@main_bp.route('/home', methods=['GET'])
def home_auth_check():
    if 'user_id' not in session: return jsonify({"error": "Niet gemachtigd"}), 401
    user_obj = db.session.get(User, session['user_id'])
    if not user_obj: session.clear(); return jsonify({"error": "Niet gemachtigd (user not found)"}), 401
    return jsonify({"message": f"Welkom, {session.get('username', 'Onbekend')}!"}), 200

@main_bp.route('/logout', methods=['POST'])
def logout():
    session.clear(); return jsonify({"message": "Uitgelogd"}), 200

@main_bp.route('/quizzes', methods=['GET'])
def get_user_quizzes():
    if 'user_id' not in session: return jsonify({"error": "Niet ingelogd"}), 401
    user_id_val = session['user_id']
    quizzes_list = Quiz.query.filter_by(user_id=user_id_val).order_by(Quiz.created_at.desc()).all()

    quizzes_data_list = []
    for quiz_item in quizzes_list:
        q_list = []
        for q_model_item in quiz_item.questions: # questions is al geladen door lazy='selectin'
            q_data_item = {
                "id": q_model_item.id,
                "type": q_model_item.question_type,
                "text": q_model_item.question_text
            }
            if isinstance(q_model_item, MultipleChoiceQuestion):
                q_data_item['options'] = [{
                    "id": opt.id, "text": opt.text, "is_correct": opt.is_correct
                } for opt in q_model_item.options]
            elif isinstance(q_model_item, SliderQuestion):
                q_data_item.update({
                    "min": q_model_item.min_value, "max": q_model_item.max_value,
                    "step": q_model_item.step, "correct_value": q_model_item.correct_value
                })
            elif isinstance(q_model_item, TextInputQuestion):
                q_data_item.update({
                    "max_length": q_model_item.max_length, "correct_answer": q_model_item.correct_answer
                })
            q_list.append(q_data_item)

        aware_created_at = quiz_item.created_at.replace(tzinfo=timezone.utc) if quiz_item.created_at else None
        quizzes_data_list.append({
            "id": quiz_item.id, "name": quiz_item.name,
            "created_at": aware_created_at.isoformat() if aware_created_at else None,
            "questions_count": len(q_list),
            "questions": q_list
        })
    return jsonify(quizzes_data_list), 200


def _validate_quiz_data(data_dict, is_update_op=False):
    quiz_name_str = data_dict.get('name','').strip()
    questions_data_list = data_dict.get('questions')

    if not quiz_name_str: return "Quiz name required"
    if len(quiz_name_str) > 255: return "Quiz name too long (max 255 chars)"
    if questions_data_list is None or not isinstance(questions_data_list, list): return "Invalid questions format (must be a list)"
    if not is_update_op and not questions_data_list: return "Quiz must have at least one question"

    for idx, q_data_item in enumerate(questions_data_list):
        q_num = idx + 1
        q_type_str = q_data_item.get('type')
        q_text_str = q_data_item.get('text','').strip()
        if not q_type_str or not q_text_str: return f"Q{q_num}: Type and text required"
        if len(q_text_str) > 1000: return f"Q{q_num}: Text too long (max 1000 chars)"

        if q_type_str == 'text_input':
            correct_ans_str = q_data_item.get('correct_answer','').strip()
            max_len_int = q_data_item.get('max_length', 255)
            if not correct_ans_str: return f"Q{q_num} (Text): Correct answer required"
            if len(correct_ans_str) > 255 : return f"Q{q_num} (Text): Correct answer too long (max 255)"
            if not isinstance(max_len_int, int) or not (1 <= max_len_int <= 500): return f"Q{q_num} (Text): Max length must be 1-500"
            if len(correct_ans_str) > max_len_int: return f"Q{q_num} (Text): Correct answer exceeds max length ({max_len_int})"
        elif q_type_str == 'multiple_choice':
            options_list = q_data_item.get('options', [])
            if len(options_list) < 2: return f"Q{q_num} (MCQ): At least 2 options required"
            if not any(opt.get('isCorrect') for opt in options_list): return f"Q{q_num} (MCQ): At least one correct option required"
            for opt_idx, opt_data_item in enumerate(options_list):
                opt_text_str = opt_data_item.get('text','').strip()
                if not opt_text_str: return f"Q{q_num} (MCQ), Opt{opt_idx+1}: Option text required"
                if len(opt_text_str) > 255: return f"Q{q_num} (MCQ), Opt{opt_idx+1}: Option text too long (max 255)"
        elif q_type_str == 'slider':
            min_v_int, max_v_int, step_v_int = q_data_item.get('min'), q_data_item.get('max'), q_data_item.get('step')
            correct_v_int = q_data_item.get('correct_value')
            if not all(v is not None for v in [min_v_int, max_v_int, step_v_int, correct_v_int]): return f"Q{q_num} (Slider): All fields (min, max, step, correct_value) are required"
            if not all(isinstance(v, int) for v in [min_v_int, max_v_int, step_v_int, correct_v_int]): return f"Q{q_num} (Slider): Min, max, step, correct value must be integers"
            if min_v_int >= max_v_int: return f"Q{q_num} (Slider): Min value must be less than max value"
            if step_v_int <= 0: return f"Q{q_num} (Slider): Step must be positive"
            if not (min_v_int <= correct_v_int <= max_v_int and (correct_v_int - min_v_int) % step_v_int == 0):
                return f"Q{q_num} (Slider): Correct value ({correct_v_int}) invalid for range [{min_v_int}-{max_v_int}] with step {step_v_int}"
        else: return f"Q{q_num}: Unsupported question type: {q_type_str}"
    return None

@main_bp.route('/quiz', methods=['POST'])
def create_quiz():
    if 'user_id' not in session: return jsonify({"error": "Not logged in"}), 401
    user_id_val = session['user_id']
    data_dict = request.get_json()

    validation_error_msg = _validate_quiz_data(data_dict or {}, is_update_op=False)
    if validation_error_msg: return jsonify({"error": validation_error_msg}), 400

    quiz_name_str = data_dict['name'].strip()
    questions_data_list = data_dict.get('questions', [])

    try:
        new_quiz_obj = Quiz(user_id=user_id_val, name=quiz_name_str)
        db.session.add(new_quiz_obj); db.session.flush()

        for q_data_item in questions_data_list:
            q_type_str = q_data_item['type']; q_text_str = q_data_item['text'].strip(); question_obj = None
            if q_type_str == 'text_input':
                question_obj = TextInputQuestion(quiz_id=new_quiz_obj.id, question_text=q_text_str, max_length=q_data_item.get('max_length',255), correct_answer=q_data_item['correct_answer'].strip())
            elif q_type_str == 'multiple_choice':
                question_obj = MultipleChoiceQuestion(quiz_id=new_quiz_obj.id, question_text=q_text_str)
                db.session.add(question_obj); db.session.flush()
                for opt_data_item in q_data_item['options']:
                    db.session.add(MultipleChoiceOption(question_id=question_obj.id, text=opt_data_item['text'].strip(), is_correct=opt_data_item.get('isCorrect',False)))
            elif q_type_str == 'slider':
                question_obj = SliderQuestion(quiz_id=new_quiz_obj.id, question_text=q_text_str, min_value=q_data_item['min'], max_value=q_data_item['max'], step=q_data_item['step'], correct_value=q_data_item['correct_value'])
            if question_obj: db.session.add(question_obj)

        db.session.commit()
        return jsonify({"message": "Quiz created", "quiz_id": new_quiz_obj.id}), 201
    except Exception as e:
        db.session.rollback(); print(f"Error creating quiz: {e}"); import traceback; traceback.print_exc()
        return jsonify({"error": "Could not create quiz due to an internal error"}), 500

@main_bp.route('/quizzes/<int:quiz_id_param>', methods=['GET'])
def get_quiz_details(quiz_id_param):
    quiz_obj = Quiz.query.get(quiz_id_param)
    if not quiz_obj: return jsonify({"error": "Quiz not found"}), 404

    questions_data_list = []
    for q_model_item in quiz_obj.questions:
        q_data_item = {"id": q_model_item.id, "type": q_model_item.question_type, "text": q_model_item.question_text}
        if isinstance(q_model_item, MultipleChoiceQuestion):
            q_data_item['options'] = [{"id": opt.id, "text": opt.text, "is_correct": opt.is_correct} for opt in q_model_item.options]
        elif isinstance(q_model_item, SliderQuestion):
            q_data_item.update({"min": q_model_item.min_value, "max": q_model_item.max_value, "step": q_model_item.step, "correct_value": q_model_item.correct_value})
        elif isinstance(q_model_item, TextInputQuestion):
            q_data_item.update({"max_length": q_model_item.max_length, "correct_answer": q_model_item.correct_answer})
        questions_data_list.append(q_data_item)

    aware_created_at = quiz_obj.created_at.replace(tzinfo=timezone.utc) if quiz_obj.created_at else None
    return jsonify({
        "id": quiz_obj.id, "name": quiz_obj.name,
        "created_at": aware_created_at.isoformat() if aware_created_at else None,
        "creator": quiz_obj.user.username if quiz_obj.user else "Unknown",
        "creator_id": quiz_obj.user.id if quiz_obj.user else None,
        "creator_avatar": quiz_obj.user.avatar if quiz_obj.user else None,
        "questions": questions_data_list, "questions_count": len(questions_data_list)
    }), 200

@main_bp.route('/quizzes/<int:quiz_id_param>', methods=['DELETE'])
def delete_quiz(quiz_id_param):
    if 'user_id' not in session: return jsonify({"error": "Not logged in"}), 401
    user_id_val = session['user_id']
    quiz_obj = Quiz.query.filter_by(id=quiz_id_param, user_id=user_id_val).first()
    if not quiz_obj:
        return jsonify({"error": "Quiz not found or you do not own this quiz"}), 404 if not db.session.get(Quiz, quiz_id_param) else 403
    try:
        db.session.delete(quiz_obj); db.session.commit()
        return jsonify({"message": "Quiz deleted successfully"}), 200
    except Exception as e:
        db.session.rollback(); print(f"Error deleting quiz: {e}")
        return jsonify({"error": "Could not delete quiz"}), 500

@main_bp.route('/quizzes/<int:quiz_id_param>', methods=['PUT'])
def update_quiz(quiz_id_param):
    if 'user_id' not in session: return jsonify({"error": "Not logged in"}), 401
    user_id_val = session['user_id']
    quiz_obj = Quiz.query.filter_by(id=quiz_id_param, user_id=user_id_val).first()
    if not quiz_obj:
        return jsonify({"error": "Quiz not found or you do not own this quiz"}), 404 if not db.session.get(Quiz, quiz_id_param) else 403

    data_dict = request.get_json()
    validation_error_msg = _validate_quiz_data(data_dict or {}, is_update_op=True)
    if validation_error_msg: return jsonify({"error": validation_error_msg}), 400

    new_name_str = data_dict['name'].strip()
    questions_data_list = data_dict.get('questions', [])

    try:
        quiz_obj.name = new_name_str
        existing_q_map = {q.id: q for q in quiz_obj.questions}
        incoming_q_ids = {q_data_item.get('id') for q_data_item in questions_data_list if q_data_item.get('id')}

        for q_id_to_delete in set(existing_q_map.keys()) - incoming_q_ids:
            db.session.delete(existing_q_map[q_id_to_delete])

        for q_data_item in questions_data_list:
            q_id_val = q_data_item.get('id'); q_type_str = q_data_item['type']; q_text_str = q_data_item['text'].strip()
            question_to_process_obj = None

            if q_id_val and q_id_val in existing_q_map:
                question_to_process_obj = existing_q_map[q_id_val]
                if question_to_process_obj.question_type != q_type_str:
                    db.session.delete(question_to_process_obj)
                    question_to_process_obj = None

            if not question_to_process_obj:
                if q_type_str == 'text_input':
                    question_to_process_obj = TextInputQuestion(quiz_id=quiz_obj.id)
                elif q_type_str == 'multiple_choice':
                    question_to_process_obj = MultipleChoiceQuestion(quiz_id=quiz_obj.id)
                elif q_type_str == 'slider':
                    question_to_process_obj = SliderQuestion(quiz_id=quiz_obj.id)
                else:
                    raise ValueError(f"Unsupported question type during update: {q_type_str}")
                db.session.add(question_to_process_obj)

            question_to_process_obj.question_text = q_text_str
            question_to_process_obj.question_type = q_type_str

            if isinstance(question_to_process_obj, TextInputQuestion):
                question_to_process_obj.max_length=q_data_item.get('max_length',255)
                question_to_process_obj.correct_answer=q_data_item['correct_answer'].strip()
            elif isinstance(question_to_process_obj, MultipleChoiceQuestion):
                if q_id_val:
                     for opt_to_del in question_to_process_obj.options: db.session.delete(opt_to_del)

                db.session.flush()

                for opt_data_item in q_data_item.get('options', []):
                    db.session.add(MultipleChoiceOption(question_id=question_to_process_obj.id, text=opt_data_item['text'].strip(), is_correct=opt_data_item.get('isCorrect',False)))
            elif isinstance(question_to_process_obj, SliderQuestion):
                question_to_process_obj.min_value=q_data_item['min']
                question_to_process_obj.max_value=q_data_item['max']
                question_to_process_obj.step=q_data_item['step']
                question_to_process_obj.correct_value=q_data_item['correct_value']

        db.session.commit()
        return jsonify({"message": "Quiz updated", "quiz_id": quiz_obj.id}), 200
    except ValueError as ve:
        db.session.rollback(); return jsonify({"error": str(ve)}), 400
    except Exception as e:
        db.session.rollback(); print(f"Error updating quiz: {e}"); import traceback; traceback.print_exc()
        return jsonify({"error": "Could not update quiz due to an internal error"}), 500


@main_bp.route('/profile', methods=['GET', 'POST'])
def handle_profile():
    if 'user_id' not in session: return jsonify({"error": "Not logged in"}), 401
    user_obj = db.session.get(User, session['user_id'])
    if not user_obj: session.clear(); return jsonify({"error": "User not found"}), 401

    if request.method == 'GET':
        aware_registered_at = user_obj.registered_at.replace(tzinfo=timezone.utc) if user_obj.registered_at else None
        return jsonify({"id": user_obj.id, "username": user_obj.username, "bio": user_obj.bio, "avatar": user_obj.avatar,
                        "registered_at": aware_registered_at.isoformat() if aware_registered_at else None,
                        "banner_type": user_obj.banner_type, "banner_value": user_obj.banner_value,
                        "notifications_enabled": user_obj.notifications_enabled,
                        "followers_count": user_obj.followers.count(), # ADDED
                        "following_count": user_obj.followed.count()  # ADDED
                        }), 200

    data_dict = request.get_json(); original_username_str = user_obj.username; updated_fields_count = 0
    if not data_dict: return jsonify({"error": "No data provided"}), 400

    try:
        if 'username' in data_dict:
            new_username_str = data_dict['username'].strip()
            if not new_username_str: raise ValueError("Username cannot be empty.")
            if len(new_username_str) > 32: raise ValueError("Username cannot exceed 32 characters.")
            if new_username_str != user_obj.username:
                if User.query.filter(User.username == new_username_str, User.id != user_obj.id).first():
                    return jsonify({"error": "Username already taken."}), 409
                user_obj.username = new_username_str
                session['username'] = new_username_str
                updated_fields_count += 1

        if 'bio' in data_dict:
            new_bio_str = data_dict['bio'] if data_dict['bio'] is not None else ''
            if len(new_bio_str) > 500: raise ValueError("Bio cannot exceed 500 characters.")
            if new_bio_str != user_obj.bio:
                user_obj.bio = new_bio_str
                updated_fields_count += 1

        if 'avatar' in data_dict:
            new_avatar_int = data_dict['avatar']
            if not isinstance(new_avatar_int, int) or not (1 <= new_avatar_int <= 12):
                raise ValueError("Invalid avatar number. Must be an integer between 1 and 12.")
            if new_avatar_int != user_obj.avatar:
                user_obj.avatar = new_avatar_int
                updated_fields_count += 1

        if 'banner_type' in data_dict and 'banner_value' in data_dict:
            b_type_str, b_val_str = data_dict['banner_type'], data_dict['banner_value']
            if b_type_str not in ['image', 'color']: raise ValueError("Invalid banner type. Must be 'image' or 'color'.")
            if b_type_str == 'image':
                valid_image_ids = [str(i) for i in range(1, 7)] + ['default']
                if not isinstance(b_val_str, str) or b_val_str not in valid_image_ids : raise ValueError(f"Invalid banner image ID. Allowed: {', '.join(valid_image_ids)}.")
            if b_type_str == 'color':
                if not isinstance(b_val_str, str) or not re.match(r"^#(?:[0-9a-fA-F]{3}){1,2}$", b_val_str):
                    raise ValueError("Invalid hex color format for banner (e.g., #RRGGBB or #RGB).")

            if user_obj.banner_type != b_type_str or user_obj.banner_value != b_val_str:
                user_obj.banner_type, user_obj.banner_value = b_type_str, b_val_str
                updated_fields_count += 1
        elif 'banner_type' in data_dict or 'banner_value' in data_dict:
             raise ValueError("Both banner_type and banner_value are required to update banner settings.")

        if 'notifications_enabled' in data_dict:
            new_notif_enabled_bool = data_dict['notifications_enabled']
            if not isinstance(new_notif_enabled_bool, bool):
                raise ValueError("Invalid value for notifications_enabled. Must be true or false.")
            if new_notif_enabled_bool != user_obj.notifications_enabled:
                user_obj.notifications_enabled = new_notif_enabled_bool
                updated_fields_count += 1

        if updated_fields_count == 0:
             return jsonify({"message": "No changes detected"}), 200

        db.session.commit()
        return jsonify({"message": "Profile updated successfully", "user": {
            "id": user_obj.id, "username": user_obj.username, "bio": user_obj.bio,
            "avatar": user_obj.avatar, "banner_type": user_obj.banner_type, "banner_value": user_obj.banner_value,
            "notifications_enabled": user_obj.notifications_enabled
        }}), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except IntegrityError:
        db.session.rollback()
        session['username'] = original_username_str
        return jsonify({"error": "Username already taken (database conflict)."}), 409
    except Exception as e:
        db.session.rollback()
        session['username'] = original_username_str
        print(f"Error updating profile for user {user_obj.id}: {e}")
        return jsonify({"error": "Could not update profile due to an internal error."}), 500


@main_bp.route('/change-password', methods=['POST'])
def change_password():
    if 'user_id' not in session: return jsonify({"error": "Not logged in"}), 401
    user_obj = db.session.get(User, session['user_id'])
    if not user_obj: session.clear(); return jsonify({"error": "User not found"}), 401

    data_dict = request.get_json()
    current_pw_str = data_dict.get('currentPassword','').strip()
    new_pw_str = data_dict.get('newPassword','').strip()
    confirm_pw_str = data_dict.get('confirmPassword','').strip()

    if not all([current_pw_str, new_pw_str, confirm_pw_str]): return jsonify({"error": "All password fields are required"}), 400
    if len(new_pw_str) > 64: return jsonify({"error": "New password cannot exceed 64 characters"}), 400
    if not user_obj.check_password(current_pw_str): return jsonify({"error": "Current password is incorrect"}), 401
    if new_pw_str != confirm_pw_str: return jsonify({"error": "New passwords do not match"}), 400
    if current_pw_str == new_pw_str: return jsonify({"error": "New password cannot be the same as the current password"}), 400

    try:
        user_obj.set_password(new_pw_str); db.session.commit()
        return jsonify({"message": "Password updated successfully"}), 200
    except Exception as e:
        db.session.rollback(); print(f"Error changing password for user {user_obj.id}: {e}")
        return jsonify({"error": "Could not change password due to an internal error"}), 500

@main_bp.route('/delete-account', methods=['DELETE'])
def delete_account():
    if 'user_id' not in session: return jsonify({"error": "Not logged in"}), 401
    user_obj = db.session.get(User, session['user_id'])
    if not user_obj: session.clear(); return jsonify({"error": "User not found"}), 401

    password_val = (request.get_json() or {}).get('password')
    if not password_val: return jsonify({"error": "Password is required to delete account"}), 400
    if not user_obj.check_password(password_val): return jsonify({"error": "Incorrect password"}), 401

    try:
        db.session.delete(user_obj); db.session.commit()
        session.clear()
        return jsonify({"message": "Account deleted successfully"}), 200
    except Exception as e:
        db.session.rollback(); print(f"Error deleting account for user {user_obj.id}: {e}"); import traceback; traceback.print_exc()
        return jsonify({"error": "Could not delete account due to an internal server error"}), 500


@main_bp.route('/sessions', methods=['POST'])
def create_quiz_session():
    if 'user_id' not in session: return jsonify({'error': 'Not logged in'}), 401
    user_id_val = session['user_id']
    data_dict = request.get_json(); quiz_id_val = data_dict.get('quiz_id'); num_teams_req_val = data_dict.get('num_teams')

    if not quiz_id_val: return jsonify({'error': 'Quiz ID is required'}), 400
    quiz_obj = Quiz.query.get(quiz_id_val)
    if not quiz_obj: return jsonify({'error': 'Quiz not found'}), 404
    if not quiz_obj.questions: return jsonify({'error': 'Cannot host a quiz with no questions'}), 400

    try:
        num_teams_int = int(num_teams_req_val)
        if num_teams_int < 1: raise ValueError()
    except (ValueError, TypeError, AssertionError):
        return jsonify({'error': 'Invalid number of teams (must be a positive integer)'}), 400

    session_code_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    while QuizSession.query.filter_by(code=session_code_str).first():
        session_code_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

    try:
        new_session_obj = QuizSession(quiz_id=quiz_id_val, host_id=user_id_val, code=session_code_str, num_teams=num_teams_int)
        db.session.add(new_session_obj); db.session.commit()
        return jsonify({'message': 'Session created', 'code': new_session_obj.code, 'quiz_id': new_session_obj.quiz_id, 'num_teams': new_session_obj.num_teams}), 201
    except Exception as e:
        db.session.rollback(); print(f"Error creating session: {e}")
        return jsonify({'error': 'Could not create session'}), 500

@main_bp.route('/sessions/<string:session_code_param>/invite', methods=['POST'])
def invite_to_session(session_code_param):
    if 'user_id' not in session: return jsonify({'error': 'Not logged in'}), 401
    host_id_val = session['user_id']
    quiz_session_obj = QuizSession.query.filter_by(code=session_code_param).first()

    if not quiz_session_obj: return jsonify({'error': 'Session not found'}), 404
    if quiz_session_obj.host_id != host_id_val: return jsonify({'error': 'Only the host can invite participants'}), 403
    if quiz_session_obj.started: return jsonify({'error': 'Cannot invite participants after the session has started'}), 403

    recipient_id_val = (request.get_json() or {}).get('recipient_id')
    if not recipient_id_val: return jsonify({'error': 'Recipient ID is required'}), 400

    recipient_user_obj = db.session.get(User, recipient_id_val)
    if not recipient_user_obj: return jsonify({'error': 'Recipient user not found'}), 404
    if recipient_id_val == host_id_val: return jsonify({'error': 'Cannot invite yourself to the session'}), 400

    if SessionParticipant.query.filter_by(session_id=quiz_session_obj.id, user_id=recipient_id_val).first():
        return jsonify({'message': f'{recipient_user_obj.username} is already in this session', 'already_joined': True}), 200

    existing_invite_obj = Notification.query.filter_by(
        recipient_id=recipient_id_val,
        session_id=quiz_session_obj.id,
        notification_type='session_invite',
        is_read=False
    ).first()
    if existing_invite_obj:
        return jsonify({'message': f'An invite has already been sent to {recipient_user_obj.username}', 'already_sent': True}), 200

    if not recipient_user_obj.notifications_enabled:
        return jsonify({'message': f'{recipient_user_obj.username} has notifications disabled. Invite not sent.'}), 200

    try:
        notification_obj = Notification(
            recipient_id=recipient_id_val,
            sender_id=host_id_val,
            session_id=quiz_session_obj.id,
            notification_type='session_invite'
        )
        db.session.add(notification_obj); db.session.commit()
        return jsonify({'message': f'Invitation sent to {recipient_user_obj.username}'}), 201
    except Exception as e:
        db.session.rollback(); print(f"Error sending invite for session {session_code_param}: {e}")
        return jsonify({'error': 'Could not send invitation due to an internal error'}), 500


@main_bp.route('/sessions/<string:session_code_param>/join', methods=['POST'])
def join_quiz_session(session_code_param):
    if 'user_id' not in session: return jsonify({'error': 'Not logged in'}), 401
    user_id_val = session['user_id']
    quiz_session_obj = QuizSession.query.filter_by(code=session_code_param).first()

    if not quiz_session_obj: return jsonify({'error': 'Session not found'}), 404
    if quiz_session_obj.started: return jsonify({'error': 'Session has already started'}), 403

    team_number_req_val = (request.get_json() or {}).get('team_number'); team_number_val = None
    if quiz_session_obj.is_team_mode:
        try:
            team_number_val = int(team_number_req_val)
            if not (1 <= team_number_val <= quiz_session_obj.num_teams): raise ValueError()
        except (ValueError, TypeError, AssertionError):
            return jsonify({'error': f'A valid team number (1-{quiz_session_obj.num_teams}) is required for this session'}), 400

    participant_obj = SessionParticipant.query.filter_by(session_id=quiz_session_obj.id, user_id=user_id_val).first()

    try:
        action_taken_str = 'no_change'; message_response_str = "You are already participating in this session."
        if participant_obj:
            if quiz_session_obj.is_team_mode and participant_obj.team_number != team_number_val:
                participant_obj.team_number = team_number_val
                action_taken_str = 'switched_team'
                message_response_str = f'Successfully switched to Team {team_number_val}.'
            elif not quiz_session_obj.is_team_mode and participant_obj.team_number is not None:
                participant_obj.team_number = None
                action_taken_str = 'switched_team'
                message_response_str = 'Successfully switched to individual participation.'

        else:
            participant_obj = SessionParticipant(session_id=quiz_session_obj.id, user_id=user_id_val, team_number=team_number_val)
            db.session.add(participant_obj)
            action_taken_str = 'joined'
            message_response_str = f'Successfully joined Team {team_number_val}.' if team_number_val else 'Successfully joined the session.'

            Notification.query.filter_by(
                recipient_id=user_id_val,
                session_id=quiz_session_obj.id,
                notification_type='session_invite',
                is_read=False
            ).update({'is_read': True})

        db.session.commit()
        return jsonify({'message': message_response_str, 'action': action_taken_str}), 200
    except IntegrityError:
        db.session.rollback();
        return jsonify({'error': 'Database conflict. You might already be in the session.'}), 409
    except Exception as e:
        db.session.rollback(); print(f"Error joining session {session_code_param}: {e}")
        return jsonify({'error': 'Could not join the session due to an internal error'}), 500

@main_bp.route('/sessions/<string:session_code_param>/start', methods=['POST'])
def start_quiz_session(session_code_param):
    if 'user_id' not in session: return jsonify({'error': 'Not logged in'}), 401
    user_id_val = session['user_id']
    quiz_session_obj = QuizSession.query.filter_by(code=session_code_param).first()

    if not quiz_session_obj: return jsonify({'error': 'Session not found'}), 404
    if quiz_session_obj.host_id != user_id_val: return jsonify({'error': 'Only the host can start this session'}), 403
    if quiz_session_obj.started: return jsonify({'error': 'Session has already started'}), 400

    if not quiz_session_obj.participants:
        return jsonify({'error': 'Cannot start a session with no participants'}), 400

    try:
        quiz_session_obj.started = True; db.session.commit()
        return jsonify({'message': 'Session started successfully'}), 200
    except Exception as e:
        db.session.rollback(); print(f"Error starting session {session_code_param}: {e}")
        return jsonify({'error': 'Could not start the session due to an internal error'}), 500

@main_bp.route('/sessions/<string:session_code_param>', methods=['GET'])
def get_session_details(session_code_param):
    quiz_session_obj = QuizSession.query.options(
        joinedload(QuizSession.host),
        joinedload(QuizSession.quiz).joinedload(Quiz.user)
    ).filter_by(code=session_code_param).first()

    if not quiz_session_obj: return jsonify({'error': 'Session not found'}), 404

    host_user_obj = quiz_session_obj.host
    current_quiz_obj = quiz_session_obj.quiz
    quiz_creator_obj = current_quiz_obj.user if current_quiz_obj else None
    
    aware_created_at = quiz_session_obj.created_at.replace(tzinfo=timezone.utc) if quiz_session_obj.created_at else None

    return jsonify({
        'code': quiz_session_obj.code,
        'quiz_id': quiz_session_obj.quiz_id,
        'quiz_name': current_quiz_obj.name if current_quiz_obj else "N/A",
        'host_id': host_user_obj.id if host_user_obj else None,
        'host_username': host_user_obj.username if host_user_obj else "N/A",
        'host_avatar': host_user_obj.avatar if host_user_obj else None,
        'started': quiz_session_obj.started,
        'created_at': aware_created_at.isoformat() if aware_created_at else None,
        'num_teams': quiz_session_obj.num_teams,
        'is_team_mode': quiz_session_obj.is_team_mode,
        'quiz_maker_username': quiz_creator_obj.username if quiz_creator_obj else "N/A",
        'quiz_maker_avatar': quiz_creator_obj.avatar if quiz_creator_obj else None,
        'quiz_maker_id': quiz_creator_obj.id if quiz_creator_obj else None,
    }), 200

@main_bp.route('/sessions/<string:session_code_param>/participants', methods=['GET'])
def get_session_participants(session_code_param):
    quiz_session_obj = QuizSession.query.filter_by(code=session_code_param).first()
    if not quiz_session_obj: return jsonify({'error': 'Session not found'}), 404

    participants_list_data = SessionParticipant.query.options(
        joinedload(SessionParticipant.user)
    ).filter_by(session_id=quiz_session_obj.id).all()

    return jsonify([{
        'user_id': p.user.id, 'username': p.user.username, 'avatar': p.user.avatar,
        'team_number': p.team_number, 'score': p.score
    } for p in participants_list_data if p.user]), 200


@main_bp.route('/sessions/<string:session_code_param>/submit-score', methods=['POST'])
def submit_session_score(session_code_param):
    if 'user_id' not in session: return jsonify({'error': 'Not logged in'}), 401
    user_id_val = session['user_id']
    score_req_val = (request.get_json() or {}).get('score')

    if score_req_val is None: return jsonify({'error': 'Score is required'}), 400
    try: score_float = float(score_req_val)
    except (ValueError, TypeError): return jsonify({'error': 'Invalid score format, must be a number'}), 400

    participant_obj = SessionParticipant.query.join(QuizSession).filter(
        QuizSession.code == session_code_param,
        SessionParticipant.user_id == user_id_val
    ).first()

    if not participant_obj: return jsonify({'error': 'Participant not found in this session or session does not exist'}), 404
    if not participant_obj.session.started : return jsonify({'error': 'Cannot submit score, session not started yet'}), 403

    try:
        participant_obj.score = score_float; db.session.commit()
        return jsonify({'message': 'Score submitted successfully'}), 200
    except Exception as e:
        db.session.rollback(); print(f"Error submitting score for user {user_id_val} in session {session_code_param}: {e}")
        return jsonify({'error': 'Could not submit score due to an internal error'}), 500

@main_bp.route('/sessions/<string:session_code_param>/results', methods=['GET'])
def get_quiz_session_results(session_code_param):
    quiz_session_obj = QuizSession.query.filter_by(code=session_code_param).first()
    if not quiz_session_obj: return jsonify({'error': 'Session not found'}), 404

    participants_list_data = SessionParticipant.query.options(joinedload(SessionParticipant.user)).filter_by(
        session_id=quiz_session_obj.id
    ).order_by(SessionParticipant.score.desc()).all()

    return jsonify([{
        'user_id': p.user.id, 'username': p.user.username, 'avatar': p.user.avatar,
        'score': p.score if p.score is not None else 0.0,
        'team_number': p.team_number
    } for p in participants_list_data if p.user]), 200

@main_bp.route('/simulate/<int:quiz_id_param>', methods=['GET'])
def simulate_quiz_session(quiz_id_param):
    if 'user_id' not in session: return jsonify({'error': 'Not logged in'}), 401

    quiz_obj = Quiz.query.get(quiz_id_param)

    if not quiz_obj: return jsonify({'error': 'Quiz not found'}), 404

    questions_data_list = []
    for q_model_item in quiz_obj.questions:
        q_item_dict = {'id': q_model_item.id, 'type': q_model_item.question_type, 'text': q_model_item.question_text}
        if isinstance(q_model_item, MultipleChoiceQuestion):
            q_item_dict['options'] = [{'id': opt.id, 'text': opt.text} for opt in q_model_item.options]
            q_item_dict['correct_option_id'] = q_model_item.correct_option_id
            q_item_dict['correct_answer_text'] = q_model_item.correct_answer_text
        elif isinstance(q_model_item, SliderQuestion):
            q_item_dict.update({'min': q_model_item.min_value, 'max': q_model_item.max_value, 'step': q_model_item.step, 'correct_value': q_model_item.correct_value})
        elif isinstance(q_model_item, TextInputQuestion):
            q_item_dict.update({'max_length': q_model_item.max_length, 'correct_answer': q_model_item.correct_answer})
        questions_data_list.append(q_item_dict)

    return jsonify({'quiz_id': quiz_obj.id, 'quiz_name': quiz_obj.name, 'questions': questions_data_list}), 200

@main_bp.route('/notifications', methods=['GET'])
def get_notifications():
    if 'user_id' not in session: return jsonify({'error': 'Not logged in'}), 401
    user_id_val = session['user_id']

    limit_val = request.args.get('limit', 10, type=int)
    if limit_val > 50: limit_val = 50

    query_obj = Notification.query.filter_by(recipient_id=user_id_val).options(
        joinedload(Notification.sender),
        joinedload(Notification.session_info).joinedload(QuizSession.quiz)
    )

    notifications_list_data = query_obj.order_by(Notification.created_at.desc()).limit(limit_val).all()
    return jsonify([n.to_dict() for n in notifications_list_data]), 200

@main_bp.route('/notifications/count', methods=['GET'])
def get_unread_notification_count():
    if 'user_id' not in session: return jsonify({'error': 'Not logged in'}), 401
    user_id_val = session['user_id']
    count_val = Notification.query.filter_by(recipient_id=user_id_val, is_read=False).count()
    return jsonify({'count': count_val}), 200

@main_bp.route('/notifications/<int:notification_id_param>/read', methods=['POST'])
def mark_notification_read(notification_id_param):
    if 'user_id' not in session: return jsonify({'error': 'Not logged in'}), 401
    user_id_val = session['user_id']

    notification_obj = db.session.get(Notification, notification_id_param)
    if not notification_obj: return jsonify({'error': 'Notification not found'}), 404
    if notification_obj.recipient_id != user_id_val: return jsonify({'error': 'Forbidden: This is not your notification'}), 403

    if notification_obj.is_read: return jsonify({'message': 'Notification was already marked as read'}), 200

    try:
        notification_obj.is_read = True; db.session.commit()
        return jsonify({'message': 'Notification marked as read'}), 200
    except Exception as e:
        db.session.rollback(); print(f"Error marking notification {notification_id_param} as read: {e}")
        return jsonify({'error': 'Could not mark notification as read'}), 500

@main_bp.route('/notifications/mark-all-read', methods=['POST'])
def mark_all_notifications_as_read():
    if 'user_id' not in session: return jsonify({'error': 'Not logged in'}), 401
    user_id_val = session['user_id']

    try:
        updated_count_val = Notification.query.filter_by(
            recipient_id=user_id_val,
            is_read=False
        ).update({'is_read': True})

        db.session.commit()

        print(f"Marked {updated_count_val} notifications as read for user {user_id_val}.")

        return jsonify({'message': f'{updated_count_val} notifications marked as read.'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error marking all notifications as read for user {user_id_val}: {e}")
        return jsonify({'error': 'Could not mark all notifications as read'}), 500