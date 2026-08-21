from app.models.farmer import CropListing, FarmerProfile
from app.models.user import User
from app.schemas.farmer import CropListingResponse, FarmerProfileResponse


def farmer_profile_response(profile: FarmerProfile, user: User | None) -> FarmerProfileResponse:
    return FarmerProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
        farmer_code=profile.farmer_code,
        address=profile.address,
        documents_json=profile.documents_json,
        verification_status=profile.verification_status.value,
        aadhaar_masked=profile.aadhaar_masked,
        kyc_status=profile.kyc_status.value,
        kyc_provider=profile.kyc_provider,
        kyc_reference=profile.kyc_reference,
        kyc_verified_at=profile.kyc_verified_at,
        full_name=user.full_name if user else "",
        email=user.email if user else "",
        phone=user.phone if user else "",
        created_at=profile.created_at,
    )


def crop_listing_response(
    listing: CropListing,
    farmer: FarmerProfile | None = None,
    user: User | None = None,
) -> CropListingResponse:
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
