from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_customer, get_current_user
from app.models.customer import Address, Wallet
from app.models.support import SupportTicket
from app.models.user import User
from app.schemas.customer import (
    AddressCreate,
    AddressResponse,
    AddressUpdate,
    SupportTicketCreate,
    SupportTicketResponse,
    WalletResponse,
)
from app.schemas.product import ProductReviewCreate, ProductReviewResponse
from app.schemas.user import UserResponse, UserUpdate
from app.models.customer import ProductReview

router = APIRouter(prefix="/api/customer", tags=["customer"])


def _serialize_ticket(ticket: SupportTicket) -> SupportTicketResponse:
    return SupportTicketResponse(
        id=ticket.id,
        user_id=ticket.user_id,
        category=ticket.category,
        subject=ticket.subject,
        description=ticket.description,
        status=ticket.status.value,
        admin_response=ticket.admin_response,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
    )


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_customer)):
    return UserResponse.model_validate(current_user)


@router.patch("/profile", response_model=UserResponse)
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_customer),
):
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.phone is not None:
        current_user.phone = payload.phone
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.get("/addresses", response_model=List[AddressResponse])
def list_addresses(current_user: User = Depends(get_current_customer), db: Session = Depends(get_db)):
    return db.query(Address).filter(Address.user_id == current_user.id).order_by(Address.created_at.desc()).all()


@router.post("/addresses", response_model=AddressResponse)
def create_address(
    payload: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_customer),
):
    if payload.is_default:
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})
    address = Address(user_id=current_user.id, **payload.model_dump())
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.put("/addresses/{address_id}", response_model=AddressResponse)
def update_address(
    address_id: int,
    payload: AddressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_customer),
):
    address = db.query(Address).filter(Address.id == address_id, Address.user_id == current_user.id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    if payload.is_default:
        db.query(Address).filter(Address.user_id == current_user.id).update({"is_default": False})
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(address, key, value)
    db.commit()
    db.refresh(address)
    return address


@router.delete("/addresses/{address_id}")
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_customer),
):
    address = db.query(Address).filter(Address.id == address_id, Address.user_id == current_user.id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    db.delete(address)
    db.commit()
    return {"ok": True}


@router.get("/wallet", response_model=WalletResponse)
def get_wallet(db: Session = Depends(get_db), current_user: User = Depends(get_current_customer)):
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        wallet = Wallet(user_id=current_user.id, points=0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return wallet


@router.post("/products/{product_id}/reviews", response_model=ProductReviewResponse)
def create_review(
    product_id: int,
    payload: ProductReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_customer),
):
    review = ProductReview(
        product_id=product_id,
        user_id=current_user.id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return ProductReviewResponse(
        id=review.id,
        product_id=review.product_id,
        user_id=review.user_id,
        user_name=current_user.full_name,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
    )


@router.post("/support", response_model=SupportTicketResponse)
def create_support_ticket(
    payload: SupportTicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = SupportTicket(
        user_id=current_user.id,
        category=payload.category,
        subject=payload.subject,
        description=payload.description,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return _serialize_ticket(ticket)


@router.get("/support", response_model=List[SupportTicketResponse])
def list_support_tickets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tickets = db.query(SupportTicket).filter(SupportTicket.user_id == current_user.id).all()
    return [_serialize_ticket(t) for t in tickets]
