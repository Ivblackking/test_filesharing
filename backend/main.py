import os
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends, status, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated
from sqlalchemy.orm import Session, load_only
import models
from models import User, MyFile
from database import engine, SessionLocal
from schemas import SUserSignUp, SMyFileUser, SUserPayload
from utils import (get_hashed_password, authenticate_user, create_access_token, 
                   get_current_user, get_admin_user, get_user_by_id, get_file_by_id,
                   write_to_log_file, STORAGE_LOGS_FILENAME)


logger = logging.getLogger('uvicorn.error')
logger.setLevel(logging.DEBUG)


ADMIN_KEY = os.environ.get("ADMIN_KEY")
FILES_STORAGE_PATH = "files_storage"


app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try : 
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[SUserPayload, Depends(get_current_user)]
admin_dependency = Annotated[SUserPayload, Depends(get_admin_user)]


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


@app.get("/users/")
async def users_list(db: db_dependency, admin: admin_dependency):
    users = db.query(User).options(load_only(User.id, User.username, User.is_admin)).all()
    return {"users": users}


@app.get("/users/{user_id}/files/")
async def user_files_for_admin(user_id: int, db: db_dependency, admin: admin_dependency):
    user = get_user_by_id(user_id, db)
    return {"username": user.username, "files": user.files}


@app.get("/user/my-files/")
async def user_files(db: db_dependency, user: user_dependency):
    user_db = get_user_by_id(user.user_id, db)
    user_files = [SMyFileUser(file_id=file.id, filename=file.filename) for file in user_db.files]
    return {"username": user_db.username, "files": user_files}


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


@app.get("/files/")
async def files_list(db: db_dependency, admin: admin_dependency):
    files = db.query(MyFile).all()
    return {"files": files}


@app.get("/files/{file_id}/download/")
async def download_file(file_id: int, db: db_dependency, user: user_dependency):
    file_to_download = get_file_by_id(file_id, db)
    
    if not user.is_admin:
        user_db = get_user_by_id(user.user_id, db)
        if user_db not in file_to_download.users:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
                                detail="You don't have access to this file")

    file_path = f"{FILES_STORAGE_PATH}/{file_to_download.filename}"
    file_to_download.downloads_counter += 1
    db.add(file_to_download)
    db.commit()
    db.refresh(file_to_download)

    log_str = f"{user.username} - {file_to_download.filename} - {datetime.now()}"
    await write_to_log_file(log_str)

    return FileResponse(path=file_path, filename=file_to_download.filename, media_type='multipart/form-data')


@app.get("/files/{file_id}/user/{user_id}/open-access/")
async def open_access_to_file(file_id: int, user_id: int, db: db_dependency, admin: admin_dependency):
    file = get_file_by_id(file_id, db)
    user = get_user_by_id(user_id, db)
    
    if user in file.users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="This user already has access to this file.")
    
    file.users.append(user)
    db.commit()

    return {"message": f"Access for user {user.username} to file {file.filename} has been opened successfully"}


@app.get("/files/{file_id}/user/{user_id}/close-access/")
async def close_access_to_file(file_id: int, user_id: int, db: db_dependency, admin: admin_dependency):
    file = get_file_by_id(file_id, db)
    user = get_user_by_id(user_id, db)
    
    if user not in file.users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="This user does not have access to this file.")
    
    file.users.remove(user)
    db.commit()

    return {"message": f"Access for user {user.username} to file {file.filename} has been closed"}


@app.delete("/files/{file_id}/delete/")
async def delete_file(file_id: int, db: db_dependency, admin: admin_dependency):
    file = get_file_by_id(file_id, db)
    
    filename = file.filename
    file_path = f"{FILES_STORAGE_PATH}/{filename}"

    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(file)
    db.commit()

    return {"message": f"File {filename} has been deleted successfully"}


@app.get("/storage-logs/download/")
async def download_logs(admin: admin_dependency):
    if not os.path.exists(STORAGE_LOGS_FILENAME):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Logs file not found")

    return FileResponse(
        path=STORAGE_LOGS_FILENAME,
        filename=STORAGE_LOGS_FILENAME,
        media_type='multipart/form-data'
    )