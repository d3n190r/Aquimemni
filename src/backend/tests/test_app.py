import pytest
from werkzeug.security import generate_password_hash

from src.backend.Questions import SliderQuestion, TextInputQuestion
from src.backend.init_flask import create_app, db
from src.backend.config import TestConfig
from src.backend.app import User, Quiz

@pytest.fixture
def app():
    """Create and configure a new app instance for testing."""
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()  # Forceer tabel creatie
    yield app
    with app.app_context():
        db.drop_all()

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()


def test_signup_success(client, app):
    # 1) Verstuur POST /signup
    response = client.post('/signup', json={
        'username': 'testuser',
        'password': 'testpassword'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['message'] == 'Gebruiker testuser geregistreerd'

    # 2) Check in DB
    with app.app_context():
        user_in_db = User.query.filter_by(username='testuser').first()
        assert user_in_db is not None
        # Niet plaintext
        assert user_in_db.password_hash != 'testpassword'
        # Check dat het ofwel scrypt ofwel pbkdf2 is
        valid_prefixes = ('scrypt:', 'pbkdf2:')
        assert user_in_db.password_hash.startswith(valid_prefixes)


def test_signup_duplicate_username(client, app):
    # Maak user in DB
    with app.app_context():
        user = User(username='dupeuser',
                    password_hash=generate_password_hash('somepassword'))
        db.session.add(user)
        db.session.commit()

    response = client.post('/signup', json={
        'username': 'dupeuser',
        'password': 'anderewachtwoord'
    })
    assert response.status_code == 409
    data = response.get_json()
    assert 'Gebruikersnaam bestaat al' in data['error']


def test_login_success(client, app):
    # Vooraf user in DB + onthoud ID als int
    with app.app_context():
        user = User(username='loginuser',
                    password_hash=generate_password_hash('mypassword'))
        db.session.add(user)
        db.session.commit()
        created_user_id = user.id

    # Inloggen
    response = client.post('/login', json={
        'username': 'loginuser',
        'password': 'mypassword'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'Ingelogd als loginuser' in data['message']

    # Check session
    with client.session_transaction() as sess:
        # Vergelijk met de integer, zodat we user niet opnieuw hoeven aan te roepen
        assert sess['user_id'] == created_user_id
        assert sess['username'] == 'loginuser'


def test_login_invalid(client, app):
    response = client.post('/login', json={
        'username': 'nietbestaat',
        'password': 'foutpw'
    })
    assert response.status_code == 401
    data = response.get_json()
    assert 'Ongeldige login' in data['error']


def test_home_protected(client, app):
    # Oningelogd => 401
    resp_unauth = client.get('/home')
    assert resp_unauth.status_code == 401
    assert resp_unauth.get_json()['error'] == 'Niet gemachtigd'

    # Maak user en login
    with app.app_context():
        user = User(username='homeuser',
                    password_hash=generate_password_hash('secret'))
        db.session.add(user)
        db.session.commit()

    client.post('/login', json={'username': 'homeuser','password': 'secret'})

    resp_home = client.get('/home')
    assert resp_home.status_code == 200
    data_home = resp_home.get_json()
    assert 'Welkom, homeuser!' in data_home['message']


def test_logout(client, app):
    with app.app_context():
        user = User(username='logoutuser',
                    password_hash=generate_password_hash('secret'))
        db.session.add(user)
        db.session.commit()

    # Inloggen
    login_resp = client.post('/login', json={
        'username': 'logoutuser',
        'password': 'secret'
    })
    assert login_resp.status_code == 200

    # Logout
    logout_resp = client.post('/logout')
    assert logout_resp.status_code == 200
    data = logout_resp.get_json()
    assert data['message'] == 'Uitgelogd'

    with client.session_transaction() as sess:
        assert 'user_id' not in sess
        assert 'username' not in sess


def test_get_user_quizzes_unauthenticated(client):
    response = client.get('/quizzes')
    assert response.status_code == 401
    assert response.json['error'] == 'Niet ingelogd'


def test_get_user_quizzes_empty(client, app):
    with app.app_context():
        user = User(username='testuser', password_hash=generate_password_hash('testpass'))
        db.session.add(user)
        db.session.commit()

    client.post('/login', json={'username': 'testuser', 'password': 'testpass'})
    response = client.get('/quizzes')
    assert response.status_code == 200
    assert response.json == []


def test_get_user_quizzes_with_data(client, app):
    with app.app_context():
        # Eerst user committen
        user = User(username='testuser', password_hash=generate_password_hash('testpass'))
        db.session.add(user)
        db.session.commit()  # Explicit commit

        # Nu quiz aanmaken met geldige user_id
        quiz = Quiz(user_id=user.id, name='Test Quiz')
        question = TextInputQuestion(
            quiz=quiz,
            question_text='Test Question',
            max_length=255,
            correct_answer='Answer'
        )
        db.session.add_all([quiz, question])
        db.session.commit()  # Opnieuw committen

    client.post('/login', json={'username': 'testuser', 'password': 'testpass'})
    response = client.get('/quizzes')
    data = response.json

    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]['name'] == 'Test Quiz'

def test_create_quiz_unauthenticated(client):
    response = client.post('/quiz', json={'name': 'New Quiz'})
    assert response.status_code == 401


def test_create_quiz_success(client, app):
    with app.app_context():
        user = User(username='testuser', password_hash=generate_password_hash('testpass'))
        db.session.add(user)
        db.session.commit()

    client.post('/login', json={'username': 'testuser', 'password': 'testpass'})

    quiz_data = {
        'name': 'New Quiz',
        'questions': [{
            'type': 'multiple_choice',
            'text': 'MC Question',
            'options': [
                {'text': 'Option 1', 'isCorrect': False},
                {'text': 'Option 2', 'isCorrect': True}
            ]
        }]
    }

    response = client.post('/quiz', json=quiz_data)
    assert response.status_code == 201

    with app.app_context():
        quiz = Quiz.query.first()
        assert quiz.name == 'New Quiz'
        assert len(quiz.questions) == 1
        assert quiz.questions[0].question_type == 'multiple_choice'
        assert len(quiz.questions[0].options) == 2


def test_get_quiz_success(client, app):
    with app.app_context():
        user = User(username='testuser', password_hash=generate_password_hash('testpass'))
        db.session.add(user)
        db.session.commit()

        quiz = Quiz(user_id=user.id, name='Test Quiz')
        question = SliderQuestion(
            quiz=quiz,
            question_text='Slider Question',
            min_value=0,
            max_value=100,
            correct_value=50
        )
        db.session.add_all([quiz, question])
        db.session.commit()
        quiz_id = quiz.id  # ID opslaan terwijl de sessie actief is

    client.post('/login', json={'username': 'testuser', 'password': 'testpass'})
    response = client.get(f'/quizzes/{quiz_id}')
    data = response.json

    assert response.status_code == 200
    assert data['name'] == 'Test Quiz'


def test_profile_operations(client, app):
    # Test GET profile
    with app.app_context():
        user = User(
            username='profileuser',
            password_hash=generate_password_hash('testpass'),
            bio='Original bio',
            avatar=3
        )
        db.session.add(user)
        db.session.commit()

    client.post('/login', json={'username': 'profileuser', 'password': 'testpass'})

    # Get profile
    response = client.get('/profile')
    assert response.status_code == 200
    assert response.json['avatar'] == 3

    # Update profile
    update_data = {
        'username': 'newusername',
        'bio': 'Updated bio',
        'avatar': 5
    }
    response = client.post('/profile', json=update_data)
    assert response.status_code == 200

    with app.app_context():
        updated_user = User.query.first()
        assert updated_user.username == 'newusername'
        assert updated_user.avatar == 5


def test_delete_quiz_success(client, app):
    with app.app_context():
        user = User(username='testuser', password_hash=generate_password_hash('testpass'))
        db.session.add(user)
        db.session.commit()

        quiz = Quiz(user_id=user.id, name='To Delete')
        db.session.add(quiz)
        db.session.commit()
        quiz_id = quiz.id  # ID opslaan binnen sessie context

    client.post('/login', json={'username': 'testuser', 'password': 'testpass'})
    response = client.delete(f'/quizzes/{quiz_id}')
    assert response.status_code == 200

    with app.app_context():
        assert db.session.get(Quiz, quiz_id) is None


def test_update_quiz_success(client, app):
    with app.app_context():
        # User opslaan en committen
        user = User(username='testuser', password_hash=generate_password_hash('testpass'))
        db.session.add(user)
        db.session.commit()

        # Quiz aanmaken
        quiz = Quiz(user_id=user.id, name='Old Name')
        db.session.add(quiz)
        db.session.commit()

        # Quiz ID direct uit database halen
        quiz_id = quiz.id

    client.post('/login', json={'username': 'testuser', 'password': 'testpass'})

    update_data = {
        'name': 'Updated Name',
        'questions': [{
            'type': 'text_input',
            'text': 'New Question',
            'max_length': 500,
            'correct_answer': 'Correct'
        }]
    }

    response = client.put(f'/quizzes/{quiz_id}', json=update_data)
    assert response.status_code == 200

    with app.app_context():
        updated_quiz = db.session.get(Quiz, quiz_id)
        assert updated_quiz.name == 'Updated Name'

def test_duplicate_username_update(client, app):
    with app.app_context():
        user1 = User(username='user1', password_hash=generate_password_hash('pass1'))
        user2 = User(username='user2', password_hash=generate_password_hash('pass2'))
        db.session.add_all([user1, user2])
        db.session.commit()

    client.post('/login', json={'username': 'user1', 'password': 'pass1'})
    response = client.post('/profile', json={'username': 'user2'})
    assert response.status_code == 409