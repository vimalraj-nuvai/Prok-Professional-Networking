from models.user import db
from datetime import datetime

class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    media_url = db.Column(db.String(256), default='')
    media_type = db.Column(db.String(20), default='')  # 'image', 'video', or ''
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship
    author = db.relationship('User', backref=db.backref('posts', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'content': self.content,
            'media_url': self.media_url or '',
            'media_type': self.media_type or '',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'author': {
                'id': self.author.id,
                'username': self.author.username,
            } if self.author else None,
        }
