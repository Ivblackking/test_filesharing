import os
from fastapi import FastAPI, HTTPException, Depends, status
from typing import Annotated
from sqlalchemy.orm import Session
import models
from models import User, MyFile
from database import engine, SessionLocal
from schemas import SUserBase, SUserSignUp, SMyFileBase
from utils import get_hashed_password
from dotenv import load_dotenv


admin_key = os.environ.get("ADMIN_KEY")


app = FastAPI()
models.Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try : 
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]


@app.post("/signup/", status_code=status.HTTP_201_CREATED)
async def signup(user: SUserSignUp, db: db_dependency):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="This username already exists")
    
    if user.is_admin and user.admin_key != admin_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin key")

    encrypted_password = get_hashed_password(user.password)

    new_user = models.User(
        username=user.username,
        password=encrypted_password,
        is_admin=user.is_admin
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message":"user created successfully"}