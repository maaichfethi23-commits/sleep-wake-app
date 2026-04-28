import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Use SQLite for quick local dev if POSTGRES_URL isn't set
SQLALCHEMY_DATABASE_URL = os.getenv(
    "POSTGRES_URL", 
    "sqlite:///./dreamsync.db"
)

# SQLite needs connect_args={"check_same_thread": False}, Postgres doesn't
connect_args = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
