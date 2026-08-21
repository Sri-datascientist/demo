from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_admin
from app.models.advisory import Advisory, AdvisoryType
from app.models.customer import ProductReview
from app.models.farmer import (
    Crop,
    CropListing,
    FarmerProfile,
    Land,
    ListingStatus,
    SoilHealthReport,
    SoilReportStatus,
    VerificationStatus,
)
from app.models.finance import Payment
from app.models.order import Order, OrderItem, OrderStatus
from app.models.product import Product
from app.models.support import SupportTicket, TicketStatus
from app.models.user import User, UserRole
from app.schemas.advisory import AdvisoryCreate, AdvisoryResponse, PaymentResponse
from app.schemas.analytics import AnalyticsSummary
from app.schemas.farmer import (
    AdminCropResponse,
    AdminLandResponse,
    AdminSoilHealthReportResponse,
    CropListingResponse,
    FarmerProfileResponse,
)
from app.serializers.farmer import crop_listing_response, farmer_profile_response
from app.schemas.order import OrderResponse, OrderStatusUpdate
from app.schemas.product import ProductResponse
from app.schemas.user import UserResponse, UserUpdate, AdminFarmerUpdate
from app.routers.orders import _serialize_order
from app.database import engine

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/orders", response_model=List[OrderResponse])
def admin_list_orders(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    from sqlalchemy.orm import joinedload

    orders = (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.user),
            joinedload(Order.warehouse),
            joinedload(Order.delivery_partner)
        )
        .order_by(Order.created_at.desc())
        .all()
    )
    return [_serialize_order(o) for o in orders]


