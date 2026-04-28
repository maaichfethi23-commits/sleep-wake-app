from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    sleep_logs = relationship("SleepLog", back_populates="owner")
    alarms = relationship("Alarm", back_populates="owner")

class SleepLog(Base):
    __tablename__ = "sleep_logs"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    bedtime = Column(DateTime)
    wakeup_time = Column(DateTime)
    quality_score = Column(Float) # e.g. 1.0 to 10.0

    owner = relationship("User", back_populates="sleep_logs")

class Alarm(Base):
    __tablename__ = "alarms"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    target_time = Column(DateTime)
    adjusted_time = Column(DateTime, nullable=True) # Adjusted by traffic/weather
    is_active = Column(Boolean, default=True)

    owner = relationship("User", back_populates="alarms")
