from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import create_access_token, get_current_user, hash_password, verify_password
from app.models.customer import Wallet
from app.models.farmer import FarmerProfile
from app.models.user import User, UserRole
from app.schemas.user import (
    OtpSendRequest,
    OtpVerifyRequest,
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
    UserUpdate,
)
from app.services.otp_service import create_otp, verify_otp

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _build_token_response(user: User, otp_code: str | None = None) -> TokenResponse:
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
        otp_code=otp_code,
    )


def _validate_account_type(user: User, account_type: str | None) -> None:
    if not account_type or user.role in (UserRole.admin, UserRole.district_hub):
        return
    if account_type == "farmer" and user.role != UserRole.farmer:
        raise HTTPException(status_code=401, detail="This account is not a farmer account")
    if account_type == "customer" and user.role != UserRole.customer:
        raise HTTPException(status_code=401, detail="This account is not a customer account")
    if account_type == "district_hub" and user.role != UserRole.district_hub:
        raise HTTPException(status_code=401, detail="This account is not a district hub account")


def _create_farmer_profile(db: Session, user: User) -> FarmerProfile:
    profile = FarmerProfile(
        user_id=user.id,
        farmer_code=f"OYD-FARM-{user.id:05d}",
    )
    db.add(profile)
    db.flush()
    return profile


@router.post("/register", response_model=TokenResponse)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    role = UserRole.customer
    if payload.role == "farmer":
        role = UserRole.farmer
    elif payload.role == "admin":
        raise HTTPException(status_code=400, detail="Admin accounts cannot be self-registered")

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        phone=payload.phone or "",
        password_hash=hash_password(payload.password),
        role=role,
        is_verified=False,
    )
    db.add(user)
    db.flush()

    if role == UserRole.farmer:
        _create_farmer_profile(db, user)
    elif role == UserRole.customer:
        db.add(Wallet(user_id=user.id, points=100))

    db.commit()
    db.refresh(user)

    otp_code = None
    if role == UserRole.farmer:
        otp_code = create_otp(db, user.email, "verify")
        if not settings.otp_dev_mode:
            otp_code = None

    return _build_token_response(user, otp_code)


@router.post("/login/json", response_model=TokenResponse)
def login_json(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    _validate_account_type(user, payload.account_type)

    return _build_token_response(user)


@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    return _build_token_response(user)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
def update_me(payload: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone is not None:
        current_user.phone = payload.phone
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.post("/otp/send")
def send_otp(payload: OtpSendRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    code = create_otp(db, payload.email, payload.purpose)
    response = {"message": "OTP sent successfully"}
    if settings.otp_dev_mode:
        response["otp_code"] = code
    return response


@router.post("/otp/verify")
def verify_otp_endpoint(payload: OtpVerifyRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_otp(db, payload.email, payload.code, payload.purpose):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user.is_verified = True
    db.commit()
    return {"message": "OTP verified successfully", "is_verified": True}
