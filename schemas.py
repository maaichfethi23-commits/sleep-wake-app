from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Users
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

# Sleep Logs
class SleepLogBase(BaseModel):
    bedtime: datetime
    wakeup_time: datetime
    quality_score: float

class SleepLogCreate(SleepLogBase):
    pass

class SleepLog(SleepLogBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True

# Alarms
class AlarmBase(BaseModel):
    target_time: datetime

class AlarmCreate(AlarmBase):
    pass

class Alarm(AlarmBase):
    id: int
    owner_id: int
    adjusted_time: Optional[datetime] = None
    is_active: bool

    class Config:
        from_attributes = True

# Auth token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