@router.patch("/orders/{order_id}", response_model=OrderResponse)
def admin_update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    from sqlalchemy.orm import joinedload

    order = (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.user)
        )
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    old_status = order.status

    try:
        order.status = OrderStatus(payload.status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")

    if payload.tracking_number:
        order.tracking_number = payload.tracking_number

    db.commit()
    db.refresh(order)

    # Send status update email if the status changed
    if old_status != order.status:
        try:
            from app.services.email_service import send_order_status_update_email
            target_email = (order.user.email if order.user else getattr(order, 'user_email', None))
            if target_email:
                send_order_status_update_email(order, target_email)
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to send status update email: {e}")



    return _serialize_order(order)


@router.get("/inventory", response_model=List[ProductResponse])
def admin_inventory(
    product_type: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    query = db.query(Product)
    if product_type:
        if product_type == "inhouse":
            query = query.filter(
                Product.farmer_profile_id == None,
                (Product.farmer_name == "") | (Product.farmer_name.ilike("oyedesi%"))
            )
        elif product_type == "farmer":
            query = query.filter(
                (Product.farmer_profile_id != None) |
                ((Product.farmer_name != "") & (~Product.farmer_name.ilike("oyedesi%")))
            )
    return query.order_by(Product.name).all()


@router.get("/analytics", response_model=AnalyticsSummary)
def admin_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    total_revenue = db.query(func.coalesce(func.sum(Order.total_amount), 0)).scalar() or 0.0
    total_customers = db.query(func.count(User.id)).filter(User.role == UserRole.customer).scalar() or 0
    total_farmers = db.query(func.count(User.id)).filter(User.role == UserRole.farmer).scalar() or 0
    total_products = db.query(func.count(Product.id)).scalar() or 0
    low_stock_count = db.query(func.count(Product.id)).filter(Product.stock_quantity <= 10).scalar() or 0
    pending_listings = (
        db.query(func.count(CropListing.id))
        .filter(CropListing.status.in_([ListingStatus.submitted, ListingStatus.quality_check]))
        .scalar()
        or 0
    )
    pending_soil_reports = (
        db.query(func.count(SoilHealthReport.id))
        .filter(SoilHealthReport.status == SoilReportStatus.submitted)
        .scalar()
        or 0
    )
    open_support_tickets = (
        db.query(func.count(SupportTicket.id))
        .filter(SupportTicket.status.in_([TicketStatus.open, TicketStatus.in_progress]))
        .scalar()
        or 0
    )

    orders_by_status: dict[str, int] = {}
    for status in OrderStatus:
        count = db.query(func.count(Order.id)).filter(Order.status == status).scalar() or 0
        orders_by_status[status.value] = count

    try:
        dialect = engine.dialect.name
        if dialect == "mysql":
            month_expr = func.date_format(Order.created_at, "%Y-%m").label("month")
        else:
            month_expr = func.to_char(Order.created_at, "YYYY-MM").label("month")

        revenue_rows = (
            db.query(
                month_expr,
                func.coalesce(func.sum(Order.total_amount), 0).label("revenue"),
            )
            .group_by("month")
            .order_by("month")
            .limit(6)
            .all()
        )
        revenue_by_month = [{"month": r.month, "revenue": float(r.revenue)} for r in revenue_rows]
    except Exception:
        revenue_by_month = []

    return AnalyticsSummary(
        total_orders=total_orders,
        total_revenue=float(total_revenue),
        total_customers=total_customers,
        total_farmers=total_farmers,
        total_products=total_products,
        low_stock_count=low_stock_count,
        pending_crop_listings=pending_listings,
        pending_soil_reports=pending_soil_reports,
        open_support_tickets=open_support_tickets,
        orders_by_status=orders_by_status,
        revenue_by_month=revenue_by_month,
    )


@router.get("/farmers", response_model=List[FarmerProfileResponse])
def admin_list_farmers(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    profiles = db.query(FarmerProfile).order_by(FarmerProfile.created_at.desc()).all()
    result = []
    for p in profiles:
        user = db.query(User).filter(User.id == p.user_id).first()
        if user:
            result.append(farmer_profile_response(p, user))
    return result


@router.patch("/farmers/{farmer_id}/verify", response_model=FarmerProfileResponse)
def admin_verify_farmer(
    farmer_id: int,
    status: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    profile = db.query(FarmerProfile).filter(FarmerProfile.id == farmer_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer not found")
    try:
        profile.verification_status = VerificationStatus(status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
    db.commit()
    db.refresh(profile)
    user = db.query(User).filter(User.id == profile.user_id).first()
    return farmer_profile_response(profile, user)


@router.get("/users", response_model=List[UserResponse])
def admin_list_users(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    users = db.query(User).filter(User.role == UserRole.customer).order_by(User.created_at.desc()).all()
    return [UserResponse.model_validate(u) for u in users]


@router.patch("/users/{user_id}", response_model=UserResponse)
def admin_update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id, User.role == UserRole.customer).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.phone is not None:
        user.phone = payload.phone
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)


@router.delete("/users/{user_id}")
def admin_delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == UserRole.admin:
        raise HTTPException(status_code=400, detail="Cannot delete admin accounts")
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    db.delete(user)
    db.commit()
    return {"ok": True}


@router.patch("/farmers/{farmer_id}", response_model=FarmerProfileResponse)
def admin_update_farmer(
    farmer_id: int,
    payload: AdminFarmerUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    profile = db.query(FarmerProfile).filter(FarmerProfile.id == farmer_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Farmer not found")
    if payload.address is not None:
        profile.address = payload.address
    if payload.documents_json is not None:
        profile.documents_json = payload.documents_json
    db.commit()
    db.refresh(profile)
    user = db.query(User).filter(User.id == profile.user_id).first()
    return farmer_profile_response(profile, user)


@router.get("/crop-listings", response_model=List[CropListingResponse])
def admin_crop_listings(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    listings = db.query(CropListing).order_by(CropListing.created_at.desc()).all()
    result = []
    for listing in listings:
        farmer = db.query(FarmerProfile).filter(FarmerProfile.id == listing.farmer_id).first()
        user = db.query(User).filter(User.id == farmer.user_id).first() if farmer else None
        result.append(crop_listing_response(listing, farmer, user))
    return result


@router.patch("/crop-listings/{listing_id}", response_model=CropListingResponse)
def admin_update_crop_listing(
    listing_id: int,
    status: str,
    quality_grade: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    raise HTTPException(
        status_code=403,
        detail="Crop grading and approval are managed by the District Hub collector",
    )


@router.get("/payments", response_model=List[PaymentResponse])
def admin_payments(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    return db.query(Payment).order_by(Payment.created_at.desc()).all()


@router.get("/advisories", response_model=List[AdvisoryResponse])
def admin_advisories(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    return db.query(Advisory).order_by(Advisory.created_at.desc()).all()


@router.post("/advisories", response_model=AdvisoryResponse)
def admin_create_advisory(
    payload: AdvisoryCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    try:
        adv_type = AdvisoryType(payload.advisory_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid advisory type")
    advisory = Advisory(
        farmer_id=payload.farmer_id,
        advisory_type=adv_type,
        title=payload.title,
        content=payload.content,
    )
    db.add(advisory)
    db.commit()
    db.refresh(advisory)
    return advisory


@router.delete("/advisories/{advisory_id}")
def admin_delete_advisory(
    advisory_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    advisory = db.query(Advisory).filter(Advisory.id == advisory_id).first()
    if not advisory:
        raise HTTPException(status_code=404, detail="Advisory not found")
    db.delete(advisory)
    db.commit()
    return {"ok": True}


@router.delete("/crop-listings/{listing_id}")
def admin_delete_crop_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    listing = db.query(CropListing).filter(CropListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    db.delete(listing)
    db.commit()
    return {"ok": True}


@router.get("/support-tickets")
def admin_support_tickets(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    tickets = db.query(SupportTicket).order_by(SupportTicket.created_at.desc()).all()
    result = []
    for t in tickets:
        user = db.query(User).filter(User.id == t.user_id).first()
        result.append(
            {
                "id": t.id,
                "user_id": t.user_id,
                "user_name": user.full_name if user else "",
                "user_email": user.email if user else "",
                "user_role": user.role.value if user else "",
                "category": t.category,
                "subject": t.subject,
                "description": t.description,
                "status": t.status.value,
                "admin_response": t.admin_response,
                "created_at": t.created_at.isoformat(),
                "updated_at": t.updated_at.isoformat(),
            }
        )
    return result


@router.patch("/support-tickets/{ticket_id}")
def admin_update_ticket(
    ticket_id: int,
    status: str,
    admin_response: str = "",
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    try:
        ticket.status = TicketStatus(status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
    if admin_response:
        ticket.admin_response = admin_response
    db.commit()
    return {"ok": True}


@router.get("/soil-reports", response_model=List[AdminSoilHealthReportResponse])
def admin_soil_reports(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    reports = db.query(SoilHealthReport).order_by(SoilHealthReport.created_at.desc()).all()
    result = []
    for r in reports:
        farmer = db.query(FarmerProfile).filter(FarmerProfile.id == r.farmer_id).first()
        user = db.query(User).filter(User.id == farmer.user_id).first() if farmer else None
        land = db.query(Land).filter(Land.id == r.land_id).first() if r.land_id else None
        result.append(
            AdminSoilHealthReportResponse(
                id=r.id,
                farmer_id=r.farmer_id,
                land_id=r.land_id,
                report_name=r.report_name,
                notes=r.notes,
                file_url=r.file_url,
                status=r.status.value,
                created_at=r.created_at,
                farmer_name=user.full_name if user else "",
                farmer_code=farmer.farmer_code if farmer else "",
                land_name=land.name if land else "",
            )
        )
    return result


@router.patch("/soil-reports/{report_id}", response_model=AdminSoilHealthReportResponse)
def admin_update_soil_report(
    report_id: int,
    status: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    report = db.query(SoilHealthReport).filter(SoilHealthReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Soil report not found")
    try:
        report.status = SoilReportStatus(status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
    db.commit()
    db.refresh(report)

    farmer = db.query(FarmerProfile).filter(FarmerProfile.id == report.farmer_id).first()
    user = db.query(User).filter(User.id == farmer.user_id).first() if farmer else None
    land = db.query(Land).filter(Land.id == report.land_id).first() if report.land_id else None
    return AdminSoilHealthReportResponse(
        id=report.id,
        farmer_id=report.farmer_id,
        land_id=report.land_id,
        report_name=report.report_name,
        notes=report.notes,
        file_url=report.file_url,
        status=report.status.value,
        created_at=report.created_at,
        farmer_name=user.full_name if user else "",
        farmer_code=farmer.farmer_code if farmer else "",
        land_name=land.name if land else "",
    )


@router.get("/lands", response_model=List[AdminLandResponse])
def admin_lands(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    lands = db.query(Land).order_by(Land.created_at.desc()).all()
    result = []
    for land in lands:
        farmer = db.query(FarmerProfile).filter(FarmerProfile.id == land.farmer_id).first()
        user = db.query(User).filter(User.id == farmer.user_id).first() if farmer else None
        result.append(
            AdminLandResponse(
                id=land.id,
                farmer_id=land.farmer_id,
                name=land.name,
                area_acres=land.area_acres,
                location_text=land.location_text,
                latitude=land.latitude,
                longitude=land.longitude,
                soil_type=land.soil_type,
                soil_ph=land.soil_ph,
                soil_moisture=land.soil_moisture,
                notes=land.notes,
                created_at=land.created_at,
                farmer_name=user.full_name if user else "",
                farmer_code=farmer.farmer_code if farmer else "",
            )
        )
    return result


@router.get("/crops", response_model=List[AdminCropResponse])
def admin_crops(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    crops = db.query(Crop).order_by(Crop.created_at.desc()).all()
    result = []
    for crop in crops:
        farmer = db.query(FarmerProfile).filter(FarmerProfile.id == crop.farmer_id).first()
        user = db.query(User).filter(User.id == farmer.user_id).first() if farmer else None
        land = db.query(Land).filter(Land.id == crop.land_id).first() if crop.land_id else None
        result.append(
            AdminCropResponse(
                id=crop.id,
                farmer_id=crop.farmer_id,
                land_id=crop.land_id,
                name=crop.name,
                variety=crop.variety,
                farming_stage=crop.farming_stage.value,
                expected_yield_kg=crop.expected_yield_kg,
                planted_at=crop.planted_at,
                harvest_expected_at=crop.harvest_expected_at,
                notes=crop.notes,
                created_at=crop.created_at,
                farmer_name=user.full_name if user else "",
                farmer_code=farmer.farmer_code if farmer else "",
                land_name=land.name if land else "",
            )
        )
    return result


@router.get("/reviews")
def admin_reviews(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    reviews = db.query(ProductReview).order_by(ProductReview.created_at.desc()).all()
    result = []
    for review in reviews:
        user = db.query(User).filter(User.id == review.user_id).first()
        product = db.query(Product).filter(Product.id == review.product_id).first()
        result.append(
            {
                "id": review.id,
                "product_id": review.product_id,
                "product_name": product.name if product else "",
                "user_id": review.user_id,
                "user_name": user.full_name if user else "",
                "user_email": user.email if user else "",
                "rating": review.rating,
                "comment": review.comment,
                "created_at": review.created_at.isoformat(),
            }
        )
    return result
