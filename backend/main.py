from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
import database, models, schemas, auth

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="DreamSync API")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Dependencies
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except auth.JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# Auth Endpoints
@app.post("/auth/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Sleep Logs Endpoints
@app.post("/sleep-logs/submit", response_model=schemas.SleepLog)
def submit_sleep_log(log: schemas.SleepLogCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_log = models.SleepLog(**log.dict(), owner_id=current_user.id)
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

# Alarms Endpoints
@app.post("/alarms/sync-calendar", response_model=schemas.Alarm)
def sync_calendar(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Mock syncing with calendar to create tomorrow's alarm
    # Assume first event is at 9:00 AM, target wakeup is 8:00 AM
    target_time = datetime.utcnow().replace(hour=8, minute=0, second=0, microsecond=0) + timedelta(days=1)
    
    # Mock adjustment based on sleep cycles, traffic and weather
    # Let's say traffic adds 15 mins to commute, so we wake up at 7:45 AM
    adjusted_time = target_time - timedelta(minutes=15)
    
    new_alarm = models.Alarm(
        target_time=target_time,
        adjusted_time=adjusted_time,
        owner_id=current_user.id
    )
    db.add(new_alarm)
    db.commit()
    db.refresh(new_alarm)
    return new_alarm

@app.get("/alarms/next", response_model=schemas.Alarm)
def get_next_alarm(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    alarm = db.query(models.Alarm).filter(models.Alarm.owner_id == current_user.id, models.Alarm.is_active == True).order_by(models.Alarm.adjusted_time).first()
    if not alarm:
        raise HTTPException(status_code=404, detail="No active alarms found")
    return alarm
