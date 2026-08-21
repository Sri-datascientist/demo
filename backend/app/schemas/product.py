from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    name: str
    category: str
    description: str = ""
    price: float = Field(gt=0)
    stock_quantity: int = Field(ge=0)
    image_url: str = ""
    is_active: bool = True
    farmer_name: str = ""
    offer_percent: float = Field(default=0.0, ge=0)


class ProductCreate(ProductBase):
    farmer_profile_id: Optional[int] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    stock_quantity: Optional[int] = Field(default=None, ge=0)
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    farmer_name: Optional[str] = None
    offer_percent: Optional[float] = Field(default=None, ge=0)


class ProductResponse(ProductBase):
    id: int
    farmer_profile_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    average_rating: Optional[float] = None
    review_count: Optional[int] = None

    class Config:
        from_attributes = True


class ProductReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = ""


class ProductReviewResponse(BaseModel):
    id: int
    product_id: int
    user_id: int
    user_name: str
    rating: int
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True
