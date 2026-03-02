import pymysql
pymysql.install_as_MySQLdb()

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from dotenv import load_dotenv
from models.user import db

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
CORS(app)
JWTManager(app)
db.init_app(app)

# Register blueprints
from api.auth import auth_bp
app.register_blueprint(auth_bp, url_prefix='/auth')

def setup_database():
    """Setup database tables"""
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully!")

if __name__ == '__main__':
    setup_database()
    app.run(debug=True)
