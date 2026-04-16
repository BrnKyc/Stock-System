from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Product
from schemas import ProductCreate, ProductOut
from typing import List

router = APIRouter()

@router.get("/", response_model=List[ProductOut])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()

@router.get("/barcode/{barcode}", response_model=ProductOut)
def get_by_barcode(barcode: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.barcode == barcode).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    return product

@router.post("/", response_model=ProductOut)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(Product).filter(Product.barcode == product.barcode).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu barkod zaten kayıtlı")
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, product: ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    for key, value in product.model_dump().items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    db.delete(db_product)
    db.commit()
    return {"mesaj": "Ürün silindi"}