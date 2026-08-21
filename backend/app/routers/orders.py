import random
import string
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.order import CartItem, Order, OrderItem, OrderStatus
from app.models.user import User
from app.models.customer import Wallet
from app.schemas.order import CheckoutRequest, OrderItemResponse, OrderResponse, WarehouseSchema, DeliveryPartnerSchema
from app.services.email_service import send_order_placed_email

router = APIRouter(prefix="/api/orders", tags=["orders"])


def _serialize_order(order: Order) -> OrderResponse:
    items = [
        OrderItemResponse(
            product_id=oi.product_id,
            product_name=oi.product.name if oi.product else "Product",
            quantity=oi.quantity,
            price_at_purchase=oi.price_at_purchase,
            product_image=oi.product.image_url if oi.product else None,
        )
        for oi in order.items
    ]
    
    warehouse_data = None
    if order.warehouse:
        warehouse_data = WarehouseSchema(
            id=order.warehouse.id,
            name=order.warehouse.name,
            location=order.warehouse.location
        )
        
    partner_data = None
    if order.delivery_partner:
        partner_data = DeliveryPartnerSchema(
            id=order.delivery_partner.id,
            name=order.delivery_partner.name,
            phone=order.delivery_partner.phone,
            vehicle_number=order.delivery_partner.vehicle_number,
            status=order.delivery_partner.status
        )

    return OrderResponse(
        id=order.id,
        status=order.status.value,
        total_amount=order.total_amount,
        shipping_address=order.shipping_address,
        payment_method=order.payment_method,
        tracking_number=order.tracking_number,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=items,
        warehouse_id=order.warehouse_id,
        delivery_partner_id=order.delivery_partner_id,
        dispatch_otp=order.dispatch_otp,
        delivery_otp=order.delivery_otp,
        dispatch_verified=order.dispatch_verified,
        delivery_verified=order.delivery_verified,
        warehouse=warehouse_data,
        delivery_partner=partner_data,
        user_name=order.user.full_name if order.user else "Customer",
        user_email=order.user.email if order.user else "",
        user_phone=order.user.phone if order.user else "",
    )


def _generate_tracking() -> str:
    suffix = "".join(random.choices(string.digits, k=10))
    return f"OYE{suffix}"


@router.post("/checkout", response_model=OrderResponse)
def checkout(
    payload: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cart_items = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.user_id == current_user.id)
        .all()
    )
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = 0.0
    for item in cart_items:
        if item.product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {item.product.name}",
            )
        total += item.product.price * item.quantity

    if payload.payment_method == "wallet":
        wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
        if not wallet or wallet.points < total:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient wallet balance. You have {wallet.points if wallet else 0} points, but the total is ₹{total:.2f}."
            )
        wallet.points -= int(total)

    order = Order(
        user_id=current_user.id,
        status=OrderStatus.pending,
        total_amount=total,
        shipping_address=payload.shipping_address,
        payment_method=payload.payment_method,
        tracking_number=_generate_tracking(),
    )
    db.add(order)
    db.flush()

    for item in cart_items:
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price_at_purchase=item.product.price,
            )
        )
        item.product.stock_quantity -= item.quantity
        db.delete(item)

    db.commit()
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order.id)
        .first()
    )
    try:
        send_order_placed_email(order, current_user.email)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to send checkout email: {e}")
    return _serialize_order(order)


@router.get("/my", response_model=List[OrderResponse])
def my_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return [_serialize_order(o) for o in orders]


@router.get("/track/{tracking_number}", response_model=OrderResponse)
def track_order(
    tracking_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.tracking_number == tracking_number, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _serialize_order(order)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _serialize_order(order)
