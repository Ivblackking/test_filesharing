from datetime import datetime, timedelta
import os
from jose import jwt
from passlib.context import CryptContext
from models import User


JWT_SECRET_KEY = os.environ.get("SECRET_KEY")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM")


password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_hashed_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, hashed_pass: str) -> bool:
    return password_context.verify(password, hashed_pass)


def authenticate_user(username: str, password: str, db):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    
    hashed_pass = user.password

    if not verify_password(password, hashed_pass):
        return False
    
    return user


def create_access_token(user_id, username, is_admin, expires_delta=timedelta(minutes=15)):
    expires_time = datetime.now() + expires_delta
         
    to_encode = {
        "exp": expires_time, 
        "user_id": user_id, "username": username, "is_admin": is_admin
    }
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, JWT_ALGORITHM)
     
    return encoded_jwt