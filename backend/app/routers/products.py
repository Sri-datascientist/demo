from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_admin
from app.models.customer import ProductReview
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductResponse, ProductReviewResponse, ProductUpdate

router = APIRouter(prefix="/api/products", tags=["products"])


def _enrich_product(db: Session, product: Product) -> ProductResponse:
    reviews = db.query(ProductReview).filter(ProductReview.product_id == product.id).all()
    avg = None
    if reviews:
        avg = sum(r.rating for r in reviews) / len(reviews)
    data = ProductResponse.model_validate(product)
    data.average_rating = avg
    data.review_count = len(reviews)
    return data


@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    rows = db.query(Product.category).filter(Product.is_active == True).distinct().all()
    return [r[0] for r in rows if r[0]]


@router.get("", response_model=List[ProductResponse])
def list_products(
    active_only: bool = True,
    category: Optional[str] = None,
    search: Optional[str] = None,
    offers_only: bool = False,
    product_type: Optional[str] = Query(None, description="Filter by 'inhouse' or 'farmer'"),
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if active_only:
        query = query.filter(Product.is_active == True)
    if category:
        query = query.filter(Product.category == category)
    if search:
        term = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(term)) | (Product.description.ilike(term)) | (Product.category.ilike(term))
        )
    if offers_only:
        query = query.filter(Product.offer_percent > 0)
    if product_type:
        if product_type == "inhouse":
            query = query.filter(
                Product.farmer_profile_id == None,
                (Product.farmer_name == "") | (Product.farmer_name.ilike("oyedesi%"))
            )
        elif product_type == "farmer":
            query = query.filter(
                (Product.farmer_profile_id != None) |
                ((Product.farmer_name != "") & (~Product.farmer_name.ilike("oyedesi%")))
            )
    products = query.order_by(Product.name).all()
    return [_enrich_product(db, p) for p in products]


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return _enrich_product(db, product)


@router.get("/{product_id}/reviews", response_model=List[ProductReviewResponse])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(ProductReview)
        .filter(ProductReview.product_id == product_id)
        .order_by(ProductReview.created_at.desc())
        .all()
    )
    result = []
    for r in reviews:
        from app.models.user import User as UserModel

        user = db.query(UserModel).filter(UserModel.id == r.user_id).first()
        result.append(
            ProductReviewResponse(
                id=r.id,
                product_id=r.product_id,
                user_id=r.user_id,
                user_name=user.full_name if user else "Customer",
                rating=r.rating,
                comment=r.comment,
                created_at=r.created_at,
            )
        )
    return result


@router.post("", response_model=ProductResponse)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return _enrich_product(db, product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return _enrich_product(db, product)


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"ok": True}
