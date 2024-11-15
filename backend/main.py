import os
from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from sqlalchemy.orm import Session
import models
from models import User, MyFile
from database import engine, SessionLocal
from schemas import SUserSignUp
from utils import (get_hashed_password, authenticate_user, create_access_token, 
                   get_current_user, get_admin_user)
# import logging


# logger = logging.getLogger('uvicorn.error')
# logger.setLevel(logging.DEBUG)


ADMIN_KEY = os.environ.get("ADMIN_KEY")
FILES_STORAGE_PATH = "files_storage"


app = FastAPI()
models.Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try : 
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[User, Depends(get_current_user)]
admin_dependency = Annotated[User, Depends(get_admin_user)]


@app.post("/signup/", status_code=status.HTTP_201_CREATED)
async def signup(user: SUserSignUp, db: db_dependency):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="This username already exists")
    
    if user.is_admin and user.admin_key != ADMIN_KEY:
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


@app.post("/login/")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: db_dependency):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid username or password")
    
    acces_token = create_access_token(user.id, user.username, user.is_admin)

    return {"access_token": acces_token, "token_type": "bearer" }


@app.post("/files/upload/")
async def upload_file(uploaded_file: UploadFile, db: db_dependency, admin: admin_dependency):
    existing_file = db.query(MyFile).filter(MyFile.filename == uploaded_file.filename).first()
    if existing_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="File with such name already exists")
    
    file_location = f"{FILES_STORAGE_PATH}/{uploaded_file.filename}"

    with open(file_location, "wb+") as file_object:
        file_object.write(uploaded_file.file.read())
    
    new_file = MyFile(filename=uploaded_file.filename)
    db.add(new_file)
    db.commit()
    db.refresh(new_file)

    return {"message": f"file '{uploaded_file.filename}' saved at '{file_location}'"}


@app.get("/files/{file_id}/download/")
async def download_file(file_id: int, db: db_dependency, user: user_dependency):
    file_to_download = db.query(MyFile).filter(MyFile.id == file_id).first()
    if file_to_download is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    
    if not user.is_admin:
        user_db = db.query(User).filter(User.id == user.user_id).first()
        if user_db not in file_to_download.users:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                                detail="You don't have access to this file")

    file_path = f"{FILES_STORAGE_PATH}/{file_to_download.filename}"
    file_to_download.downloads_counter += 1
    db.add(file_to_download)
    db.commit()
    db.refresh(file_to_download)

    return FileResponse(path=file_path, filename=file_to_download.filename, media_type='multipart/form-data')


@app.get("/files/{file_id}/user/{user_id}/open-access/")
async def open_access_to_file(file_id: int, user_id: int, db: db_dependency, admin: admin_dependency):
    file = db.query(MyFile).filter(MyFile.id == file_id).first()
    if file is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if user in file.users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="This user already has access to this file.")
    
    file.users.append(user)
    db.commit()

    return {"message": f"Access for user {user.username} to file {file.filename} has been opened successfully"}


@app.get("/files/{file_id}/user/{user_id}/close-access/")
async def close_access_to_file(file_id: int, user_id: int, db: db_dependency, admin: admin_dependency):
    file = db.query(MyFile).filter(MyFile.id == file_id).first()
    if file is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if user not in file.users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="This user does not have access to this file.")
    
    file.users.remove(user)
    db.commit()

    return {"message": f"Access for user {user.username} to file {file.filename} has been closed"}


@app.delete("/files/{file_id}/delete/")
async def delete_file(file_id: int, db: db_dependency, admin: admin_dependency):
    file = db.query(MyFile).filter(MyFile.id == file_id).first()
    if file is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    
    filename = file.filename
    file_path = f"{FILES_STORAGE_PATH}/{filename}"

    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(file)
    db.commit()

    return {"message": f"File {filename} has been deleted successfully"}