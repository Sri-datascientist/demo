import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_admin
from app.models.order import Order, OrderItem, OrderStatus, Warehouse, DeliveryPartner
from app.models.user import User
from app.routers.orders import _serialize_order
from app.schemas.order import OrderResponse
from app.services.email_service import send_order_status_update_email

router = APIRouter(prefix="/api/admin/fulfillment", tags=["fulfillment"])

# Pydantic Schemas
class WarehouseCreate(BaseModel):
    name: str
    location: str

class WarehouseResponse(BaseModel):
    id: int
    name: str
    location: str
    created_at: datetime

    class Config:
        from_attributes = True

class DeliveryPartnerCreate(BaseModel):
    name: str
    phone: str
    vehicle_number: str

class DeliveryPartnerResponse(BaseModel):
    id: int
    name: str
    phone: str
    vehicle_number: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class OrderAssignRequest(BaseModel):
    warehouse_id: Optional[int] = None
    delivery_partner_id: Optional[int] = None

class OtpVerificationRequest(BaseModel):
    otp: str

# Helper to generate numeric OTP
def generate_numeric_otp(length: int = 6) -> str:
    return "".join(random.choices("0123456789", k=length))

# Warehouses CRUD
@router.get("/warehouses", response_model=List[WarehouseResponse])
def get_warehouses(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    return db.query(Warehouse).all()

@router.post("/warehouses", response_model=WarehouseResponse)
def create_warehouse(payload: WarehouseCreate, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    wh = Warehouse(name=payload.name, location=payload.location)
    db.add(wh)
    db.commit()
    db.refresh(wh)
    return wh

# Delivery Partners CRUD
@router.get("/delivery-partners", response_model=List[DeliveryPartnerResponse])
def get_delivery_partners(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    return db.query(DeliveryPartner).all()

@router.post("/delivery-partners", response_model=DeliveryPartnerResponse)
def create_delivery_partner(payload: DeliveryPartnerCreate, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    dp = DeliveryPartner(
        name=payload.name,
        phone=payload.phone,
        vehicle_number=payload.vehicle_number,
        status="idle"
    )
    db.add(dp)
    db.commit()
    db.refresh(dp)
    return dp

# Order Assignment & OTP Generation
@router.post("/orders/{order_id}/assign", response_model=OrderResponse)
def assign_order_fulfillment(
    order_id: int,
    payload: OrderAssignRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
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

    # Generate OTPs if assignment changes or OTPs are blank
    if payload.warehouse_id:
        order.warehouse_id = payload.warehouse_id
    if payload.delivery_partner_id:
        order.delivery_partner_id = payload.delivery_partner_id
        
    if not order.dispatch_otp:
        order.dispatch_otp = generate_numeric_otp(6)
    if not order.delivery_otp:
        order.delivery_otp = generate_numeric_otp(6)

    # Automatically transition status to processing when assigned
    old_status = order.status
    order.status = OrderStatus.processing
    
    db.commit()
    db.refresh(order)

    # Notify customer of assignment
    if old_status != order.status:
        try:
            target_email = (order.user and order.user.email) or order.user_email
            if target_email:
                send_order_status_update_email(order, target_email)
        except Exception as e:
            pass


    return _serialize_order(order)

# Verify Dispatch (Warehouse Pickup)
@router.post("/orders/{order_id}/verify-dispatch", response_model=OrderResponse)
def verify_warehouse_dispatch(
    order_id: int,
    payload: OtpVerificationRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
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

    if not order.dispatch_otp or order.dispatch_otp != payload.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid Warehouse Dispatch OTP")

    order.dispatch_verified = True
    order.status = OrderStatus.shipped  # Transition to Dispatched/Shipped
    
    db.commit()
    db.refresh(order)

    # Trigger Dispatch Email
    try:
        if order.user and order.user.email:
            send_order_status_update_email(order, order.user.email)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to send dispatch email: {e}")

    return _serialize_order(order)


# Verify Delivery (Customer Handover)
@router.post("/orders/{order_id}/verify-delivery", response_model=OrderResponse)
def verify_customer_delivery(
    order_id: int,
    payload: OtpVerificationRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
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

    if not order.delivery_otp or order.delivery_otp != payload.otp.strip():
        raise HTTPException(status_code=400, detail="Invalid Customer Delivery OTP")

    order.delivery_verified = True
    order.status = OrderStatus.delivered  # Transition to Delivered
    
    db.commit()
    db.refresh(order)

    # Trigger Delivery Email
    try:
        if order.user and order.user.email:
            send_order_status_update_email(order, order.user.email)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to send delivery email: {e}")

    return _serialize_order(order)

