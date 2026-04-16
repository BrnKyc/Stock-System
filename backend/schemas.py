from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models import MovementType

class ProductCreate(BaseModel):
    barcode: str
    name: str
    category: Optional[str] = None
    unit: str = "adet"
    min_stock: float = 0
    current_stock: float = 0

class ProductOut(BaseModel):
    id: int
    barcode: str
    name: str
    category: Optional[str]
    unit: str
    min_stock: float
    current_stock: float

    class Config:
        from_attributes = True

class MovementCreate(BaseModel):
    product_id: int
    type: MovementType
    quantity: float
    note: Optional[str] = None
    user_id: int

class MovementOut(BaseModel):
    id: int
    product_id: Optional[int] = None
    type: MovementType
    quantity: float
    note: Optional[str]
    created_at: datetime
    user_id: Optional[int] = None

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    name: str
    role: str = "worker"
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    role: str

    class Config:
        from_attributes = True