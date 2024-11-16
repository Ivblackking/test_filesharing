from datetime import datetime, timedelta
import os
from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from models import User, MyFile
from schemas import SUserPayload


JWT_SECRET_KEY = os.environ.get("SECRET_KEY")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM")


password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login/")


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


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate user",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("user_id")
        username: str = payload.get("username")
        is_admin: str = payload.get("is_admin")
        if user_id is None or username is None or is_admin is None:
            raise credentials_exception
        user = SUserPayload(user_id=user_id, username=username, is_admin=is_admin)
        return user
    except JWTError:
        raise credentials_exception


async def get_admin_user(admin_user: Annotated[User, Depends(get_current_user)]):
    if not admin_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                            detail="Your are not admin")
    return admin_user


def get_user_by_id(user_id: int, db):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


def get_file_by_id(file_id: int, db):
    file = db.query(MyFile).filter(MyFile.id == file_id).first()
    if file is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return file