from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_district_hub
from app.models.farmer import (
    CropListing,
    FarmerProfile,
    ListingStatus,
    QualityGrade,
)
from app.models.user import User
from app.schemas.farmer import (
    CropListingResponse,
    HubDashboardSummary,
    HubGradeListing,
    HubScheduleInspection,
)

router = APIRouter(prefix="/api/hub", tags=["district-hub"])


def _listing_response(listing: CropListing, farmer: FarmerProfile | None, user: User | None) -> CropListingResponse:
    return CropListingResponse(
        id=listing.id,
        farmer_id=listing.farmer_id,
        crop_id=listing.crop_id,
        crop_name=listing.crop_name,
        quantity_kg=listing.quantity_kg,
        price_per_kg=listing.price_per_kg,
        msp_per_kg=listing.msp_per_kg,
        quality_grade=listing.quality_grade.value,
        status=listing.status.value,
        notes=listing.notes,
        inspection_scheduled_at=listing.inspection_scheduled_at,
        inspection_notes=listing.inspection_notes,
        hub_graded_by_id=listing.hub_graded_by_id,
        farmer_name=user.full_name if user else "",
        farmer_code=farmer.farmer_code if farmer else "",
        created_at=listing.created_at,
        updated_at=listing.updated_at,
    )


@router.get("/dashboard", response_model=HubDashboardSummary)
def hub_dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_district_hub),
):
    now = datetime.utcnow()
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = start_of_day + timedelta(days=1)
    week_start = start_of_day - timedelta(days=7)

    pending = (
        db.query(func.count(CropListing.id))
        .filter(CropListing.status.in_([ListingStatus.submitted, ListingStatus.quality_check]))
        .scalar()
        or 0
    )
    scheduled_today = (
        db.query(func.count(CropListing.id))
        .filter(
            CropListing.inspection_scheduled_at >= start_of_day,
            CropListing.inspection_scheduled_at < end_of_day,
        )
        .scalar()
        or 0
    )
    approved_week = (
        db.query(func.count(CropListing.id))
        .filter(CropListing.status == ListingStatus.approved, CropListing.updated_at >= week_start)
        .scalar()
        or 0
    )
    rejected_week = (
        db.query(func.count(CropListing.id))
        .filter(CropListing.status == ListingStatus.rejected, CropListing.updated_at >= week_start)
        .scalar()
        or 0
    )

    return HubDashboardSummary(
        pending_inspections=pending,
        scheduled_today=scheduled_today,
        approved_this_week=approved_week,
        rejected_this_week=rejected_week,
    )


@router.get("/inspections", response_model=List[CropListingResponse])
def list_inspections(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_district_hub),
):
    q = db.query(CropListing).order_by(CropListing.created_at.desc())
    if status:
        try:
            q = q.filter(CropListing.status == ListingStatus(status))
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")
    else:
        q = q.filter(
            CropListing.status.in_(
                [ListingStatus.submitted, ListingStatus.quality_check, ListingStatus.approved, ListingStatus.rejected]
            )
        )

    listings = q.all()
    result = []
    for listing in listings:
        farmer = db.query(FarmerProfile).filter(FarmerProfile.id == listing.farmer_id).first()
        user = None
        if farmer:
            user = db.query(User).filter(User.id == farmer.user_id).first()
        result.append(_listing_response(listing, farmer, user))
    return result


@router.post("/inspections/{listing_id}/schedule", response_model=CropListingResponse)
def schedule_inspection(
    listing_id: int,
    payload: HubScheduleInspection,
    db: Session = Depends(get_db),
    hub_user: User = Depends(get_current_district_hub),
):
    listing = db.query(CropListing).filter(CropListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.status not in (ListingStatus.submitted, ListingStatus.quality_check):
        raise HTTPException(status_code=400, detail="Listing is not awaiting inspection")

    listing.inspection_scheduled_at = payload.scheduled_at
    listing.inspection_notes = payload.inspection_notes
    listing.status = ListingStatus.quality_check
    listing.hub_graded_by_id = hub_user.id
    db.commit()
    db.refresh(listing)

    farmer = db.query(FarmerProfile).filter(FarmerProfile.id == listing.farmer_id).first()
    user = db.query(User).filter(User.id == farmer.user_id).first() if farmer else None
    return _listing_response(listing, farmer, user)


@router.patch("/inspections/{listing_id}/grade", response_model=CropListingResponse)
def grade_listing(
    listing_id: int,
    payload: HubGradeListing,
    db: Session = Depends(get_db),
    hub_user: User = Depends(get_current_district_hub),
):
    listing = db.query(CropListing).filter(CropListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    try:
        grade = QualityGrade(payload.quality_grade)
        new_status = ListingStatus(payload.status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid grade or status")

    if grade == QualityGrade.pending:
        raise HTTPException(status_code=400, detail="Select grade A, B, C, or rejected")
    if new_status not in (ListingStatus.approved, ListingStatus.rejected):
        raise HTTPException(status_code=400, detail="Status must be approved or rejected")
    if new_status == ListingStatus.approved and grade == QualityGrade.rejected:
        raise HTTPException(status_code=400, detail="Cannot approve with rejected grade")
    if new_status == ListingStatus.rejected and grade in (QualityGrade.grade_a, QualityGrade.grade_b, QualityGrade.grade_c):
        grade = QualityGrade.rejected

    listing.quality_grade = grade
    listing.status = new_status
    listing.inspection_notes = payload.inspection_notes or listing.inspection_notes
    listing.hub_graded_by_id = hub_user.id
    db.commit()
    db.refresh(listing)

    farmer = db.query(FarmerProfile).filter(FarmerProfile.id == listing.farmer_id).first()
    user = db.query(User).filter(User.id == farmer.user_id).first() if farmer else None
    return _listing_response(listing, farmer, user)


@router.get("/inspections/{listing_id}", response_model=CropListingResponse)
def get_inspection(
    listing_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_district_hub),
):
    listing = db.query(CropListing).filter(CropListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    farmer = db.query(FarmerProfile).filter(FarmerProfile.id == listing.farmer_id).first()
    user = db.query(User).filter(User.id == farmer.user_id).first() if farmer else None
    return _listing_response(listing, farmer, user)
