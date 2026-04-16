from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import products, movements, users, reports

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Stok Yönetim Sistemi")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/products", tags=["Ürünler"])
app.include_router(movements.router, prefix="/movements", tags=["Hareketler"])
app.include_router(users.router, prefix="/users", tags=["Kullanıcılar"])
app.include_router(reports.router, prefix="/reports", tags=["Raporlar"])

@app.get("/")
def root():
    return {"mesaj": "Stok sistemi çalışıyor"}