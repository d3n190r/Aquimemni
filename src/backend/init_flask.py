from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_session.__init__ import Session
from flask_cors import CORS
from flask_migrate import Migrate
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