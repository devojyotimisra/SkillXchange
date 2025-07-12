from app import app, db
from application.models import User, Skill, SkillWanted
from werkzeug.security import generate_password_hash

with app.app_context():
    db.create_all()

    if not User.query.filter_by(email="admin@email.com").first():
        pwhashed = generate_password_hash("Sankalp")
        admin = User(
            name="Administrator",
            email="admin@email.com",
            password_hashed=pwhashed,
            role="admin",
            status="verified",
            location="Admin Office",
            is_public=False,
            availability=[]
        )
        db.session.add(admin)
        db.session.commit()
        print("Admin user created successfully")

    sample_users = [
        {
            "name": "John Developer",
            "email": "john@example.com",
            "password": "password123",
            "location": "New York, NY",
            "skills_offered": [
                {"name": "React Development", "description": "Frontend web development with React",
                    "category": "Technology", "level": "advanced"},
                {"name": "Node.js", "description": "Backend development with Node.js",
                    "category": "Technology", "level": "intermediate"}
            ],
            "skills_wanted": [
                {"name": "UI/UX Design", "description": "User interface and experience design",
                    "category": "Design", "level_needed": "intermediate"},
                {"name": "Python", "description": "Python programming language",
                    "category": "Technology", "level_needed": "beginner"}
            ]
        },
        {
            "name": "Sarah Designer",
            "email": "sarah@example.com",
            "password": "password123",
            "location": "Los Angeles, CA",
            "skills_offered": [
                {"name": "UI/UX Design", "description": "User interface and experience design",
                    "category": "Design", "level": "expert"},
                {"name": "Adobe Photoshop", "description": "Photo editing and graphic design",
                    "category": "Design", "level": "advanced"}
            ],
            "skills_wanted": [
                {"name": "React Development", "description": "Frontend web development with React",
                    "category": "Technology", "level_needed": "intermediate"},
                {"name": "Digital Marketing", "description": "Online marketing strategies",
                    "category": "Marketing", "level_needed": "beginner"}
            ]
        },
        {
            "name": "Mike Writer",
            "email": "mike@example.com",
            "password": "password123",
            "location": "Chicago, IL",
            "skills_offered": [
                {"name": "Content Writing", "description": "Blog posts and articles",
                    "category": "Writing", "level": "expert"},
                {"name": "Copywriting", "description": "Marketing and sales copy",
                    "category": "Writing", "level": "advanced"}
            ],
            "skills_wanted": [
                {"name": "SEO", "description": "Search engine optimization",
                    "category": "Marketing", "level_needed": "intermediate"},
                {"name": "Social Media Marketing", "description": "Social media strategy and management",
                    "category": "Marketing", "level_needed": "beginner"}
            ]
        },
        {
            "name": "Emma Data Scientist",
            "email": "emma@example.com",
            "password": "password123",
            "location": "San Francisco, CA",
            "skills_offered": [
                {"name": "Python", "description": "Python programming for data science",
                    "category": "Technology", "level": "expert"},
                {"name": "Machine Learning", "description": "ML model development and deployment",
                    "category": "Technology", "level": "advanced"}
            ],
            "skills_wanted": [
                {"name": "Data Visualization", "description": "Creating charts and dashboards",
                    "category": "Technology", "level_needed": "intermediate"},
                {"name": "Statistics", "description": "Statistical analysis and interpretation",
                    "category": "Mathematics", "level_needed": "advanced"}
            ]
        },
        {
            "name": "Alex Marketing Pro",
            "email": "alex@example.com",
            "password": "password123",
            "location": "Austin, TX",
            "skills_offered": [
                {"name": "Digital Marketing", "description": "Online marketing strategies and campaigns",
                    "category": "Marketing", "level": "expert"},
                {"name": "SEO", "description": "Search engine optimization techniques",
                    "category": "Marketing", "level": "advanced"},
                {"name": "Social Media Marketing", "description": "Social media strategy and management",
                    "category": "Marketing", "level": "advanced"}
            ],
            "skills_wanted": [
                {"name": "Content Writing", "description": "Blog posts and marketing copy",
                    "category": "Writing", "level_needed": "intermediate"},
                {"name": "Graphic Design", "description": "Visual design for marketing materials",
                    "category": "Design", "level_needed": "beginner"}
            ]
        }
    ]

    for user_data in sample_users:
        if not User.query.filter_by(email=user_data["email"]).first():
            pwhashed = generate_password_hash(user_data["password"])
            user = User(
                name=user_data["name"],
                email=user_data["email"],
                password_hashed=pwhashed,
                role="user",
                status="verified",
                location=user_data["location"],
                is_public=True,
                availability=[
                    {"day": "Monday", "startTime": "09:00", "endTime": "17:00"},
                    {"day": "Tuesday", "startTime": "09:00", "endTime": "17:00"},
                    {"day": "Wednesday", "startTime": "09:00", "endTime": "17:00"},
                    {"day": "Thursday", "startTime": "09:00", "endTime": "17:00"},
                    {"day": "Friday", "startTime": "09:00", "endTime": "17:00"}
                ]
            )
            db.session.add(user)
            db.session.flush()  # Flush to get the user ID

            for skill_data in user_data["skills_offered"]:
                skill = Skill(
                    user_id=user.id,
                    name=skill_data["name"],
                    description=skill_data["description"],
                    category=skill_data["category"],
                    level=skill_data["level"]
                )
                db.session.add(skill)

            for skill_data in user_data["skills_wanted"]:
                skill_wanted = SkillWanted(
                    user_id=user.id,
                    name=skill_data["name"],
                    description=skill_data["description"],
                    category=skill_data["category"],
                    level_needed=skill_data["level_needed"]
                )
                db.session.add(skill_wanted)

    db.session.commit()
