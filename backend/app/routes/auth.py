from flask import Blueprint, request, jsonify
from app import db
from app.models.user import User, UserSettings
import jwt
import os
from datetime import datetime, timedelta
from functools import wraps

auth_bp = Blueprint('auth', __name__)

# JWT Authentication Helper Functions
def create_token(user_id):
    payload = {
        'exp': datetime.utcnow() + timedelta(days=1),
        'iat': datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(
        payload,
        os.environ.get('SECRET_KEY', 'your-secret-key'),
        algorithm='HS256'
    )

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            payload = jwt.decode(
                token,
                os.environ.get('SECRET_KEY', 'your-secret-key'),
                algorithms=['HS256']
            )
            user_id = payload['sub']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token!'}), 401
            
        return f(user_id, *args, **kwargs)
    return decorated

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'message': 'Missing required fields!'}), 400
    
    # Check if user exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User already exists!'}), 409
    
    # Create new user
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=data['password']
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    # Create default settings for the user
    user_settings = UserSettings(user_id=new_user.id)
    db.session.add(user_settings)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully!'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing email or password!'}), 400
    
    # Find user
    user = User.query.filter_by(email=data['email']).first()
    
    # Check password
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid email or password!'}), 401
    
    # Generate token
    token = create_token(user.id)
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/user', methods=['GET'])
@token_required
def get_user(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found!'}), 404
    
    return jsonify(user.to_dict()), 200