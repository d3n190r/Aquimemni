from flask import Flask, Blueprint
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from .config import Config
from flask_cors import CORS  # Add CORS support

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()

main_bp = Blueprint('main', __name__)

CORS(main_bp, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],  # Update with your frontend origin
        "supports_credentials": True
    }
})


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
    db.init_app(app)
    migrate.init_app(app, db)

    # Import routes NA initialisatie
    from .app import main_bp
    app.register_blueprint(main_bp)

    with app.app_context():
        db.create_all()
        
    return app