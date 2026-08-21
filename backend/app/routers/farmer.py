import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_farmer, get_current_user
from app.models.advisory import Advisory, AdvisoryType
from app.models.farmer import (
    Crop,
    CropListing,
    FarmingStage,
    FarmerProfile,
    KycStatus,
    Land,
    ListingStatus,
    SoilHealthReport,
    SoilReportStatus,
)
from app.models.finance import Payment, PaymentStatus, PaymentType
from app.models.user import User
from app.schemas.advisory import AdvisoryResponse, PaymentResponse
from app.schemas.customer import SupportTicketCreate, SupportTicketResponse
from app.schemas.farmer import (
    CropCreate,
    CropListingCreate,
    CropListingResponse,
    CropListingUpdate,
    CropResponse,
    CropUpdate,
    FarmerDashboardSummary,
    FarmerProfileResponse,
    FarmerProfileUpdate,
    KycCompleteRequest,
    KycInitiateRequest,
    KycStatusResponse,
    LandCreate,
    LandResponse,
    LandUpdate,
    SoilHealthReportCreate,
    SoilHealthReportResponse,
)
from app.serializers.farmer import crop_listing_response, farmer_profile_response
from app.services.kyc_service import (
    complete_digilocker_verification,
    initiate_digilocker_session,
    normalize_aadhaar,
)

router = APIRouter(prefix="/api/farmer", tags=["farmer"])


def _serialize_ticket(ticket) -> SupportTicketResponse:
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


def _profile_response(profile: FarmerProfile, user: User) -> FarmerProfileResponse:
    return farmer_profile_response(profile, user)


def _listing_response(listing: CropListing, profile: FarmerProfile | None = None, user: User | None = None) -> CropListingResponse:
    return crop_listing_response(listing, profile, user)


@router.get("/dashboard", response_model=FarmerDashboardSummary)
def farmer_dashboard(
    db: Session = Depends(get_db),
    profile: FarmerProfile = Depends(get_current_farmer),
):
    total_land = (
        db.query(func.coalesce(func.sum(Land.area_acres), 0))
        .filter(Land.farmer_id == profile.id)
        .scalar()
        or 0.0
    )
    active_crops = (
        db.query(func.count(Crop.id))
        .filter(Crop.farmer_id == profile.id, Crop.farming_stage != FarmingStage.sold)
        .scalar()
        or 0
    )
    advisory_alerts = (
        db.query(func.count(Advisory.id))
        .filter(Advisory.farmer_id == profile.id, Advisory.is_read == False)
        .scalar()
        or 0
    )
    selling_pending = (
        db.query(func.count(CropListing.id))
        .filter(
            CropListing.farmer_id == profile.id,
            CropListing.status.in_([ListingStatus.submitted, ListingStatus.quality_check]),
        )
        .scalar()
        or 0
    )
    payments_pending = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(
            Payment.farmer_id == profile.id,
            Payment.status == PaymentStatus.pending,
        )
        .scalar()
        or 0.0
    )

    return FarmerDashboardSummary(
        total_land_acres=float(total_land),
        active_crops=active_crops,
        advisory_alerts=advisory_alerts,
        crop_selling_pending=selling_pending,
        payments_pending=float(payments_pending),
        verification_status=profile.verification_status.value,
        kyc_status=profile.kyc_status.value,
    )


@router.get("/profile", response_model=FarmerProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    profile: FarmerProfile = Depends(get_current_farmer),
    current_user: User = Depends(get_current_user),
):
    return _profile_response(profile, current_user)


@router.patch("/profile", response_model=FarmerProfileResponse)
def update_profile(
    payload: FarmerProfileUpdate,
    db: Session = Depends(get_db),
    profile: FarmerProfile = Depends(get_current_farmer),
    current_user: User = Depends(get_current_user),
):
    if payload.address is not None:
        profile.address = payload.address
    if payload.documents_json is not None:
        profile.documents_json = payload.documents_json
    db.commit()
    db.refresh(profile)
    return _profile_response(profile, current_user)


@router.get("/lands", response_model=List[LandResponse])
def list_lands(profile: FarmerProfile = Depends(get_current_farmer), db: Session = Depends(get_db)):
    return db.query(Land).filter(Land.farmer_id == profile.id).order_by(Land.created_at.desc()).all()


@router.post("/lands", response_model=LandResponse)
def create_land(
    payload: LandCreate,
    profile: FarmerProfile = Depends(get_current_farmer),
    db: Session = Depends(get_db),
):
    land = Land(farmer_id=profile.id, **payload.model_dump())
    db.add(land)
    db.commit()
    db.refresh(land)
    return land


