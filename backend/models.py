from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base
import enum

class MovementType(str, enum.Enum):
    giris = "giris"
    cikis = "cikis"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    role = Column(String, default="worker")  # admin / worker
    password_hash = Column(String, nullable=False)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    barcode = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String)
    unit = Column(String, default="adet")  # adet, kg, metre...
    min_stock = Column(Float, default=0)
    current_stock = Column(Float, default=0)
    movements = relationship("Movement", back_populates="product")

class Movement(Base):
    __tablename__ = "movements"
    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    type = Column(Enum(MovementType))
    quantity = Column(Float, nullable=False)
    note = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    product = relationship("Product", back_populates="movements")
    user = relationship("User")