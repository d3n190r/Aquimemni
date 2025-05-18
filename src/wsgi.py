"""
WSGI entry point for the Aquimemni application.

This module creates the Flask application instance that can be used by WSGI servers
like Gunicorn or uWSGI for production deployment, or run directly for development.
"""
from .backend.app import create_app # Correctly import create_app from app.py
# db import no longer needed here if create_all is handled by migrations
# from src.backend.init_flask import db 

app = create_app()

# If you are using Flask-Migrate, db.create_all() is typically not needed here.
# Migrations handle the database schema.
# If you are *not* using migrations and want tables created on startup:
# with app.app_context():
#     db.create_all() 

if __name__ == "__main__":
    # This block is for running with `python wsgi.py`, usually not for Gunicorn.
    # Gunicorn will just use the `app` instance.
    app.run()
