from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from pymongo import MongoClient
import os

# Initialize SQLAlchemy for PostgreSQL
db = SQLAlchemy()

# Initialize MongoDB client
mongo_client = MongoClient(os.environ.get('MONGODB_URI', 'mongodb://mongodb:27017/'))
mongo_db = mongo_client.ai_aggregator

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Configure PostgreSQL
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://mrrobot@localhost:5432/ai_aggregator_dev'
    # app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@postgres:5432/ai_aggregator')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key')

    # Initialize databases with app
    db.init_app(app)

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.chat import chat_bp
    from .routes.settings import settings_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(chat_bp, url_prefix='/api')
    app.register_blueprint(settings_bp, url_prefix='/api')

    # Create database tables
    with app.app_context():
        db.create_all()

    return app