from src.backend.app import app, db

if __name__ == "__main__":
    app.run()
    with app.app_context():
        db.create_all()  # creëert de tabel 'users' als deze nog niet bestaat