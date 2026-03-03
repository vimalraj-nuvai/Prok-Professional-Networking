import os
import json
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from config import Config
from models.user import db, User
from models.profile import Profile
from api.auth import get_current_user

profile_bp = Blueprint('profile', __name__)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def ensure_upload_dir():
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

# ── GET /api/profile ────────────────────────────────────────────────────────────
@profile_bp.route('/api/profile', methods=['GET'])
def get_profile():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    profile = Profile.query.filter_by(user_id=user.id).first()

    # Auto-create profile if missing
    if not profile:
        profile = Profile(user_id=user.id)
        db.session.add(profile)
        db.session.commit()

    return jsonify({
        'user': user.to_dict(),
        'profile': profile.to_dict(),
    }), 200

# ── PUT /api/profile ────────────────────────────────────────────────────────────
@profile_bp.route('/api/profile', methods=['PUT'])
def update_profile():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 400

    profile = Profile.query.filter_by(user_id=user.id).first()

    # Auto-create profile if missing
    if not profile:
        profile = Profile(user_id=user.id)
        db.session.add(profile)

    # Validation
    errors = {}

    # Validate username/email on User model
    new_name = data.get('name', '').strip()
    new_email = data.get('email', '').strip()

    if 'name' in data:
        if not new_name:
            errors['name'] = 'Name is required'
        elif len(new_name) < 2:
            errors['name'] = 'Name must be at least 2 characters'

    if 'email' in data:
        if not new_email:
            errors['email'] = 'Email is required'
        elif '@' not in new_email:
            errors['email'] = 'Enter a valid email address'
        else:
            existing = User.query.filter_by(email=new_email).first()
            if existing and existing.id != user.id:
                errors['email'] = 'Email already in use'

    if 'bio' in data and len(data.get('bio', '')) > 500:
        errors['bio'] = 'Bio must be 500 characters or less'

    if 'skills' in data:
        skill_list = [s.strip() for s in data.get('skills', '').split(',') if s.strip()]
        if len(skill_list) > 20:
            errors['skills'] = 'Maximum 20 skills allowed'

    if errors:
        return jsonify({'error': 'Validation failed', 'errors': errors}), 400

    # Update User fields
    if 'name' in data:
        user.username = new_name
    if 'email' in data:
        user.email = new_email

    # Update Profile fields (partial updates supported)
    updatable_fields = ['title', 'bio', 'location', 'website', 'linkedin', 'github', 'twitter']
    for field in updatable_fields:
        if field in data:
            setattr(profile, field, data[field].strip() if isinstance(data[field], str) else data[field])

    if 'skills' in data:
        profile.skills = data['skills']

    if 'experience' in data:
        profile.experience_json = json.dumps(data['experience'])

    if 'education' in data:
        profile.education_json = json.dumps(data['education'])

    profile.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict(),
        'profile': profile.to_dict(),
    }), 200

# ── POST /api/profile/image ────────────────────────────────────────────────────
@profile_bp.route('/api/profile/image', methods=['POST'])
def upload_image():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Use JPG or PNG.'}), 400

    ensure_upload_dir()

    # Secure filename with timestamp + uuid
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(Config.UPLOAD_FOLDER, filename)

    # Process image (resize if Pillow available)
    try:
        from PIL import Image

        img = Image.open(file)

        # Convert to RGB if needed (handles PNG with alpha)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')

        # Resize to max 400x400 for profile photos
        img.thumbnail((400, 400), Image.LANCZOS)
        img.save(filepath, 'JPEG', quality=85)
        ext = 'jpg'
        filename = filename.rsplit('.', 1)[0] + '.jpg'
    except ImportError:
        # Pillow not installed — save raw file
        file.save(filepath)

    # Update profile avatar URL
    profile = Profile.query.filter_by(user_id=user.id).first()
    if not profile:
        profile = Profile(user_id=user.id)
        db.session.add(profile)

    profile.avatar_url = f"/api/uploads/{filename}"
    db.session.commit()

    return jsonify({
        'message': 'Image uploaded successfully',
        'avatar_url': profile.avatar_url,
    }), 200

# ── Serve uploaded files ────────────────────────────────────────────────────────
@profile_bp.route('/api/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(Config.UPLOAD_FOLDER, filename)
