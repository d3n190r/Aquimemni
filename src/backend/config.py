# backend/config.py
import os
class Config:
    # Database configuratie (PostgreSQL)
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://<USER>:<PASS>@<HOST>/<DBNAAM>')
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Disable event system (geen warnings)
    # Secret key voor sessies (gebruik een veilige random waarde in productie!)
    SECRET_KEY = os.getenv('SECRET_KEY', 'ditIsEenZeerGeheimWaarde')
    # Flask-Session configuratie (optioneel, hier gebruiken we filesystem voor server-side sessies)
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = False
