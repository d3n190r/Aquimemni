import os

class Config:
    # -------------------------------
    # Algemene Flask-config
    # -------------------------------
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
    # Bovenstaande gebruikt een environment variable voor SECRET_KEY
    # Bijv. in productie: export SECRET_KEY="ZeerSterkeRandomWaarde"
    # Anders fallback naar "dev-secret-key" (NIET aangeraden voor productie)

    # -------------------------------
    # Database-config (PostgreSQL)
    # -------------------------------
    # Standaard: lokale Postgres; pas 'myuser', 'mypass', 'mydb' aan naar wat je in psql hebt ingesteld
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "postgresql://app:123456@localhost/mydb")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # -------------------------------
    # Flask-Session config
    # -------------------------------
    SESSION_TYPE = 'filesystem'   # Sla sessies server-side op (in bestanden)
    SESSION_PERMANENT = False     # Sessies vervallen als de browser sluit

    # Hieronder kun je SameSite / Secure-cookies instellen.
    # In development werkt het soms handiger om SameSite='None' & Secure=False te doen
    SESSION_COOKIE_SAMESITE = 'None'
    SESSION_COOKIE_SECURE = False  # In productie op True zetten als je https gebruikt!
