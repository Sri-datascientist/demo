from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    full_name: str


class UserRegister(UserBase):
    password: str = Field(min_length=6)
    phone: str = ""
    role: str = "customer"


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    account_type: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


class AdminFarmerUpdate(BaseModel):
    address: Optional[str] = None
    documents_json: Optional[str] = None


class UserResponse(UserBase):
    id: int
    phone: str = ""
    role: str
    is_verified: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    otp_code: Optional[str] = None


class OtpSendRequest(BaseModel):
    email: EmailStr
    purpose: str = "verify"


class OtpVerifyRequest(BaseModel):
    email: EmailStr
    code: str
    purpose: str = "verify"
