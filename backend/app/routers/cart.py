from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.order import CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import CartItemAdd, CartItemResponse, CartItemUpdate, CartProductResponse

router = APIRouter(prefix="/api/cart", tags=["cart"])


def _serialize_cart_item(item: CartItem) -> CartItemResponse:
    return CartItemResponse(
        product_id=item.product_id,
        quantity=item.quantity,
        product=CartProductResponse.model_validate(item.product),
    )


@router.get("", response_model=List[CartItemResponse])
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.user_id == current_user.id)
        .all()
    )
    return [_serialize_cart_item(i) for i in items]


@router.post("/items", response_model=CartItemResponse)
def add_to_cart(
    payload: CartItemAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == payload.product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock_quantity < payload.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    item = (
        db.query(CartItem)
        .filter(CartItem.user_id == current_user.id, CartItem.product_id == payload.product_id)
        .first()
    )
    if item:
        item.quantity += payload.quantity
        if item.quantity > product.stock_quantity:
            raise HTTPException(status_code=400, detail="Insufficient stock")
    else:
        item = CartItem(user_id=current_user.id, product_id=payload.product_id, quantity=payload.quantity)
        db.add(item)

    db.commit()
    db.refresh(item)
    item = db.query(CartItem).options(joinedload(CartItem.product)).filter(CartItem.id == item.id).first()
    return _serialize_cart_item(item)


@router.put("/items/{product_id}", response_model=CartItemResponse)
def update_cart_item(
    product_id: int,
    payload: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = (
        db.query(CartItem)
        .options(joinedload(CartItem.product))
        .filter(CartItem.user_id == current_user.id, CartItem.product_id == product_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if item.product.stock_quantity < payload.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    item.quantity = payload.quantity
    db.commit()
    db.refresh(item)
    return _serialize_cart_item(item)


@router.delete("/items/{product_id}")
def remove_cart_item(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = (
        db.query(CartItem)
        .filter(CartItem.user_id == current_user.id, CartItem.product_id == product_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
    return {"ok": True}


@router.delete("")
def clear_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    return {"ok": True}
