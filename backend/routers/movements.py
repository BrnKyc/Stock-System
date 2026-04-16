from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Movement, Product, MovementType
from schemas import MovementCreate, MovementOut
from typing import List

router = APIRouter()

@router.get("/", response_model=List[MovementOut])
def get_movements(db: Session = Depends(get_db)):
    return db.query(Movement).order_by(Movement.created_at.desc()).all()

@router.get("/product/{product_id}", response_model=List[MovementOut])
def get_product_movements(product_id: int, db: Session = Depends(get_db)):
    return db.query(Movement).filter(
        Movement.product_id == product_id
    ).order_by(Movement.created_at.desc()).all()

@router.post("/", response_model=MovementOut)
def create_movement(movement: MovementCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == movement.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    if movement.type == MovementType.cikis:
        if product.current_stock < movement.quantity:
            raise HTTPException(status_code=400, detail="Yetersiz stok")
        product.current_stock -= movement.quantity
    else:
        product.current_stock += movement.quantity

    db_movement = Movement(**movement.model_dump())
    db.add(db_movement)
    db.commit()
    db.refresh(db_movement)
    return db_movement