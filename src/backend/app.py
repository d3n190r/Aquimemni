# src/backend/app.py

from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_session.__init__ import Session
from flask_cors import CORS
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

# Laad de configuratieklasse vanuit config.py
from .config import Config

# Maak de Flask-app aan en laad de configuratie
app = Flask(__name__)
app.config.from_object(Config)

# Initialiseer de database met SQLAlchemy en stel sessies in via Flask-Session
db = SQLAlchemy(app)
Session(app)

# Schakel CORS in zodat de React front-end API calls kan maken naar deze server
CORS(app, supports_credentials=True, resources={r"/*": {"origins": ["http://team5.ua-ppdb.me", "http://35.205.63.30"]}})

# Initialiseer Flask-Migrate voor het beheer van database migraties
migrate = Migrate(app, db)

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
    """
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)


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
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # Optioneel: als je een relatie naar de User wilt, kun je dit activeren:
    # user = db.relationship("User", backref="quizzes", lazy=True)


# ------------------------------
# ROUTES / ENDPOINTS
# ------------------------------

@app.route('/signup', methods=['POST'])
def signup():
    """
    Endpoint: /signup [POST]
    Verwerkt de registratie van een nieuwe gebruiker.
    Verwacht een JSON payload met 'username' en 'password'.
    """
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Gebruikersnaam en wachtwoord vereist"}), 400

    # Controleer of de gebruiker al bestaat
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"error": "Gebruikersnaam bestaat al"}), 409

    # Maak een nieuw account met een gehasht wachtwoord
    hashed_pw = generate_password_hash(password)
    new_user = User(username=username, password_hash=hashed_pw)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": f"Gebruiker {username} geregistreerd"}), 201


@app.route('/login', methods=['POST'])
def login():
    """
    Endpoint: /login [POST]
    Verwerkt de login van een gebruiker.
    Verwacht een JSON payload met 'username' en 'password'.
    Bij succesvolle login wordt de sessie ingesteld.
    """
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Gebruikersnaam en wachtwoord vereist"}), 400

    # Zoek naar de gebruiker in de database
    user = User.query.filter_by(username=username).first()
    if user is None or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Ongeldige login"}), 401

    # Login succesvol: stel de sessie in
    session.clear()
    session['user_id'] = user.id
    session['username'] = user.username

    return jsonify({"message": f"Ingelogd als {user.username}"}), 200


@app.route('/home', methods=['GET'])
def home():
    """
    Endpoint: /home [GET]
    Beschermde route die een welkomstbericht teruggeeft.
    Als de gebruiker niet is ingelogd, wordt een 401-status geretourneerd.
    """
    if 'user_id' not in session:
        return jsonify({"error": "Niet gemachtigd"}), 401

    username = session.get('username', 'Onbekend')
    return jsonify({"message": f"Welkom, {username}! Dit is een beschermde pagina."}), 200


@app.route('/logout', methods=['POST'])
def logout():
    """
    Endpoint: /logout [POST]
    Logt de gebruiker uit door de sessie te wissen.
    """
    session.clear()
    return jsonify({"message": "Uitgelogd"}), 200


@app.route('/quiz', methods=['POST'])
def create_quiz():
    """
    Endpoint: /quiz [POST]
    Maakt een nieuwe quiz aan.
    Verwacht een JSON payload met 'name' (de quiznaam).
    De quiz wordt gekoppeld aan de ingelogde gebruiker.
    """
    if 'user_id' not in session:
        return jsonify({"error": "Niet ingelogd"}), 401

    data = request.get_json() or {}
    quiz_name = data.get('name')

    if not quiz_name:
        return jsonify({"error": "Quiz-naam is verplicht"}), 400

    new_quiz = Quiz(
        user_id=session['user_id'],
        name=quiz_name
    )
    db.session.add(new_quiz)
    db.session.commit()

    return jsonify({"message": "Quiz aangemaakt", "quiz_id": new_quiz.id}), 201


@app.route('/quizzes', methods=['GET'])
def get_user_quizzes():
    """
    Endpoint: /quizzes [GET]
    Haalt alle quizzes op die horen bij de ingelogde gebruiker.
    Retourneert een JSON-array met quizgegevens (id, name, created_at).
    """
    if 'user_id' not in session:
        return jsonify({"error": "Niet ingelogd"}), 401

    user_id = session['user_id']
    quizzes = Quiz.query.filter_by(user_id=user_id).all()

    quizzes_data = [
        {
            "id": q.id,
            "name": q.name,
            "created_at": q.created_at.isoformat()
        }
        for q in quizzes
    ]
    return jsonify(quizzes_data), 200


# ------------------------------
# Applicatie starten
# ------------------------------
if __name__ == '__main__':
    with app.app_context():
        # Zorgt dat alle tabellen worden aangemaakt als ze nog niet bestaan
        db.create_all()
    app.run(debug=True)
