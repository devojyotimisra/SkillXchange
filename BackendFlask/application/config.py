from os import getenv
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    FLASK_DEBUG = getenv("FLASK_DEBUG", False)
    FLASK_RUN_HOST = getenv("FLASK_RUN_HOST")
    FLASK_RUN_PORT = getenv("FLASK_RUN_PORT")
    SECRET_KEY = getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = getenv("SQLALCHEMY_DATABASE_URI")
    SQLALCHEMY_TRACK_MODIFICATIONS = getenv("SQLALCHEMY_TRACK_MODIFICATIONS", False)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=6)
    JWT_SECRET_KEY = getenv("JWT_SECRET_KEY")

