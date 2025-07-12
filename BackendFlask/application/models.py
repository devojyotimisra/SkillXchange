from app import db
from datetime import datetime, timezone, timedelta
from sqlalchemy import Text, JSON
import uuid


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))

    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password_hashed = db.Column(db.String(256), nullable=False)
    location = db.Column(db.String(200), nullable=True)
    profile_photo = db.Column(db.String(255), nullable=True, default='default_avatar.png')

    is_public = db.Column(db.Boolean, default=True, nullable=False)
    availability = db.Column(JSON, nullable=True)  # Store availability as JSON

    # Legacy fields (keeping for backward compatibility)
    role = db.Column(db.Enum("admin", "user"), nullable=True)
    status = db.Column(db.Enum("pending", "verified", "blocked"), nullable=True, default="verified")

    created_at = db.Column(db.DateTime, default=datetime.now(timezone(timedelta(hours=5, minutes=30))))

    skills_offered = db.relationship('Skill', foreign_keys='Skill.user_id', back_populates='user', cascade='all, delete-orphan')
    skills_wanted = db.relationship('SkillWanted', foreign_keys='SkillWanted.user_id', back_populates='user', cascade='all, delete-orphan')
    sent_requests = db.relationship('SwapRequest', foreign_keys='SwapRequest.sender_id', back_populates='sender', cascade='all, delete-orphan')
    received_requests = db.relationship('SwapRequest', foreign_keys='SwapRequest.receiver_id', back_populates='receiver')
    given_feedbacks = db.relationship('Feedback', foreign_keys='Feedback.from_user_id', back_populates='from_user')
    received_feedbacks = db.relationship('Feedback', foreign_keys='Feedback.to_user_id', back_populates='to_user')

    def get_profile_photo_url(self):
        """Helper method to get the full URL for the profile photo"""
        if self.profile_photo:
            return f"/static/uploads/profile_photos/{self.profile_photo}"
        return "/static/images/default_avatar.png"

    def to_dict(self):
        """Convert user to dictionary for API responses"""
        return {
            'id': self.uuid,
            'name': self.name,
            'email': self.email,
            'location': self.location,
            'profilePhoto': self.get_profile_photo_url(),
            'isPublic': self.is_public,
            'availability': self.availability or [],
            'skillsOffered': [skill.to_dict() for skill in self.skills_offered],
            'skillsWanted': [skill.to_dict() for skill in self.skills_wanted],
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }


class Skill(db.Model):
    __tablename__ = "skills"

    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    name = db.Column(db.String(100), nullable=False)
    description = db.Column(Text, nullable=True)
    category = db.Column(db.String(50), nullable=True)
    level = db.Column(db.Enum("beginner", "intermediate", "advanced", "expert"), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.now(timezone(timedelta(hours=5, minutes=30))))

    user = db.relationship('User', foreign_keys=[user_id], back_populates='skills_offered')

    def to_dict(self):
        return {
            'id': self.uuid,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'level': self.level
        }


class SkillWanted(db.Model):
    __tablename__ = "skills_wanted"

    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    name = db.Column(db.String(100), nullable=False)
    description = db.Column(Text, nullable=True)
    category = db.Column(db.String(50), nullable=True)
    level_needed = db.Column(db.Enum("beginner", "intermediate", "advanced", "expert"), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.now(timezone(timedelta(hours=5, minutes=30))))

    user = db.relationship('User', foreign_keys=[user_id], back_populates='skills_wanted')

    def to_dict(self):
        return {
            'id': self.uuid,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'levelNeeded': self.level_needed
        }


class SwapRequest(db.Model):
    __tablename__ = "swap_requests"

    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))

    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    skill_offered = db.Column(JSON, nullable=False)
    skill_requested = db.Column(JSON, nullable=False)

    status = db.Column(db.Enum("pending", "accepted", "rejected", "completed"), nullable=False, default="pending")

    proposed_date = db.Column(db.DateTime, nullable=True)
    meeting_location = db.Column(db.String(200), nullable=True)
    notes = db.Column(Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.now(timezone(timedelta(hours=5, minutes=30))))
    updated_at = db.Column(db.DateTime, default=datetime.now(timezone(timedelta(hours=5, minutes=30))), 
                           onupdate=datetime.now(timezone(timedelta(hours=5, minutes=30))))

    sender = db.relationship('User', foreign_keys=[sender_id], back_populates='sent_requests')
    receiver = db.relationship('User', foreign_keys=[receiver_id], back_populates='received_requests')
    feedbacks = db.relationship('Feedback', back_populates='swap_request', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.uuid,
            'senderId': self.sender.uuid,
            'receiverId': self.receiver.uuid,
            'skillOffered': self.skill_offered,
            'skillRequested': self.skill_requested,
            'status': self.status,
            'proposedDate': self.proposed_date.isoformat() if self.proposed_date else None,
            'meetingLocation': self.meeting_location,
            'notes': self.notes,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }


class Feedback(db.Model):
    __tablename__ = "feedbacks"

    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))

    swap_request_id = db.Column(db.Integer, db.ForeignKey('swap_requests.id'), nullable=False)
    from_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    to_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    rating = db.Column(db.Integer, nullable=False)  # 1-5 scale
    comment = db.Column(Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.now(timezone(timedelta(hours=5, minutes=30))))

    swap_request = db.relationship('SwapRequest', foreign_keys=[swap_request_id], back_populates='feedbacks')
    from_user = db.relationship('User', foreign_keys=[from_user_id], back_populates='given_feedbacks')
    to_user = db.relationship('User', foreign_keys=[to_user_id], back_populates='received_feedbacks')

    def to_dict(self):
        return {
            'id': self.uuid,
            'swapRequestId': self.swap_request.uuid,
            'fromUserId': self.from_user.uuid,
            'toUserId': self.to_user.uuid,
            'rating': self.rating,
            'comment': self.comment,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }