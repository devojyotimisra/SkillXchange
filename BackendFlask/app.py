from datetime import datetime, timezone, timedelta
from flask import Flask, request
from flask_caching import Cache
from flask_cors import CORS
from flask_jwt_extended import create_access_token, get_jwt, jwt_required, JWTManager, get_jwt_identity
from flask_migrate import Migrate
from flask_restful import Api, Resource, reqparse
from flask_sqlalchemy import SQLAlchemy
from functools import wraps
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import uuid


app = Flask(__name__)
app.config.from_object("application.config.Config")
api = Api(app)
cache = Cache(app)
cors = CORS(app)
db = SQLAlchemy(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

from application import init_db
from application.models import User, Skill, SkillWanted, SwapRequest, Feedback


def role_required(role):
    def decorator(func):
        @jwt_required()
        @wraps(func)
        def wrapper(*args, **kwargs):
            current_role = get_jwt()["role"]
            if current_role != role:
                return {"message": f"You are not supposed to be there {current_role}", "role": current_role}, 403
            return func(*args, **kwargs)
        return wrapper
    return decorator


# Authentication Endpoints
class RegisterUser(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("name", type=str, required=True, help="Name is required")
        self.parser.add_argument("email", type=str, required=True, help="Email is required")
        self.parser.add_argument("password", type=str, required=True, help="Password is required")
        self.parser.add_argument("location", type=str, required=False)
        self.parser.add_argument("is_public", type=bool, default=True)
        
        self.UPLOAD_FOLDER = 'static/uploads/profile_photos'
        self.ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
        self.MAX_FILE_SIZE = 5 * 1024 * 1024

    def allowed_file(self, filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in self.ALLOWED_EXTENSIONS

    def save_profile_photo(self, file):
        if file and self.allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_extension = filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{uuid.uuid4()}.{file_extension}"
            
            os.makedirs(self.UPLOAD_FOLDER, exist_ok=True)
            
            file_path = os.path.join(self.UPLOAD_FOLDER, unique_filename)
            file.save(file_path)
            
            return unique_filename
        return None

    def post(self):
        data = self.parser.parse_args()
        
        user = db.session.scalars(select(User).filter_by(email=data["email"])).first()
        if user:
            return {"message": "Email already in use"}, 400
        
        profile_photo_filename = None
        if 'profile_photo' in request.files:
            file = request.files['profile_photo']
            if file and file.filename != '':
                if len(file.read()) > self.MAX_FILE_SIZE:
                    return {"message": "File size too large. Maximum 5MB allowed."}, 400
                file.seek(0)
                
                profile_photo_filename = self.save_profile_photo(file)
                if not profile_photo_filename:
                    return {"message": "Invalid file format. Only PNG, JPG, JPEG, and WEBP allowed."}, 400
        
        password_hash = generate_password_hash(data["password"])
        new_user = User(
            name=data["name"],
            email=data["email"],
            password_hashed=password_hash,
            location=data.get("location"),
            is_public=data.get("is_public", True),
            profile_photo=profile_photo_filename,
            created_at=datetime.now(timezone(timedelta(hours=5, minutes=30)))
        )
        
        try:
            db.session.add(new_user)
            db.session.commit()
            
            access_token = create_access_token(
                identity=str(new_user.id),
                additional_claims={
                    "uuid": new_user.uuid,
                    "name": new_user.name,
                    "email": new_user.email,
                    "role": new_user.role or "user"
                }
            )
            
            return {"user": new_user.to_dict(), "token": access_token}, 201
        except Exception as e:
            db.session.rollback()
            if profile_photo_filename:
                try:
                    os.remove(os.path.join(self.UPLOAD_FOLDER, profile_photo_filename))
                except:
                    pass
            return {"message": "Registration failed. Please try again."}, 500


class LoginUser(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument("email", type=str, required=True, help="Email is required")
        self.parser.add_argument("password", type=str, required=True, help="Password is required")

    def post(self):
        data = self.parser.parse_args()
        user = db.session.scalars(select(User).filter_by(email=data["email"])).first()

        if not user:
            return {"message": "Invalid email or password"}, 401

        if not check_password_hash(user.password_hashed, data["password"]):
            return {"message": "Invalid email or password"}, 401

        if user.status == "blocked":
            return {"message": "Account is blocked"}, 403

        if user.status == "pending":
            return {"message": "Account is pending verification"}, 403

        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={
                "uuid": user.uuid,
                "name": user.name,
                "email": user.email,
                "role": user.role or "user"
            }
        )

        return {"user": user.to_dict(), "token": access_token}, 200


class LogoutUser(Resource):
    @jwt_required()
    def post(self):
        return {"success": True}, 200


class GetCurrentUser(Resource):
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        if not user:
            return {"user": None}, 401
        return {"user": user.to_dict()}, 200


# User Endpoints
class GetAllUsers(Resource):
    @jwt_required()
    @cache.cached(timeout=60, key_prefix="public_users_list")
    def get(self):
        users = db.session.scalars(
            select(User)
            .filter_by(is_public=True)
            .options(selectinload(User.skills_offered), selectinload(User.skills_wanted))
        ).all()
        return {"users": [user.to_dict() for user in users]}, 200


class GetUserById(Resource):
    def get(self, user_id):
        user = db.session.scalars(
            select(User)
            .filter_by(uuid=user_id)
            .options(selectinload(User.skills_offered), selectinload(User.skills_wanted))
        ).first()
        if not user:
            return {"message": "User not found"}, 404
        return {"user": user.to_dict()}, 200


class SearchUsers(Resource):
    def get(self):
        skill_query = request.args.get('skill', '')
        if not skill_query:
            return {"users": []}, 200
        
        users = db.session.scalars(
            select(User)
            .filter(User.is_public == True)
            .join(User.skills_offered, isouter=True)
            .join(User.skills_wanted, isouter=True)
            .filter(
                or_(
                    Skill.name.ilike(f'%{skill_query}%'),
                    SkillWanted.name.ilike(f'%{skill_query}%')
                )
            )
            .options(selectinload(User.skills_offered), selectinload(User.skills_wanted))
            .distinct()
        ).all()
        
        return {"users": [user.to_dict() for user in users]}, 200


class UpdateUserProfile(Resource):
    @jwt_required()
    def put(self):
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        if not user:
            return {"message": "User not found"}, 404
        
        parser = reqparse.RequestParser()
        parser.add_argument("name", type=str)
        parser.add_argument("location", type=str)
        parser.add_argument("profilePhoto", type=str)
        parser.add_argument("isPublic", type=bool)
        data = parser.parse_args()
        
        if data.get("name"):
            user.name = data["name"]
        if data.get("location"):
            user.location = data["location"]
        if data.get("profilePhoto"):
            user.profile_photo = data["profilePhoto"]
        if data.get("isPublic") is not None:
            user.is_public = data["isPublic"]
        
        try:
            db.session.commit()
            return {"user": user.to_dict()}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": "Profile update failed"}, 500


class UpdateUserAvailability(Resource):
    @jwt_required()
    def put(self):
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        if not user:
            return {"message": "User not found"}, 404
        
        data = request.json
        user.availability = data["availability"]
        user.updated_at = datetime.now(timezone(timedelta(hours=5, minutes=30)))
        
        try:
            db.session.commit()
            cache.delete("public_users_list")
            return {"user": user.to_dict()}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": "Failed to update availability"}, 500


class TogglePublicProfile(Resource):
    @jwt_required()
    def put(self):
        current_user_id = get_jwt_identity()
        user = db.session.get(User, current_user_id)
        if not user:
            return {"message": "User not found"}, 404
        
        user.is_public = not user.is_public
        user.updated_at = datetime.now(timezone(timedelta(hours=5, minutes=30)))
        
        try:
            db.session.commit()
            cache.delete("public_users_list")
            return {"user": user.to_dict()}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": "Failed to toggle public profile"}, 500
        

# Skills Endpoints
class AddSkillOffered(Resource):
    @jwt_required()
    def post(self):
        current_user_id = get_jwt_identity()
        
        parser = reqparse.RequestParser()
        parser.add_argument("name", type=str, required=True)
        parser.add_argument("description", type=str, required=True)
        parser.add_argument("category", type=str)
        parser.add_argument("level", type=str)
        data = parser.parse_args()
        
        skill = Skill(
            user_id=current_user_id,
            name=data["name"],
            description=data["description"],
            category=data.get("category"),
            level=data.get("level")
        )
        
        try:
            db.session.add(skill)
            db.session.commit()
            return {"skill": skill.to_dict()}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": "Failed to add skill"}, 500


class AddSkillWanted(Resource):
    @jwt_required()
    def post(self):
        current_user_id = get_jwt_identity()
        
        parser = reqparse.RequestParser()
        parser.add_argument("name", type=str, required=True)
        parser.add_argument("description", type=str, required=True)
        parser.add_argument("category", type=str)
        parser.add_argument("levelNeeded", type=str)
        data = parser.parse_args()
        
        skill = SkillWanted(
            user_id=current_user_id,
            name=data["name"],
            description=data["description"],
            category=data.get("category"),
            level_needed=data.get("levelNeeded")
        )
        
        try:
            db.session.add(skill)
            db.session.commit()
            return {"skill": skill.to_dict()}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": "Failed to add skill"}, 500


class RemoveSkillOffered(Resource):
    @jwt_required()
    def delete(self, skill_id):
        current_user_id = get_jwt_identity()
        skill = db.session.scalars(
            select(Skill).filter_by(uuid=skill_id, user_id=current_user_id)
        ).first()
        
        if not skill:
            return {"message": "Skill not found"}, 404
        
        try:
            db.session.delete(skill)
            db.session.commit()
            return '', 204
        except Exception as e:
            db.session.rollback()
            return {"message": "Failed to remove skill"}, 500


class RemoveSkillWanted(Resource):
    @jwt_required()
    def delete(self, skill_id):
        current_user_id = get_jwt_identity()
        skill = db.session.scalars(
            select(SkillWanted).filter_by(uuid=skill_id, user_id=current_user_id)
        ).first()
        
        if not skill:
            return {"message": "Skill not found"}, 404
        
        try:
            db.session.delete(skill)
            db.session.commit()
            return '', 204
        except Exception as e:
            db.session.rollback()
            return {"message": "Failed to remove skill"}, 500


# Swap Request Endpoints
class GetSwapRequests(Resource):
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()
        
        sent_requests = db.session.scalars(
            select(SwapRequest)
            .filter_by(sender_id=current_user_id)
            .options(selectinload(SwapRequest.sender), selectinload(SwapRequest.receiver))
        ).all()
        
        received_requests = db.session.scalars(
            select(SwapRequest)
            .filter_by(receiver_id=current_user_id)
            .options(selectinload(SwapRequest.sender), selectinload(SwapRequest.receiver))
        ).all()
        
        return {
            "sent": [req.to_dict() for req in sent_requests],
            "received": [req.to_dict() for req in received_requests]
        }, 200


class CreateSwapRequest(Resource):
    @jwt_required()
    def post(self):
        current_user_id = get_jwt_identity()
        
        parser = reqparse.RequestParser()
        parser.add_argument("receiverId", type=str, required=True)
        parser.add_argument("skillOffered", type=dict, required=True)
        parser.add_argument("skillRequested", type=dict, required=True)
        data = parser.parse_args()
        
        # Get receiver by UUID
        receiver = db.session.scalars(
            select(User).filter_by(uuid=data["receiverId"])
        ).first()
        
        if not receiver:
            return {"message": "Receiver not found"}, 404
        
        swap_request = SwapRequest(
            sender_id=current_user_id,
            receiver_id=receiver.id,
            skill_offered=data["skillOffered"],
            skill_requested=data["skillRequested"]
        )
        
        try:
            db.session.add(swap_request)
            db.session.commit()
            return {"request": swap_request.to_dict()}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": "Failed to create swap request"}, 500


class UpdateSwapRequestStatus(Resource):
    @jwt_required()
    def put(self, request_id):
        current_user_id = get_jwt_identity()
        
        parser = reqparse.RequestParser()
        parser.add_argument("status", type=str, required=True)
        data = parser.parse_args()
        
        swap_request = db.session.scalars(
            select(SwapRequest)
            .filter_by(uuid=request_id)
            .filter(or_(
                SwapRequest.sender_id == current_user_id,
                SwapRequest.receiver_id == current_user_id
            ))
        ).first()
        
        if not swap_request:
            return {"message": "Swap request not found"}, 404
        
        swap_request.status = data["status"]
        swap_request.updated_at = datetime.now(timezone(timedelta(hours=5, minutes=30)))
        
        try:
            db.session.commit()
            return {"request": swap_request.to_dict()}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": "Failed to update swap request"}, 500


class DeleteSwapRequest(Resource):
    @jwt_required()
    def delete(self, request_id):
        current_user_id = get_jwt_identity()
        
        swap_request = db.session.scalars(
            select(SwapRequest)
            .filter_by(uuid=request_id)
            .filter(or_(
                SwapRequest.sender_id == current_user_id,
                SwapRequest.receiver_id == current_user_id
            ))
        ).first()
        
        if not swap_request:
            return {"message": "Swap request not found"}, 404
        
        try:
            db.session.delete(swap_request)
            db.session.commit()
            return '', 204
        except Exception as e:
            db.session.rollback()
            return {"message": "Failed to delete swap request"}, 500


# Feedback Endpoints
class GetUserFeedback(Resource):
    def get(self, user_id):
        user = db.session.scalars(select(User).filter_by(uuid=user_id)).first()
        if not user:
            return {"message": "User not found"}, 404
        
        feedback = db.session.scalars(
            select(Feedback)
            .filter_by(to_user_id=user.id)
            .options(selectinload(Feedback.from_user), selectinload(Feedback.swap_request))
        ).all()
        
        return {"feedback": [f.to_dict() for f in feedback]}, 200


class AddFeedback(Resource):
    @jwt_required()
    def post(self):
        current_user_id = get_jwt_identity()
        
        parser = reqparse.RequestParser()
        parser.add_argument("swapRequestId", type=str, required=True)
        parser.add_argument("toUserId", type=str, required=True)
        parser.add_argument("rating", type=int, required=True)
        parser.add_argument("comment", type=str)
        data = parser.parse_args()
        
        # Get swap request and to_user by UUID
        swap_request = db.session.scalars(
            select(SwapRequest).filter_by(uuid=data["swapRequestId"])
        ).first()
        
        to_user = db.session.scalars(
            select(User).filter_by(uuid=data["toUserId"])
        ).first()
        
        if not swap_request or not to_user:
            return {"message": "Swap request or user not found"}, 404
        
        # Verify user is part of the swap request
        if swap_request.sender_id != current_user_id and swap_request.receiver_id != current_user_id:
            return {"message": "You are not authorized to give feedback for this swap"}, 403
        
        feedback = Feedback(
            swap_request_id=swap_request.id,
            from_user_id=current_user_id,
            to_user_id=to_user.id,
            rating=data["rating"],
            comment=data.get("comment")
        )
        
        try:
            db.session.add(feedback)
            db.session.commit()
            return {"feedback": feedback.to_dict()}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": "Failed to add feedback"}, 500


# Authentication
api.add_resource(RegisterUser, "/api/auth/register")
api.add_resource(LoginUser, "/api/auth/login")
api.add_resource(LogoutUser, "/api/auth/logout")
api.add_resource(GetCurrentUser, "/api/auth/me")

# Users
api.add_resource(GetAllUsers, "/api/users")
api.add_resource(GetUserById, "/api/users/<string:user_id>")
api.add_resource(SearchUsers, "/api/users/search")
api.add_resource(UpdateUserProfile, "/api/users/profile")
api.add_resource(UpdateUserAvailability, "/api/users/availability")
api.add_resource(TogglePublicProfile, "/api/users/toggle-public")

# Skills
api.add_resource(AddSkillOffered, "/api/skills/offered")
api.add_resource(AddSkillWanted, "/api/skills/wanted")
api.add_resource(RemoveSkillOffered, "/api/skills/offered/<string:skill_id>")
api.add_resource(RemoveSkillWanted, "/api/skills/wanted/<string:skill_id>")

# Swap Requests
api.add_resource(GetSwapRequests, "/api/swap-requests")
api.add_resource(CreateSwapRequest, "/api/swap-requests")
api.add_resource(UpdateSwapRequestStatus, "/api/swap-requests/<string:request_id>/status")
api.add_resource(DeleteSwapRequest, "/api/swap-requests/<string:request_id>")

# Feedback
api.add_resource(GetUserFeedback, "/api/feedback/user/<string:user_id>")
api.add_resource(AddFeedback, "/api/feedback")

if __name__ == "__main__":
    app.run()
