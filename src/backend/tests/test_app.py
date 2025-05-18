import pytest
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta, timezone

from src.backend.app import User, Quiz, Question, QuizSession, SessionParticipant, Notification, create_app
from src.backend.init_flask import db
from src.backend.Questions import TextInputQuestion, MultipleChoiceQuestion, MultipleChoiceOption, SliderQuestion
from src.backend.config import TestConfig


@pytest.fixture(scope='module')
def app_instance():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
    yield app
    with app.app_context():
        db.drop_all()


@pytest.fixture
def app(app_instance):
    with app_instance.app_context():
        db.drop_all()
        db.create_all()
    return app_instance


@pytest.fixture
def client(app):  # This client is unauthenticated by default
    return app.test_client()


@pytest.fixture
def new_user_factory(app):
    def _new_user(username, password, bio=None, avatar=1, notifications_enabled=True):
        with app.app_context():
            user = User(username=username, bio=bio, avatar=avatar, notifications_enabled=notifications_enabled)
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            return {"id": user.id, "username": user.username, "avatar": user.avatar,
                    "notifications_enabled": user.notifications_enabled}

    return _new_user


@pytest.fixture
def create_authenticated_client(app, new_user_factory):
    """
    A factory that creates a new test client AND authenticates a user for IT.
    This ensures client sessions are isolated for multi-user tests.
    """

    def _factory(username, password, bio=None, avatar=1):
        user_data = new_user_factory(username, password, bio, avatar)
        # Create a NEW client instance for this specific authenticated user
        # This is crucial for isolating sessions between different "users" in tests.
        temp_client = app.test_client()
        login_response = temp_client.post('/login', json={'username': username, 'password': password})
        assert login_response.status_code == 200, f"Login failed for {username} in create_authenticated_client: {login_response.get_json()}"
        return temp_client, user_data

    return _factory


@pytest.fixture
def create_quiz_factory(app):
    def _create_quiz(user_id, quiz_name="My Test Quiz", questions_data=None):
        with app.app_context():
            quiz = Quiz(user_id=user_id, name=quiz_name)
            db.session.add(quiz)
            db.session.flush()

            if questions_data is None:
                questions_data = [{
                    'type': 'text_input',
                    'text': 'What is 1+1?',
                    'correct_answer': '2',
                    'max_length': 10
                }]

            created_questions_info = []
            for q_data in questions_data:
                q_type = q_data['type']
                q_text = q_data['text']
                question_instance = None
                if q_type == 'text_input':
                    question_instance = TextInputQuestion(quiz_id=quiz.id, question_text=q_text,
                                                          correct_answer=q_data['correct_answer'],
                                                          max_length=q_data.get('max_length', 255))
                elif q_type == 'multiple_choice':
                    question_instance = MultipleChoiceQuestion(quiz_id=quiz.id, question_text=q_text)
                    db.session.add(question_instance)
                    db.session.flush()
                    for opt_data in q_data['options']:
                        db.session.add(MultipleChoiceOption(question_id=question_instance.id, text=opt_data['text'],
                                                            is_correct=opt_data['isCorrect']))
                elif q_type == 'slider':
                    question_instance = SliderQuestion(quiz_id=quiz.id, question_text=q_text, min_value=q_data['min'],
                                                       max_value=q_data['max'], step=q_data['step'],
                                                       correct_value=q_data['correct_value'])

                if question_instance and q_type != 'multiple_choice':
                    db.session.add(question_instance)

                if question_instance:
                    db.session.flush()
                    created_questions_info.append({"id": question_instance.id, "type": question_instance.question_type})

            db.session.commit()
            return {"id": quiz.id, "name": quiz.name}, created_questions_info

    return _create_quiz


# --- Authentication Tests ---
def test_signup_success(client, app):  # client here is unauthenticated
    response = client.post('/signup', json={'username': 'testuser', 'password': 'testpassword'})
    assert response.status_code == 201
    data = response.get_json()
    assert data['message'] == 'User testuser registered successfully'
    with app.app_context():
        user_in_db = User.query.filter_by(username='testuser').first()
        assert user_in_db is not None


def test_signup_duplicate_username(client, new_user_factory):  # client here is unauthenticated
    new_user_factory(username='dupeuser', password='somepassword')
    response = client.post('/signup', json={'username': 'dupeuser', 'password': 'anotherpassword'})
    assert response.status_code == 409


def test_login_success(client, new_user_factory, app):  # client here is unauthenticated
    user_data = new_user_factory(username='loginuser', password='mypassword')
    response = client.post('/login', json={'username': 'loginuser', 'password': 'mypassword'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['message'] == 'Logged in as loginuser'
    assert data['user']['id'] == user_data['id']
    assert data['user']['username'] == user_data['username']
    with client.session_transaction() as sess:  # session is now set on this client
        assert sess['user_id'] == user_data['id']
        assert sess['username'] == user_data['username']


def test_login_invalid_credentials(client):  # client here is unauthenticated
    response = client.post('/login', json={'username': 'nonexistentuser', 'password': 'wrongpassword'})
    assert response.status_code == 401


def test_login_missing_fields(client):  # client here is unauthenticated
    response = client.post('/login', json={'username': 'loginuser'})
    assert response.status_code == 400


def test_home_auth_check(client, create_authenticated_client):  # client here is unauthenticated
    resp_unauth = client.get('/home')
    assert resp_unauth.status_code == 401

    authed_client, user_data = create_authenticated_client(username="homeuser", password="pw")
    resp_auth = authed_client.get('/home')  # Use the authenticated client
    assert resp_auth.status_code == 200
    assert resp_auth.get_json()['message'] == f'Welkom, {user_data["username"]}!'


def test_logout(create_authenticated_client):
    authed_client, _ = create_authenticated_client(username="logoutuser", password="pw")
    logout_resp = authed_client.post('/logout')
    assert logout_resp.status_code == 200
    with authed_client.session_transaction() as sess:
        assert 'user_id' not in sess
    home_resp = authed_client.get('/home')  # Check with the same client that just logged out
    assert home_resp.status_code == 401


# --- Profile Tests ---
def test_get_profile(create_authenticated_client, app):
    authed_client, user_data = create_authenticated_client(username="profileuser", password="pw", bio="Test bio",
                                                           avatar=5)
    response = authed_client.get('/profile')
    assert response.status_code == 200
    data = response.get_json()
    assert data['id'] == user_data['id']
    assert data['username'] == user_data['username']
    assert data['bio'] == "Test bio"
    assert data['avatar'] == 5


def test_update_profile_success(create_authenticated_client, app):
    authed_client, user_data_orig = create_authenticated_client(username="origuser", password="pw")
    user_id = user_data_orig['id']
    update_data = {'username': 'newusername', 'bio': 'Updated bio.', 'avatar': 7, 'banner_type': 'image',
                   'banner_value': '3', 'notifications_enabled': False}
    response = authed_client.post('/profile', json=update_data)
    assert response.status_code == 200
    data = response.get_json()
    assert data['user']['username'] == 'newusername'
    with app.app_context():
        updated_user_db = db.session.get(User, user_id)
        assert updated_user_db.username == 'newusername'
        assert updated_user_db.bio == 'Updated bio.'
    with authed_client.session_transaction() as sess:
        assert sess['username'] == 'newusername'


def test_update_profile_username_taken(create_authenticated_client, new_user_factory, app):
    authed_client, user1_data = create_authenticated_client(username="user1", password="pw1")
    new_user_factory(username="existinguser", password="password")  # Create the other user

    response = authed_client.post('/profile', json={'username': 'existinguser'})
    assert response.status_code == 409
    with app.app_context():  # Verify user1 in DB is unchanged
        user1_db = db.session.get(User, user1_data['id'])
        assert user1_db.username == 'user1'
    with authed_client.session_transaction() as sess:  # Verify user1's session is unchanged
        assert sess['username'] == 'user1'


def test_update_profile_no_changes(create_authenticated_client):
    authed_client, _ = create_authenticated_client(username="nochangeuser", password="pw", bio="Initial bio")
    response = authed_client.post('/profile', json={'bio': 'Initial bio'})
    assert response.status_code == 200


def test_update_profile_invalid_data(create_authenticated_client):
    authed_client, _ = create_authenticated_client(username="invaliddatauser", password="pw")
    response = authed_client.post('/profile', json={'avatar': 99})
    assert response.status_code == 400
    response = authed_client.post('/profile', json={'banner_type': 'invalid_type', 'banner_value': 'foo'})
    assert response.status_code == 400
    response = authed_client.post('/profile', json={'username': ''})
    assert response.status_code == 400


# --- Password Management Tests ---
def test_change_password_success(create_authenticated_client, app):  # Added app for the new client
    authed_client, user_data = create_authenticated_client(username="changepwuser", password="oldpassword")
    response = authed_client.post('/change-password',
                                  json={'currentPassword': 'oldpassword', 'newPassword': 'newpassword',
                                        'confirmPassword': 'newpassword'})
    assert response.status_code == 200

    authed_client.post('/logout')  # Logout from current client session

    # Need a new client or re-login the existing one with new password
    fresh_client_for_login_test = app.test_client()
    login_response = fresh_client_for_login_test.post('/login', json={'username': user_data['username'],
                                                                      'password': 'newpassword'})
    assert login_response.status_code == 200


def test_change_password_incorrect_current(create_authenticated_client):
    authed_client, _ = create_authenticated_client(username="changepwfail", password="oldpassword")
    response = authed_client.post('/change-password',
                                  json={'currentPassword': 'wrongoldpassword', 'newPassword': 'newpassword',
                                        'confirmPassword': 'newpassword'})
    assert response.status_code == 401


def test_delete_account_success(create_authenticated_client, app):
    authed_client, user_data = create_authenticated_client(username="todelete", password="password")
    user_id = user_data['id']
    response = authed_client.delete('/delete-account', json={'password': 'password'})
    assert response.status_code == 200
    with app.app_context():
        assert db.session.get(User, user_id) is None
    with authed_client.session_transaction() as sess:
        assert 'user_id' not in sess


# --- Quiz Management Tests ---
def test_get_user_quizzes_unauthenticated(client):  # client is unauthenticated
    response = client.get('/quizzes')
    assert response.status_code == 401


def test_get_user_quizzes_empty(create_authenticated_client):
    authed_client, _ = create_authenticated_client(username="quizempty", password="pw")
    response = authed_client.get('/quizzes')
    assert response.status_code == 200
    assert response.json == []


def test_get_user_quizzes_with_data(create_authenticated_client, create_quiz_factory, app):
    authed_client, user_data = create_authenticated_client(username="quizhaver", password="pw")
    create_quiz_factory(user_id=user_data['id'], quiz_name="Quiz One")
    create_quiz_factory(user_id=user_data['id'], quiz_name="Quiz Two")
    response = authed_client.get('/quizzes')
    assert response.status_code == 200
    data = response.json
    assert len(data) == 2


def test_create_quiz_success(create_authenticated_client, app):
    authed_client, user_data = create_authenticated_client(username="quizcreator", password="pw")
    quiz_payload = {'name': 'My New Awesome Quiz', 'questions': [{'type': 'multiple_choice', 'text': 'Q1?',
                                                                  'options': [{'text': 'A', 'isCorrect': True},
                                                                              {'text': 'B', 'isCorrect': False}]}]}
    response = authed_client.post('/quiz', json=quiz_payload)
    assert response.status_code == 201
    data = response.get_json()
    quiz_id = data['quiz_id']
    with app.app_context():
        quiz_db = db.session.get(Quiz, quiz_id)
        assert quiz_db is not None
        assert quiz_db.name == 'My New Awesome Quiz'
        assert quiz_db.user_id == user_data['id']


def test_create_quiz_invalid_data(create_authenticated_client):
    authed_client, _ = create_authenticated_client(username="quizinvalid", password="pw")
    response = authed_client.post('/quiz', json={'questions': []})
    assert response.status_code == 400
    response = authed_client.post('/quiz', json={'name': 'Test Quiz', 'questions': []})
    assert response.status_code == 400


def test_get_quiz_details(create_authenticated_client, create_quiz_factory):
    authed_client, user_data = create_authenticated_client(username="quizdetailviewer", password="pw")
    quiz_info, _ = create_quiz_factory(user_id=user_data['id'], quiz_name="Detailed Quiz", questions_data=[
        {'type': 'slider', 'text': 'Rate this', 'min': 0, 'max': 10, 'step': 1, 'correct_value': 5}])
    response = authed_client.get(f'/quizzes/{quiz_info["id"]}')
    assert response.status_code == 200
    data = response.json
    assert data['id'] == quiz_info['id']
    assert data['name'] == "Detailed Quiz"


def test_get_quiz_not_found(create_authenticated_client):
    authed_client, _ = create_authenticated_client(username="quiznotfound", password="pw")
    response = authed_client.get('/quizzes/9999')
    assert response.status_code == 404


def test_update_quiz_success(create_authenticated_client, create_quiz_factory, app):
    authed_client, user_data = create_authenticated_client(username="quizupdater", password="pw")
    quiz_info, _ = create_quiz_factory(user_id=user_data['id'], quiz_name="Old Name")
    updated_quiz_data = {'name': 'Updated Awesome Name', 'questions': [
        {'type': 'text_input', 'text': 'New Q', 'correct_answer': 'A', 'max_length': 10}]}
    response = authed_client.put(f'/quizzes/{quiz_info["id"]}', json=updated_quiz_data)
    assert response.status_code == 200
    with app.app_context():
        updated_quiz_db = db.session.get(Quiz, quiz_info["id"])
        assert updated_quiz_db.name == 'Updated Awesome Name'
        assert len(updated_quiz_db.questions) == 1


def test_delete_quiz_success(create_authenticated_client, create_quiz_factory, app):
    authed_client, user_data = create_authenticated_client(username="quizdeleter", password="pw")
    quiz_info, _ = create_quiz_factory(user_id=user_data['id'], quiz_name="To Be Deleted")
    response = authed_client.delete(f'/quizzes/{quiz_info["id"]}')
    assert response.status_code == 200
    with app.app_context():
        assert db.session.get(Quiz, quiz_info["id"]) is None


def test_delete_quiz_not_owner(create_authenticated_client, create_quiz_factory, new_user_factory, app):
    owner_client, owner_data = create_authenticated_client(username="owner", password="pw_owner")
    quiz_info, _ = create_quiz_factory(user_id=owner_data['id'], quiz_name="Owner's Quiz")

    other_client, _ = create_authenticated_client(username="otheruser", password="pw_other")

    response_other = other_client.delete(f'/quizzes/{quiz_info["id"]}')
    assert response_other.status_code == 403
    with app.app_context():
        assert db.session.get(Quiz, quiz_info["id"]) is not None


# --- Follow/Unfollow Tests ---
def test_follow_unfollow_user(create_authenticated_client, new_user_factory, app):
    client_user1, user1_data = create_authenticated_client(username="user1", password="pw1")
    user2_data = new_user_factory(username="user2", password="p2")  # User2 is created but not logged in to client_user1

    response_follow = client_user1.post(f'/follow/{user2_data["id"]}')
    assert response_follow.status_code == 200
    with app.app_context():
        user1_db = db.session.get(User, user1_data["id"])
        user2_db = db.session.get(User, user2_data["id"])
        assert user1_db.is_following(user2_db)
        if user2_db.notifications_enabled:  # Check actual value from created user
            assert Notification.query.filter_by(recipient_id=user2_data["id"], sender_id=user1_data["id"],
                                                notification_type='new_follower').count() == 1

    response_unfollow = client_user1.post(f'/unfollow/{user2_data["id"]}')
    assert response_unfollow.status_code == 200
    with app.app_context():
        user1_db_after = db.session.get(User, user1_data["id"])
        user2_db_after = db.session.get(User, user2_data["id"])
        assert not user1_db_after.is_following(user2_db_after)


# --- Notification Tests ---
def test_get_notification_count(create_authenticated_client, new_user_factory, app):
    authed_client, recipient_data = create_authenticated_client(username="recipient", password="pw")
    sender_data = new_user_factory(username="sender", password="pw_sender")
    with app.app_context():
        db.session.add(
            Notification(recipient_id=recipient_data["id"], sender_id=sender_data["id"], notification_type="test_event",
                         message="Test"))
        db.session.commit()
    response = authed_client.get('/notifications/count')
    assert response.status_code == 200
    assert response.get_json()['count'] == 1


def test_get_notifications(create_authenticated_client, new_user_factory, app):
    authed_client, recipient_data = create_authenticated_client(username="recipient", password="pw")
    sender_data = new_user_factory(username="sender", password="pw_sender")
    with app.app_context():
        ts1 = datetime.now(timezone.utc) - timedelta(minutes=5)
        ts2 = datetime.now(timezone.utc)
        notif1 = Notification(recipient_id=recipient_data["id"], sender_id=sender_data["id"],
                              notification_type="event1", message="First", created_at=ts1)
        notif2 = Notification(recipient_id=recipient_data["id"], sender_id=sender_data["id"],
                              notification_type="event2", message="Second", created_at=ts2, is_read=True)
        db.session.add_all([notif1, notif2]);
        db.session.commit()
    response = authed_client.get('/notifications?limit=5')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 2


def test_mark_notification_read(create_authenticated_client, new_user_factory, app):
    authed_client, recipient_data = create_authenticated_client(username="recipient", password="pw")
    sender_data = new_user_factory(username="sender", password="pw_sender")
    with app.app_context():
        notif = Notification(recipient_id=recipient_data["id"], sender_id=sender_data["id"],
                             notification_type="unread_event", message="Unread")
        db.session.add(notif);
        db.session.commit()
        notif_id = notif.id
    response = authed_client.post(f'/notifications/{notif_id}/read')
    assert response.status_code == 200
    with app.app_context():
        assert db.session.get(Notification, notif_id).is_read == True


# --- Quiz Session Basic Tests ---
def test_create_quiz_session(create_authenticated_client, create_quiz_factory):
    host_client, host_data = create_authenticated_client(username="host", password="pw_host")
    quiz_info, _ = create_quiz_factory(user_id=host_data['id'], quiz_name="Session Quiz")
    response = host_client.post('/sessions', json={'quiz_id': quiz_info['id'], 'num_teams': 1})
    assert response.status_code == 201
    data = response.get_json()
    assert 'code' in data


def test_join_quiz_session(create_authenticated_client, create_quiz_factory, new_user_factory, app):
    host_client, host_data = create_authenticated_client(username="host", password="pw_host")
    quiz_info, _ = create_quiz_factory(user_id=host_data['id'])
    create_session_resp = host_client.post('/sessions', json={'quiz_id': quiz_info['id'], 'num_teams': 1})
    session_code = create_session_resp.get_json()['code']

    participant_client, participant_data = create_authenticated_client(username="participant",
                                                                       password="pw_participant")
    join_response = participant_client.post(f'/sessions/{session_code}/join', json={})
    assert join_response.status_code == 200
    with app.app_context():
        q_session_db = QuizSession.query.filter_by(code=session_code).first()
        assert SessionParticipant.query.filter_by(session_id=q_session_db.id,
                                                  user_id=participant_data['id']).count() == 1


def test_start_quiz_session(create_authenticated_client, create_quiz_factory, new_user_factory, app):
    host_client, host_data = create_authenticated_client(username="host", password="pw_host")
    quiz_info, _ = create_quiz_factory(user_id=host_data['id'])
    create_session_resp = host_client.post('/sessions', json={'quiz_id': quiz_info['id'], 'num_teams': 1})
    session_code = create_session_resp.get_json()['code']

    participant_client, _ = create_authenticated_client(username="participant", password="pw_participant")
    join_resp = participant_client.post(f'/sessions/{session_code}/join', json={})
    assert join_resp.status_code == 200  # Ensure join was successful

    start_response = host_client.post(f'/sessions/{session_code}/start')
    assert start_response.status_code == 200  # This was failing
    assert start_response.get_json()['message'] == 'Session started successfully'

    with app.app_context():
        q_session_db = QuizSession.query.filter_by(code=session_code).first()
        assert q_session_db is not None
        assert q_session_db.started == True


def test_get_quiz_session_results(create_authenticated_client, create_quiz_factory, new_user_factory, app):
    host_client, host_data = create_authenticated_client(username="host", password="pw_host")
    quiz_info, _ = create_quiz_factory(user_id=host_data['id'])
    create_session_resp = host_client.post('/sessions', json={'quiz_id': quiz_info['id'], 'num_teams': 1})
    session_code = create_session_resp.get_json()['code']

    p1_client, p1_data = create_authenticated_client(username="p1", password="pw_p1")
    join_resp = p1_client.post(f'/sessions/{session_code}/join', json={})
    assert join_resp.status_code == 200

    start_resp = host_client.post(f'/sessions/{session_code}/start')
    assert start_resp.status_code == 200

    submit_score_resp = p1_client.post(f'/sessions/{session_code}/submit-score', json={'score': 100.5})
    assert submit_score_resp.status_code == 200

    results_resp = host_client.get(f'/sessions/{session_code}/results')
    assert results_resp.status_code == 200
    data = results_resp.get_json()
    assert len(data) == 1
    assert data[0]['username'] == p1_data['username']
    assert data[0]['score'] == 100.5  # This was failing