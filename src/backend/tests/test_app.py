import pytest
from werkzeug.security import generate_password_hash

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
