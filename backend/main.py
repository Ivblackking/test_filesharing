import os
from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile
from typing import Annotated
from sqlalchemy.orm import Session
import models
from models import User, MyFile
from database import engine, SessionLocal
from schemas import SUserBase, SUserSignUp, SMyFileBase
from utils import get_hashed_password


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

    new_user = User(
        username=user.username,
        password=encrypted_password,
        is_admin=user.is_admin
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message":"user created successfully"}


@app.post("/files/upload/")
async def upload_file(uploaded_file: UploadFile, db: db_dependency):
    existing_file = db.query(MyFile).filter(MyFile.filename == uploaded_file.filename).first()
    if existing_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="File with such name already exists")
    
    file_location = f"files_storage/{uploaded_file.filename}"

    with open(file_location, "wb+") as file_object:
        file_object.write(uploaded_file.file.read())
    
    new_file = MyFile(filename=uploaded_file.filename)
    db.add(new_file)
    db.commit()
    db.refresh(new_file)

    return {"info": f"file '{uploaded_file.filename}' saved at '{file_location}'"}