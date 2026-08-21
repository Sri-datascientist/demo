from sqlalchemy.orm import Session

from app.config import settings
from app.dependencies import hash_password
from app.models.advisory import Advisory, AdvisoryType
from app.models.customer import Wallet
from app.models.farmer import FarmerProfile, Land, Crop, FarmingStage, VerificationStatus, KycStatus
from app.models.finance import Payment, PaymentStatus, PaymentType
from app.models.product import Product
from app.models.user import User, UserRole
from app.models.order import Warehouse, DeliveryPartner


def _ensure_user(
    db: Session,
    email: str,
    password: str,
    full_name: str,
    role: UserRole,
    phone: str = "",
    is_verified: bool = True,
) -> User:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            password_hash=hash_password(password),
            full_name=full_name,
            role=role,
            phone=phone,
            is_verified=is_verified,
        )
        db.add(user)
        db.flush()
    else:
        user.password_hash = hash_password(password)
        user.full_name = full_name
        user.role = role
        user.phone = phone
        user.is_verified = is_verified
    return user


def _ensure_farmer_profile(db: Session, user: User) -> FarmerProfile:
    profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user.id).first()
    if not profile:
        profile = FarmerProfile(
            user_id=user.id,
            farmer_code=f"OYD-FARM-{user.id:05d}",
            address="Village Rampur, District Meerut, Uttar Pradesh",
            verification_status=VerificationStatus.verified,
            aadhaar_masked="XXXX-XXXX-3210",
            kyc_status=KycStatus.verified,
            kyc_provider="digilocker",
            kyc_reference="DL-seed-demo",
        )
        db.add(profile)
        db.flush()
    return profile


