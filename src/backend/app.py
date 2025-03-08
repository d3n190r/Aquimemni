from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_session.__init__ import Session
from flask_cors import CORS
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash

# Laad de Config-klasse in uit config.py
from .config import Config

# Maak de Flask-app
app = Flask(__name__)
app.config.from_object(Config)

# Stel DB in met SQLAlchemy en sessies met Flask-Session
db = SQLAlchemy(app)
Session(app)

# Eventueel CORS inschakelen (voor React dev op localhost:3000)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": ["http://team5.ua-ppdb.me", "http://35.205.63.30"]}})

# Migrate voor database-migraties
migrate = Migrate(app, db)

# ---- DATABASE MODEL(S) ----
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

# ---- ROUTES ----

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Gebruikersnaam en wachtwoord vereist"}), 400

    # Bestaat de gebruiker al?
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"error": "Gebruikersnaam bestaat al"}), 409

    # Nieuw account aanmaken met gehasht wachtwoord
    hashed_pw = generate_password_hash(password)
    new_user = User(username=username, password_hash=hashed_pw)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": f"Gebruiker {username} geregistreerd"}), 201


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Gebruikersnaam en wachtwoord vereist"}), 400

    # Zoek in DB
    user = User.query.filter_by(username=username).first()
    if user is None or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Ongeldige login"}), 401

    # Inlog correct -> sessie
    session.clear()
    session['user_id'] = user.id
    session['username'] = user.username

    return jsonify({"message": f"Ingelogd als {user.username}"}), 200


@app.route('/home', methods=['GET'])
def home():
    if 'user_id' not in session:
        return jsonify({"error": "Niet gemachtigd"}), 401

    username = session.get('username', 'Onbekend')
    return jsonify({"message": f"Welkom, {username}! Dit is een beschermde pagina."}), 200


@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Uitgelogd"}), 200


# Optioneel: Als je direct met "python app.py" runt
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
