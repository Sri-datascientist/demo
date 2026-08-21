from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1)


class CartProductResponse(BaseModel):
    id: int
    name: str
    category: str
    price: float
    image_url: str
    stock_quantity: int

    class Config:
        from_attributes = True


class CartItemResponse(BaseModel):
    product_id: int
    quantity: int
    product: CartProductResponse

    class Config:
        from_attributes = True


class CheckoutRequest(BaseModel):
    shipping_address: str = Field(min_length=10)
    payment_method: str = "cod"


class OrderItemResponse(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    price_at_purchase: float
    product_image: Optional[str] = None

    class Config:
        from_attributes = True


class WarehouseSchema(BaseModel):
    id: int
    name: str
    location: str

    class Config:
        from_attributes = True


class DeliveryPartnerSchema(BaseModel):
    id: int
    name: str
    phone: str
    vehicle_number: str
    status: str

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    status: str
    total_amount: float
    shipping_address: str
    payment_method: str
    tracking_number: str
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
    warehouse_id: Optional[int] = None
    delivery_partner_id: Optional[int] = None
    dispatch_otp: Optional[str] = None
    delivery_otp: Optional[str] = None
    dispatch_verified: Optional[bool] = False
    delivery_verified: Optional[bool] = False
    warehouse: Optional[WarehouseSchema] = None
    delivery_partner: Optional[DeliveryPartnerSchema] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_phone: Optional[str] = None

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str
    tracking_number: Optional[str] = None
