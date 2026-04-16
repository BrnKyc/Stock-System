from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, UserOut
from typing import List
from passlib.context import CryptContext
from pydantic import BaseModel

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.get("/", response_model=List[UserOut])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.post("/", response_model=UserOut)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    hashed = pwd_context.hash(user.password)
    db_user = User(name=user.name, role=user.role, password_hash=hashed)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    db.delete(user)
    db.commit()
    return {"mesaj": "Kullanıcı silindi"}

class LoginRequest(BaseModel):
    name: str
    password: str

@router.post("/login", response_model=UserOut)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.name == data.name).first()
    if not user or not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Hatalı kullanıcı adı veya şifre")
    return user