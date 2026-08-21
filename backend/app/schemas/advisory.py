from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AdvisoryCreate(BaseModel):
    advisory_type: str
    title: str
    content: str
    farmer_id: Optional[int] = None


class AdvisoryResponse(BaseModel):
    id: int
    farmer_id: Optional[int] = None
    advisory_type: str
    title: str
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    farmer_id: Optional[int] = None
    order_id: Optional[int] = None
    amount: float
    status: str
    payment_type: str
    reference: str
    notes: str
    created_at: datetime

    class Config:
        from_attributes = True