@router.put("/lands/{land_id}", response_model=LandResponse)
def update_land(
    land_id: int,
    payload: LandUpdate,
    profile: FarmerProfile = Depends(get_current_farmer),
    db: Session = Depends(get_db),
):
    land = db.query(Land).filter(Land.id == land_id, Land.farmer_id == profile.id).first()
    if not land:
        raise HTTPException(status_code=404, detail="Land not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(land, key, value)
    db.commit()
    db.refresh(land)
    return land


@router.delete("/lands/{land_id}")
def delete_land(
    land_id: int,
    profile: FarmerProfile = Depends(get_current_farmer),
    db: Session = Depends(get_db),
):
    land = db.query(Land).filter(Land.id == land_id, Land.farmer_id == profile.id).first()
    if not land:
        raise HTTPException(status_code=404, detail="Land not found")
    db.delete(land)
    db.commit()
    return {"ok": True}


@router.get("/crops", response_model=List[CropResponse])
def list_crops(profile: FarmerProfile = Depends(get_current_farmer), db: Session = Depends(get_db)):
    return db.query(Crop).filter(Crop.farmer_id == profile.id).order_by(Crop.created_at.desc()).all()


@router.post("/crops", response_model=CropResponse)
def create_crop(
    payload: CropCreate,
    profile: FarmerProfile = Depends(get_current_farmer),
    db: Session = Depends(get_db),
):
    data = payload.model_dump()
    try:
        data["farming_stage"] = FarmingStage(data["farming_stage"])
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid farming stage")
    crop = Crop(farmer_id=profile.id, **data)
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop


@router.put("/crops/{crop_id}", response_model=CropResponse)
def update_crop(
    crop_id: int,
    payload: CropUpdate,
    profile: FarmerProfile = Depends(get_current_farmer),
    db: Session = Depends(get_db),
):
    crop = db.query(Crop).filter(Crop.id == crop_id, Crop.farmer_id == profile.id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    data = payload.model_dump(exclude_unset=True)
    if "farming_stage" in data:
        try:
            data["farming_stage"] = FarmingStage(data["farming_stage"])
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid farming stage")
    for key, value in data.items():
        setattr(crop, key, value)
    db.commit()
    db.refresh(crop)
    return crop


@router.delete("/crops/{crop_id}")
def delete_crop(
    crop_id: int,
    profile: FarmerProfile = Depends(get_current_farmer),
    db: Session = Depends(get_db),
):
    crop = db.query(Crop).filter(Crop.id == crop_id, Crop.farmer_id == profile.id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    db.delete(crop)
    db.commit()
    return {"ok": True}


@router.get("/listings", response_model=List[CropListingResponse])
def list_listings(
    profile: FarmerProfile = Depends(get_current_farmer),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listings = (
        db.query(CropListing)
        .filter(CropListing.farmer_id == profile.id)
        .order_by(CropListing.created_at.desc())
        .all()
    )
    return [_listing_response(l, profile, current_user) for l in listings]


@router.post("/listings", response_model=CropListingResponse)
def create_listing(
    payload: CropListingCreate,
    profile: FarmerProfile = Depends(get_current_farmer),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = CropListing(
        farmer_id=profile.id,
        crop_id=payload.crop_id,
        crop_name=payload.crop_name,
        quantity_kg=payload.quantity_kg,
        price_per_kg=payload.price_per_kg,
        msp_per_kg=payload.msp_per_kg,
        notes=payload.notes,
        status=ListingStatus.draft,
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return _listing_response(listing, profile, current_user)


@router.post("/listings/{listing_id}/submit", response_model=CropListingResponse)
def submit_listing(
    listing_id: int,
    profile: FarmerProfile = Depends(get_current_farmer),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if profile.kyc_status != KycStatus.verified:
        raise HTTPException(
            status_code=400,
            detail="Complete Aadhaar KYC verification before submitting crops for sale",
        )
    listing = db.query(CropListing).filter(CropListing.id == listing_id, CropListing.farmer_id == profile.id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing.status = ListingStatus.submitted
    db.commit()
    db.refresh(listing)
    return _listing_response(listing, profile, current_user)


@router.put("/listings/{listing_id}", response_model=CropListingResponse)
def update_listing(
    listing_id: int,
    payload: CropListingUpdate,
    profile: FarmerProfile = Depends(get_current_farmer),
    db: Session = Depends(get_db),
):
    listing = db.query(CropListing).filter(CropListing.id == listing_id, CropListing.farmer_id == profile.id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    data = payload.model_dump(exclude_unset=True)
    if "status" in data:
        try:
            data["status"] = ListingStatus(data["status"])
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status")
    for key, value in data.items():
        setattr(listing, key, value)
    db.commit()
    db.refresh(listing)
    user = db.query(User).filter(User.id == profile.user_id).first()
    return _listing_response(listing, profile, user)


@router.get("/kyc", response_model=KycStatusResponse)
def get_kyc_status(profile: FarmerProfile = Depends(get_current_farmer)):
    return KycStatusResponse(
        kyc_status=profile.kyc_status.value,
        aadhaar_masked=profile.aadhaar_masked,
        kyc_provider=profile.kyc_provider,
        kyc_reference=profile.kyc_reference,
        kyc_verified_at=profile.kyc_verified_at,
        verification_status=profile.verification_status.value,
    )


@router.post("/kyc/initiate")
def initiate_kyc(
    payload: KycInitiateRequest,
    profile: FarmerProfile = Depends(get_current_farmer),
    db: Session = Depends(get_db),
):
    if profile.kyc_status == KycStatus.verified:
        raise HTTPException(status_code=400, detail="KYC already verified")

    aadhaar = normalize_aadhaar(payload.aadhaar_number)
    profile.kyc_status = KycStatus.in_progress
    db.commit()

    session = initiate_digilocker_session(aadhaar)
    return {
        "session_id": session["session_id"],
        "provider": session["provider"],
        "redirect_url": session["redirect_url"],
        "auto_verify": session["auto_verify"],
        "aadhaar_masked": f"XXXX-XXXX-{aadhaar[-4:]}" if len(aadhaar) == 12 else "",
    }


@router.post("/kyc/complete", response_model=KycStatusResponse)
def complete_kyc(
    payload: KycCompleteRequest,
    profile: FarmerProfile = Depends(get_current_farmer),
    db: Session = Depends(get_db),
):
    try:
        complete_digilocker_verification(db, profile, payload.aadhaar_number, payload.session_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return KycStatusResponse(
        kyc_status=profile.kyc_status.value,
        aadhaar_masked=profile.aadhaar_masked,
        kyc_provider=profile.kyc_provider,
        kyc_reference=profile.kyc_reference,
        kyc_verified_at=profile.kyc_verified_at,
        verification_status=profile.verification_status.value,
    )


@router.get("/soil-reports", response_model=List[SoilHealthReportResponse])
def list_soil_reports(profile: FarmerProfile = Depends(get_current_farmer), db: Session = Depends(get_db)):
    reports = (
        db.query(SoilHealthReport)
        .filter(SoilHealthReport.farmer_id == profile.id)
        .order_by(SoilHealthReport.created_at.desc())
        .all()
    )
    return [
        SoilHealthReportResponse(
            id=r.id,
            farmer_id=r.farmer_id,
            land_id=r.land_id,
            report_name=r.report_name,
            notes=r.notes,
            file_url=r.file_url,
            status=r.status.value,
            created_at=r.created_at,
        )
        for r in reports
    ]


@router.post("/soil-reports", response_model=SoilHealthReportResponse)
def create_soil_report(
    payload: SoilHealthReportCreate,
    profile: FarmerProfile = Depends(get_current_farmer),
    db: Session = Depends(get_db),
):
    if payload.land_id is not None:
        land = db.query(Land).filter(Land.id == payload.land_id, Land.farmer_id == profile.id).first()
        if not land:
            raise HTTPException(status_code=404, detail="Land not found")

    report = SoilHealthReport(
        farmer_id=profile.id,
        land_id=payload.land_id,
        report_name=payload.report_name,
        notes=payload.notes,
        status=SoilReportStatus.submitted,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return SoilHealthReportResponse(
        id=report.id,
        farmer_id=report.farmer_id,
        land_id=report.land_id,
        report_name=report.report_name,
        notes=report.notes,
        file_url=report.file_url,
        status=report.status.value,
        created_at=report.created_at,
    )


@router.get("/advisories", response_model=List[AdvisoryResponse])
def list_advisories(profile: FarmerProfile = Depends(get_current_farmer), db: Session = Depends(get_db)):
    general = db.query(Advisory).filter(Advisory.farmer_id.is_(None)).all()
    personal = db.query(Advisory).filter(Advisory.farmer_id == profile.id).all()
    return general + personal


@router.post("/advisories/{advisory_id}/read")
def mark_advisory_read(
    advisory_id: int,
    profile: FarmerProfile = Depends(get_current_farmer),
    db: Session = Depends(get_db),
):
    advisory = db.query(Advisory).filter(
        (Advisory.id == advisory_id) & ((Advisory.farmer_id == profile.id) | (Advisory.farmer_id.is_(None)))
    ).first()
    if not advisory:
        raise HTTPException(status_code=404, detail="Advisory not found")
    advisory.is_read = True
    db.commit()
    return {"ok": True}


@router.get("/payments", response_model=List[PaymentResponse])
def list_payments(profile: FarmerProfile = Depends(get_current_farmer), db: Session = Depends(get_db)):
    return (
        db.query(Payment)
        .filter(Payment.farmer_id == profile.id)
        .order_by(Payment.created_at.desc())
        .all()
    )


@router.post("/support", response_model=SupportTicketResponse)
def create_support_ticket(
    payload: SupportTicketCreate,
    profile: FarmerProfile = Depends(get_current_farmer),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.support import SupportTicket

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
def list_support_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    _: FarmerProfile = Depends(get_current_farmer),
):
    from app.models.support import SupportTicket

    tickets = db.query(SupportTicket).filter(SupportTicket.user_id == current_user.id).all()
    return [_serialize_ticket(t) for t in tickets]
