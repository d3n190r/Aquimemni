from backend.app import create_app, db

app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # creëert de tabel 'users' als deze nog niet bestaat
    app.run()
