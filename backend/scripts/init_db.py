"""Create all database tables and seed initial data.

Usage (from backend folder):
    python scripts/init_db.py
    python scripts/init_db.py --reset   # drop app tables first, then recreate
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import inspect, text

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
from app.seed import seed_database

# Drop order: children before parents (MySQL FK)
APP_TABLES_DROP_ORDER = [
    "product_reviews",
    "support_tickets",
    "payments",
    "advisories",
    "crop_listings",
    "soil_health_reports",
    "crops",
    "lands",
    "addresses",
    "wallets",
    "otp_codes",
    "order_items",
    "cart_items",
    "orders",
    "products",
    "farmer_profiles",
    "users",
]

EXPECTED_TABLES = [
    "users",
    "farmer_profiles",
    "lands",
    "crops",
    "crop_listings",
    "soil_health_reports",
    "products",
    "cart_items",
    "orders",
    "order_items",
    "addresses",
    "wallets",
    "product_reviews",
    "support_tickets",
    "payments",
    "advisories",
    "otp_codes",
]


def reset_app_tables() -> None:
    print("Dropping existing Oyedesi app tables (if any)...")
    with engine.connect() as conn:
        conn.execute(text("SET FOREIGN_KEY_CHECKS=0"))
        for table in APP_TABLES_DROP_ORDER:
            conn.execute(text(f"DROP TABLE IF EXISTS `{table}`"))
        conn.execute(text("SET FOREIGN_KEY_CHECKS=1"))
        conn.commit()


def init_db(reset: bool = False) -> None:
    _ = (
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

    if reset:
        reset_app_tables()

    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    existing = inspector.get_table_names()
    print("Oyedesi app tables:", [t for t in EXPECTED_TABLES if t in existing])

    missing = [t for t in EXPECTED_TABLES if t not in existing]
    if missing:
        raise RuntimeError(f"Missing tables after create_all: {missing}")

    db = SessionLocal()
    try:
        print("Seeding data...")
        seed_database(db)
        user_count = db.query(User).count()
        product_count = db.query(Product).count()
        farmer_count = db.query(FarmerProfile).count()
        print(f"Done. Users: {user_count}, Farmers: {farmer_count}, Products: {product_count}")
        print("\n--- Test logins ---")
        print(f"Admin:    {settings.admin_email} / {settings.admin_password}")
        print(f"Customer: {settings.test_user_email} / {settings.test_user_password}")
        print(f"Farmer:   {settings.test_farmer_email} / {settings.test_farmer_password}")
        print(f"Hub:      {settings.test_hub_email} / {settings.test_hub_password}")
    finally:
        db.close()


if __name__ == "__main__":
    do_reset = "--reset" in sys.argv or "-r" in sys.argv
    init_db(reset=do_reset)