def seed_database(db: Session) -> None:
    admin = _ensure_user(
        db,
        settings.admin_email,
        settings.admin_password,
        "Oyedesi Admin",
        UserRole.admin,
    )

    customer = _ensure_user(
        db,
        settings.test_user_email,
        settings.test_user_password,
        settings.test_user_name,
        UserRole.customer,
    )
    if not db.query(Wallet).filter(Wallet.user_id == customer.id).first():
        db.add(Wallet(user_id=customer.id, points=250, loyalty_tier="silver"))

    farmer_user = _ensure_user(
        db,
        settings.test_farmer_email,
        settings.test_farmer_password,
        settings.test_farmer_name,
        UserRole.farmer,
        phone="9876543210",
        is_verified=True,
    )
    farmer_profile = _ensure_farmer_profile(db, farmer_user)

    hub = _ensure_user(
        db,
        settings.test_hub_email,
        settings.test_hub_password,
        settings.test_hub_name,
        UserRole.district_hub,
        phone="9876501234",
        is_verified=True,
    )

    if db.query(Land).filter(Land.farmer_id == farmer_profile.id).count() == 0:
        land = Land(
            farmer_id=farmer_profile.id,
            name="North Field",
            area_acres=5.5,
            location_text="Rampur, Meerut, UP",
            latitude=28.9845,
            longitude=77.7064,
            soil_type="Loamy",
            soil_ph=6.8,
            soil_moisture="Moderate",
        )
        db.add(land)
        db.flush()
        db.add(
            Crop(
                farmer_id=farmer_profile.id,
                land_id=land.id,
                name="Wheat",
                variety="HD-2967",
                farming_stage=FarmingStage.growing,
                expected_yield_kg=2200,
            )
        )

    if db.query(Advisory).count() == 0:
        db.add_all(
            [
                Advisory(
                    advisory_type=AdvisoryType.soil,
                    title="Soil health check recommended",
                    content="Test soil pH before next sowing season. Ideal range: 6.0–7.0 for most crops.",
                ),
                Advisory(
                    advisory_type=AdvisoryType.weather,
                    title="Rain alert — next 48 hours",
                    content="Moderate rainfall expected. Delay fertilizer application until fields dry.",
                ),
                Advisory(
                    farmer_id=farmer_profile.id,
                    advisory_type=AdvisoryType.crop,
                    title="Wheat growth advisory",
                    content="Your wheat crop is in growing stage. Consider light irrigation this week.",
                ),
            ]
        )

    if db.query(Payment).filter(Payment.farmer_id == farmer_profile.id).count() == 0:
        db.add_all(
            [
                Payment(
                    farmer_id=farmer_profile.id,
                    amount=4500.0,
                    status=PaymentStatus.completed,
                    payment_type=PaymentType.sale,
                    reference="PAY-FARM-001",
                    notes="Wheat sale settlement",
                ),
                Payment(
                    farmer_id=farmer_profile.id,
                    amount=1200.0,
                    status=PaymentStatus.pending,
                    payment_type=PaymentType.sale,
                    reference="PAY-FARM-002",
                    notes="Mustard crop pending settlement",
                ),
            ]
        )

    if db.query(Product).count() == 0:
        products = [
            Product(
                name="Organic Basmati Rice",
                category="Grains",
                description="Sustainably grown, chemical-free long-grain rice from Satvik farms.",
                price=180.0,
                stock_quantity=120,
                image_url="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
                farmer_name=farmer_user.full_name,
                farmer_profile_id=farmer_profile.id,
                offer_percent=10,
            ),
            Product(
                name="Cold-Pressed Mustard Oil",
                category="Oils",
                description="Traditionally extracted pure mustard oil for healthy cooking.",
                price=220.0,
                stock_quantity=85,
                image_url="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80",
                farmer_name="Satvik Farms Collective",
                offer_percent=5,
            ),
            Product(
                name="Himalayan Forest Honey",
                category="Natural Foods",
                description="Pure, unprocessed honey from Himalayan foothills.",
                price=450.0,
                stock_quantity=60,
                image_url="https://images.unsplash.com/photo-1587049352846-4a22242a6418?auto=format&fit=crop&w=800&q=80",
                farmer_name="Himalayan Growers",
            ),
            Product(
                name="Natural Turmeric Powder",
                category="Spices",
                description="High-curcumin turmeric from certified Satvik farms.",
                price=95.0,
                stock_quantity=200,
                image_url="https://images.unsplash.com/photo-1615485290382-4411204e1bac?auto=format&fit=crop&w=800&q=80",
                farmer_name=farmer_user.full_name,
                farmer_profile_id=farmer_profile.id,
            ),
            Product(
                name="Multigrain Atta",
                category="Grains",
                description="Balanced blend of natural grains for a wholesome diet.",
                price=65.0,
                stock_quantity=150,
                image_url="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
                farmer_name="Oyedesi Mill",
                offer_percent=15,
            ),
            Product(
                name="Organic Jaggery Blocks",
                category="Natural Foods",
                description="Traditional gur made without chemicals.",
                price=55.0,
                stock_quantity=8,
                image_url="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
                farmer_name="Village Cooperative",
            ),
        ]
        db.add_all(products)

    # Seed Warehouses
    if db.query(Warehouse).count() == 0:
        db.add_all([
            Warehouse(name="North Regional Warehouse", location="Sector 14, Meerut, UP"),
            Warehouse(name="South Hub Warehouse", location="Agara, Bangalore, KA"),
            Warehouse(name="Western Distribution Point", location="Vashi, Navi Mumbai, MH"),
        ])
    
    # Seed Delivery Partners
    if db.query(DeliveryPartner).count() == 0:
        db.add_all([
            DeliveryPartner(name="Ramesh Kumar", phone="9876543201", vehicle_number="UP-15-AT-4321", status="idle"),
            DeliveryPartner(name="Anil Singh", phone="9876543202", vehicle_number="KA-03-MB-9876", status="idle"),
            DeliveryPartner(name="Vijay Patil", phone="9876543203", vehicle_number="MH-43-XY-1234", status="idle"),
        ])

    db.commit()
