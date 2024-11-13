import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

load_dotenv()

db_username = os.environ.get("WEB_MYSQL_USER")
db_password = os.environ.get("WEB_MYSQL_PASSWORD")
db_port = os.environ.get("WEB_MYSQL_TCP_PORT")
db_name = os.environ.get("WEB_MYSQL_DB")

DATABASE_URL = f"mysql+pymysql://{db_username}:{db_password}@filesharing_db:{db_port}/{db_name}"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()