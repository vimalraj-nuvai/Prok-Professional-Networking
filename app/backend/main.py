from flask import Flask
from flask_cors import CORS
from config import Config
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
CORS(app)

# Initialize database with the app
from models.user import db
db.init_app(app)

# Import and register blueprints
from api.auth import auth_bp
from api.profile import profile_bp
from api.posts import posts_bp

app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(posts_bp)

# Create database tables
with app.app_context():
    from models.profile import Profile  # noqa: ensure Profile model is loaded
    from models.post import Post  # noqa: ensure Post model is loaded
    db.create_all()
    print("Database tables created successfully!")

if __name__ == '__main__':
    app.run(debug=True)
