from sqlalchemy import Column, Boolean, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True)
    password = Column(String(256))
    is_admin = Column(Boolean, default=False)
    files = relationship('MyFile', secondary='users_files', back_populates='users')


class MyFile(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(256))
    users = relationship('User', secondary='users_files', back_populates='files')


class UsersFiles(Base):
    __tablename__ = "users_files"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    file_id = Column(Integer, ForeignKey("files.id", ondelete="CASCADE"), primary_key=True)
