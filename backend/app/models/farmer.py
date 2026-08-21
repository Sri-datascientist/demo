import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class VerificationStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"


class FarmingStage(str, enum.Enum):
    planning = "planning"
    sowing = "sowing"
    growing = "growing"
    harvesting = "harvesting"
    sold = "sold"


class ListingStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    quality_check = "quality_check"
    approved = "approved"
    rejected = "rejected"
    sold = "sold"


class QualityGrade(str, enum.Enum):
    pending = "pending"
    grade_a = "A"
    grade_b = "B"
    grade_c = "C"
    rejected = "rejected"


class KycStatus(str, enum.Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    verified = "verified"
    failed = "failed"


class SoilReportStatus(str, enum.Enum):
    submitted = "submitted"
    processing = "processing"
    completed = "completed"


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False, index=True)
    farmer_code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    address: Mapped[str] = mapped_column(Text, default="")
    documents_json: Mapped[str] = mapped_column(Text, default="[]")
    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus), default=VerificationStatus.pending, nullable=False
    )
    aadhaar_masked: Mapped[str] = mapped_column(String(20), default="")
    kyc_status: Mapped[KycStatus] = mapped_column(Enum(KycStatus), default=KycStatus.not_started, nullable=False)
    kyc_provider: Mapped[str] = mapped_column(String(50), default="")
    kyc_reference: Mapped[str] = mapped_column(String(100), default="")
    kyc_verified_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="farmer_profile")
    lands = relationship("Land", back_populates="farmer", cascade="all, delete-orphan")
    crops = relationship("Crop", back_populates="farmer", cascade="all, delete-orphan")
    listings = relationship("CropListing", back_populates="farmer", cascade="all, delete-orphan")
    advisories = relationship("Advisory", back_populates="farmer", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="farmer", cascade="all, delete-orphan")
    soil_reports = relationship("SoilHealthReport", back_populates="farmer", cascade="all, delete-orphan")


class Land(Base):
    __tablename__ = "lands"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    farmer_id: Mapped[int] = mapped_column(ForeignKey("farmer_profiles.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    area_acres: Mapped[float] = mapped_column(Float, nullable=False)
    location_text: Mapped[str] = mapped_column(String(500), default="")
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    soil_type: Mapped[str] = mapped_column(String(100), default="")
    soil_ph: Mapped[float | None] = mapped_column(Float, nullable=True)
    soil_moisture: Mapped[str] = mapped_column(String(50), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    farmer = relationship("FarmerProfile", back_populates="lands")
    crops = relationship("Crop", back_populates="land")


class Crop(Base):
    __tablename__ = "crops"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    farmer_id: Mapped[int] = mapped_column(ForeignKey("farmer_profiles.id"), nullable=False, index=True)
    land_id: Mapped[int | None] = mapped_column(ForeignKey("lands.id"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    variety: Mapped[str] = mapped_column(String(255), default="")
    farming_stage: Mapped[FarmingStage] = mapped_column(Enum(FarmingStage), default=FarmingStage.planning)
    expected_yield_kg: Mapped[float] = mapped_column(Float, default=0.0)
    planted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    harvest_expected_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    farmer = relationship("FarmerProfile", back_populates="crops")
    land = relationship("Land", back_populates="crops")
    listings = relationship("CropListing", back_populates="crop")


class CropListing(Base):
    __tablename__ = "crop_listings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    farmer_id: Mapped[int] = mapped_column(ForeignKey("farmer_profiles.id"), nullable=False, index=True)
    crop_id: Mapped[int | None] = mapped_column(ForeignKey("crops.id"), nullable=True, index=True)
    crop_name: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity_kg: Mapped[float] = mapped_column(Float, nullable=False)
    price_per_kg: Mapped[float] = mapped_column(Float, nullable=False)
    msp_per_kg: Mapped[float] = mapped_column(Float, default=0.0)
    quality_grade: Mapped[QualityGrade] = mapped_column(Enum(QualityGrade), default=QualityGrade.pending)
    status: Mapped[ListingStatus] = mapped_column(Enum(ListingStatus), default=ListingStatus.draft)
    notes: Mapped[str] = mapped_column(Text, default="")
    inspection_scheduled_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    inspection_notes: Mapped[str] = mapped_column(Text, default="")
    hub_graded_by_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    farmer = relationship("FarmerProfile", back_populates="listings")
    crop = relationship("Crop", back_populates="listings")


class SoilHealthReport(Base):
    __tablename__ = "soil_health_reports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    farmer_id: Mapped[int] = mapped_column(ForeignKey("farmer_profiles.id"), nullable=False, index=True)
    land_id: Mapped[int | None] = mapped_column(ForeignKey("lands.id"), nullable=True, index=True)
    report_name: Mapped[str] = mapped_column(String(255), nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="")
    file_url: Mapped[str] = mapped_column(String(500), default="")
    status: Mapped[SoilReportStatus] = mapped_column(Enum(SoilReportStatus), default=SoilReportStatus.submitted)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    farmer = relationship("FarmerProfile", back_populates="soil_reports")
    land = relationship("Land")
