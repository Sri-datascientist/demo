from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class FarmerProfileResponse(BaseModel):
    id: int
    user_id: int
    farmer_code: str
    address: str
    documents_json: str
    verification_status: str
    aadhaar_masked: str = ""
    kyc_status: str = "not_started"
    kyc_provider: str = ""
    kyc_reference: str = ""
    kyc_verified_at: Optional[datetime] = None
    full_name: str = ""
    email: str = ""
    phone: str = ""
    created_at: datetime

    class Config:
        from_attributes = True


class FarmerProfileUpdate(BaseModel):
    address: Optional[str] = None
    documents_json: Optional[str] = None


class FarmerDashboardSummary(BaseModel):
    total_land_acres: float
    active_crops: int
    advisory_alerts: int
    crop_selling_pending: int
    payments_pending: float
    verification_status: str
    kyc_status: str = "not_started"


class LandCreate(BaseModel):
    name: str
    area_acres: float = Field(gt=0)
    location_text: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    soil_type: str = ""
    soil_ph: Optional[float] = None
    soil_moisture: str = ""
    notes: str = ""


class LandUpdate(BaseModel):
    name: Optional[str] = None
    area_acres: Optional[float] = Field(default=None, gt=0)
    location_text: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    soil_type: Optional[str] = None
    soil_ph: Optional[float] = None
    soil_moisture: Optional[str] = None
    notes: Optional[str] = None


class LandResponse(BaseModel):
    id: int
    farmer_id: int
    name: str
    area_acres: float
    location_text: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    soil_type: str
    soil_ph: Optional[float] = None
    soil_moisture: str
    notes: str
    created_at: datetime

    class Config:
        from_attributes = True


class CropCreate(BaseModel):
    land_id: Optional[int] = None
    name: str
    variety: str = ""
    farming_stage: str = "planning"
    expected_yield_kg: float = 0
    planted_at: Optional[datetime] = None
    harvest_expected_at: Optional[datetime] = None
    notes: str = ""


class CropUpdate(BaseModel):
    land_id: Optional[int] = None
    name: Optional[str] = None
    variety: Optional[str] = None
    farming_stage: Optional[str] = None
    expected_yield_kg: Optional[float] = None
    planted_at: Optional[datetime] = None
    harvest_expected_at: Optional[datetime] = None
    notes: Optional[str] = None


class CropResponse(BaseModel):
    id: int
    farmer_id: int
    land_id: Optional[int] = None
    name: str
    variety: str
    farming_stage: str
    expected_yield_kg: float
    planted_at: Optional[datetime] = None
    harvest_expected_at: Optional[datetime] = None
    notes: str
    created_at: datetime

    class Config:
        from_attributes = True


class CropListingCreate(BaseModel):
    crop_id: Optional[int] = None
    crop_name: str
    quantity_kg: float = Field(gt=0)
    price_per_kg: float = Field(gt=0)
    msp_per_kg: float = 0
    notes: str = ""


class CropListingUpdate(BaseModel):
    quantity_kg: Optional[float] = Field(default=None, gt=0)
    price_per_kg: Optional[float] = Field(default=None, gt=0)
    msp_per_kg: Optional[float] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class CropListingResponse(BaseModel):
    id: int
    farmer_id: int
    crop_id: Optional[int] = None
    crop_name: str
    quantity_kg: float
    price_per_kg: float
    msp_per_kg: float
    quality_grade: str
    status: str
    notes: str
    inspection_scheduled_at: Optional[datetime] = None
    inspection_notes: str = ""
    hub_graded_by_id: Optional[int] = None
    farmer_name: str = ""
    farmer_code: str = ""
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class KycInitiateRequest(BaseModel):
    aadhaar_number: str


class KycCompleteRequest(BaseModel):
    aadhaar_number: str
    session_id: str


class KycStatusResponse(BaseModel):
    kyc_status: str
    aadhaar_masked: str
    kyc_provider: str
    kyc_reference: str
    kyc_verified_at: Optional[datetime] = None
    verification_status: str


class SoilHealthReportCreate(BaseModel):
    report_name: str
    land_id: Optional[int] = None
    notes: str = ""


class SoilHealthReportResponse(BaseModel):
    id: int
    farmer_id: int
    land_id: Optional[int] = None
    report_name: str
    notes: str
    file_url: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class HubDashboardSummary(BaseModel):
    pending_inspections: int
    scheduled_today: int
    approved_this_week: int
    rejected_this_week: int


class HubScheduleInspection(BaseModel):
    scheduled_at: datetime
    inspection_notes: str = ""


class HubGradeListing(BaseModel):
    quality_grade: str
    status: str
    inspection_notes: str = ""


class AdminSoilHealthReportResponse(SoilHealthReportResponse):
    farmer_name: str = ""
    farmer_code: str = ""
    land_name: str = ""


class AdminLandResponse(LandResponse):
    farmer_name: str = ""
    farmer_code: str = ""


class AdminCropResponse(CropResponse):
    farmer_name: str = ""
    farmer_code: str = ""
    land_name: str = ""
