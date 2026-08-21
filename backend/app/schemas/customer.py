from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class AddressCreate(BaseModel):
    label: str = "Home"
    line1: str
    line2: str = ""
    city: str
    state: str = ""
    pincode: str
    is_default: bool = False


class AddressUpdate(BaseModel):
    label: Optional[str] = None
    line1: Optional[str] = None
    line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    is_default: Optional[bool] = None


class AddressResponse(BaseModel):
    id: int
    user_id: int
    label: str
    line1: str
    line2: str
    city: str
    state: str
    pincode: str
    is_default: bool
    created_at: datetime

    class Config:
        from_attributes = True


class WalletResponse(BaseModel):
    id: int
    user_id: int
    points: int
    loyalty_tier: str
    created_at: datetime

    class Config:
        from_attributes = True


class SupportTicketCreate(BaseModel):
    category: str = "general"
    subject: str
    description: str = ""


class SupportTicketResponse(BaseModel):
    id: int
    user_id: int
    category: str
    subject: str
    description: str
    status: str
    admin_response: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
