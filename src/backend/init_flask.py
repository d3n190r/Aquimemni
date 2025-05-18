# src/backend/init_flask.py
"""
Initializes Flask extensions and blueprints for the application.
This module sets up SQLAlchemy, Flask-Migrate, and CORS configurations
that are used throughout the application.
"""
from flask import Blueprint # Flask import zelf is niet nodig, create_app staat in app.py
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
# Config wordt geïmporteerd in app.py waar create_app is
from flask_cors import CORS

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

# Define blueprint
main_bp = Blueprint('main', __name__)

# CORS for the blueprint - dit zou hier prima moeten zijn.
CORS(main_bp, resources={
    r"/*": {
        "origins": ["http://localhost:3000"], # Zorg dat dit overeenkomt met je frontend
        "supports_credentials": True
    }
})

# De create_app functie is nu verplaatst naar app.py
