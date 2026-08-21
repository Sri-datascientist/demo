from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models import (
    User,
    Product,
    Order,
    OrderItem,
    CartItem,
    FarmerProfile,
    Land,
    Crop,
    CropListing,
    SoilHealthReport,
    Address,
    Wallet,
    ProductReview,
    SupportTicket,
    Payment,
    Advisory,
    OtpCode,
)
from app.routers import auth, products, cart, orders, admin, farmer, customer, hub, fulfillment


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.run_startup_init:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()
    yield


app = FastAPI(title="Oyedesi API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(admin.router)
app.include_router(farmer.router)
app.include_router(customer.router)
app.include_router(hub.router)
app.include_router(fulfillment.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "oyedesi-api", "version": "2.0.0"}
