from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Movement, Product, MovementType
from datetime import datetime
from typing import Optional

router = APIRouter()

@router.get("/summary")
def get_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Movement)

    if start_date:
        query = query.filter(Movement.created_at >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Movement.created_at <= datetime.fromisoformat(end_date + "T23:59:59"))

    movements = query.all()
    products = db.query(Product).all()
    product_map = {p.id: p for p in products}

    summary = {}
    movement_details = []

    for m in movements:
        pid = m.product_id
        p = product_map.get(pid)

        # Hareket detayı
        movement_details.append({
            "created_at": m.created_at.isoformat(),
            "product_name": p.name if p else "-",
            "unit": p.unit if p else "-",
            "type": m.type.value,
            "quantity": m.quantity,
            "note": m.note
        })

        # Ürün özeti
        if pid not in summary:
            summary[pid] = {
                "product_id": pid,
                "product_name": p.name if p else "-",
                "unit": p.unit if p else "-",
                "current_stock": p.current_stock if p else 0,
                "total_giris": 0,
                "total_cikis": 0,
                "movement_count": 0
            }

        if m.type == MovementType.giris:
            summary[pid]["total_giris"] += m.quantity
        else:
            summary[pid]["total_cikis"] += m.quantity
        summary[pid]["movement_count"] += 1

    return {
        "start_date": start_date,
        "end_date": end_date,
        "total_movements": len(movements),
        "movements": movement_details,
        "products": list(summary.values())
    }