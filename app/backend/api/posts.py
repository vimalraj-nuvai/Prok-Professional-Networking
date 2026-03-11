import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory
from config import Config
from models.user import db
from models.post import Post
from api.auth import get_current_user

posts_bp = Blueprint('posts', __name__)

ALLOWED_IMAGE_EXT = {'jpg', 'jpeg', 'png', 'gif'}
ALLOWED_VIDEO_EXT = {'mp4', 'mov', 'webm'}
ALLOWED_EXT = ALLOWED_IMAGE_EXT | ALLOWED_VIDEO_EXT

def get_posts_upload_dir():
    path = os.path.join(Config.UPLOAD_FOLDER, 'posts')
    os.makedirs(path, exist_ok=True)
    return path

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXT

def get_media_type(filename):
    ext = filename.rsplit('.', 1)[1].lower()
    if ext in ALLOWED_IMAGE_EXT:
        return 'image'
    if ext in ALLOWED_VIDEO_EXT:
        return 'video'
    return ''

# ── POST /api/posts ─────────────────────────────────────────────────────────────
@posts_bp.route('/api/posts', methods=['POST'])
def create_post():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    # Support both JSON and FormData
    content = request.form.get('content', '') or (request.get_json() or {}).get('content', '')
    content = content.strip()
    category = request.form.get('category', 'General') or (request.get_json() or {}).get('category', 'General')
    tags = request.form.get('tags', '') or (request.get_json() or {}).get('tags', '')

    if not content:
        return jsonify({'error': 'Post content is required'}), 400

    if len(content) > 5000:
        return jsonify({'error': 'Post content must be under 5000 characters'}), 400

    media_url = ''
    media_type = ''

    # Handle media upload if present
    if 'media' in request.files:
        file = request.files['media']
        if file.filename and file.filename != '':
            if not allowed_file(file.filename):
                return jsonify({'error': 'File type not allowed. Use JPG, PNG, GIF, MP4, MOV, or WEBM.'}), 400

            upload_dir = get_posts_upload_dir()
            ext = file.filename.rsplit('.', 1)[1].lower()
            filename = f"post_{user.id}_{uuid.uuid4().hex[:8]}.{ext}"
            filepath = os.path.join(upload_dir, filename)

            media_type = get_media_type(file.filename)

            # Process images with Pillow if available
            if media_type == 'image':
                try:
                    from PIL import Image
                    img = Image.open(file)
                    if img.mode in ('RGBA', 'P'):
                        img = img.convert('RGB')
                    img.thumbnail((1200, 1200), Image.LANCZOS)
                    img.save(filepath, 'JPEG', quality=85)
                    filename = filename.rsplit('.', 1)[0] + '.jpg'
                except ImportError:
                    file.save(filepath)
            else:
                file.save(filepath)

            media_url = f"/api/uploads/posts/{filename}"

    post = Post(
        user_id=user.id,
        content=content,
        media_url=media_url,
        media_type=media_type,
        category=category,
        tags=tags,
    )
    db.session.add(post)
    db.session.commit()

    return jsonify({
        'message': 'Post created successfully',
        'post': post.to_dict(),
    }), 201

# ── GET /api/posts ──────────────────────────────────────────────────────────────
@posts_bp.route('/api/posts', methods=['GET'])
def list_posts():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(per_page, 50)
    search_term = request.args.get('search', '', type=str)
    sort_by = request.args.get('sort', 'created_at', type=str)
    category = request.args.get('category', '', type=str)
    visibility = request.args.get('visibility', 'public', type=str)
    tags = request.args.get('tags', '', type=str)

    query = Post.query

    # Filtering
    if search_term:
        from sqlalchemy import or_
        query = query.filter(or_(
            Post.content.ilike(f"%{search_term}%"),
            Post.author.has(username=search_term)
        ))

    if category:
        query = query.filter(Post.category.ilike(f"%{category}%"))

    if tags:
        tag_list = [tag.strip() for tag in tags.split(',')]
        for tag in tag_list:
            query = query.filter(Post.tags.ilike(f"%{tag}%"))

    # Sorting
    if sort_by == 'likes_count':
        query = query.order_by(Post.likes_count.desc())
    elif sort_by == 'views_count':
        query = query.order_by(Post.views_count.desc())
    else:
        query = query.order_by(Post.created_at.desc())


    posts = query.paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'posts': [p.to_dict() for p in posts.items],
        'total': posts.total,
        'page': posts.page,
        'pages': posts.pages,
    }), 200

# ── GET /api/posts/categories ───────────────────────────────────────────────────
@posts_bp.route('/api/posts/categories', methods=['GET'])
def get_categories():
    # In a real app, you might query this from a separate table
    categories = [
        "Technology", "Business", "Marketing", "Design", "Programming",
        "Startups", "Productivity", "Careers", "Leadership"
    ]
    return jsonify(categories), 200

# ── GET /api/posts/popular-tags ─────────────────────────────────────────────────
@posts_bp.route('/api/posts/popular-tags', methods=['GET'])
def get_popular_tags():
    # In a real app, you would have a more sophisticated way of determining popular tags
    tags = ["python", "javascript", "react", "flask", "devops", "ai", "machine-learning"]
    return jsonify(tags), 200


# ── Serve post media files ──────────────────────────────────────────────────────
@posts_bp.route('/api/uploads/posts/<filename>')
def serve_post_media(filename):
    return send_from_directory(get_posts_upload_dir(), filename)
