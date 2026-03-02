from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models.user import User, db

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    # Validate required fields
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 400

    email = data['email'].strip().lower()
    password = data['password']
    username = data.get('name', '').strip() or email.split('@')[0]

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already taken'}), 400

    # Password length check
    if len(password) < 8:
        return jsonify({'message': 'Password must be at least 8 characters'}), 400

    # Create new user
    user = User(username=username, email=email)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    # Generate JWT token
    token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'User created successfully',
        'token': token,
        'user': {'id': user.id, 'username': user.username, 'email': user.email}
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    # Validate required fields
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 400

    email = data['email'].strip().lower()
    password = data['password']

    # Find user by email
    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid email or password'}), 401

    # Generate JWT token
    token = create_access_token(identity=str(user.id))

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {'id': user.id, 'username': user.username, 'email': user.email}
    }), 200
