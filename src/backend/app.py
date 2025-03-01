from flask import Flask, session, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session  # zorg dat Flask-Session is geïnstalleerd: pip install Flask-Session
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config

app = Flask(__name__)
app.config.from_object(Config)        # Laad configuratie uit config.py
db = SQLAlchemy(app)                  # Initializeer database (SQLAlchemy)
Session(app)                          # Initializeer server-side sessies

class User(db.Model):
    __tablename__ = 'users'
    id       = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()  # JSON-body van het verzoek
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"error": "Gebruikersnaam en wachtwoord vereist"}), 400
    # Controleer of de gebruikersnaam al bestaat
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"error": "Gebruikersnaam bestaat al"}), 409
    # Maak een nieuwe gebruiker aan met gehashte wachtwoord
    hashed_pw = generate_password_hash(password)
    new_user = User(username=username, password_hash=hashed_pw)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": f"Gebruiker {username} geregistreerd"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"error": "Gebruikersnaam en wachtwoord vereist"}), 400
    # Zoek gebruiker in database
    user = User.query.filter_by(username=username).first()
    if user is None or not check_password_hash(user.password_hash, password):
        # Geen gebruiker gevonden of wachtwoord komt niet overeen
        return jsonify({"error": "Ongeldige login"}), 401
    # Inloggegevens correct -> sessie opslaan
    session.clear()  # eventuele oude sessie data verwijderen
    session['user_id'] = user.id    # sla bijv. user ID op in sessie
    session['username'] = user.username  # opslaan voor makkelijk gebruik
    return jsonify({"message": f"Ingelogd als {user.username}"}), 200

@app.route('/home', methods=['GET'])
def home():
    if 'user_id' not in session:
        return jsonify({"error": "Niet gemachtigd"}), 401
    # Haal eventueel gebruikersinfo op, hier een simpele welkomstboodschap
    username = session.get('username')
    return jsonify({"message": f"Welkom, {username}! Dit is een beschermde pagina."})

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()  # of gebruik session.pop('user_id', None) en session.pop('username', None)
    return jsonify({"message": "Uitgelogd"}), 200
