from models.user import db
from datetime import datetime

class Profile(db.Model):
    __tablename__ = 'profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    title = db.Column(db.String(100), default='')
    bio = db.Column(db.Text, default='')
    location = db.Column(db.String(100), default='')
    avatar_url = db.Column(db.String(256), default='')
    skills = db.Column(db.Text, default='')           # comma-separated
    website = db.Column(db.String(256), default='')
    linkedin = db.Column(db.String(256), default='')
    github = db.Column(db.String(256), default='')
    twitter = db.Column(db.String(256), default='')
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Experience and Education as JSON text (simple approach for tutorial)
    experience_json = db.Column(db.Text, default='[]')
    education_json = db.Column(db.Text, default='[]')

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title or '',
            'bio': self.bio or '',
            'location': self.location or '',
            'avatar_url': self.avatar_url or '',
            'skills': [s.strip() for s in (self.skills or '').split(',') if s.strip()],
            'website': self.website or '',
            'linkedin': self.linkedin or '',
            'github': self.github or '',
            'twitter': self.twitter or '',
            'experience': json.loads(self.experience_json or '[]'),
            'education': json.loads(self.education_json or '[]'),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
