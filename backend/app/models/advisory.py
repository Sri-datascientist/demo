import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class AdvisoryType(str, enum.Enum):
    soil = "soil"
    crop = "crop"
    fertilizer = "fertilizer"
    weather = "weather"


class Advisory(Base):
    __tablename__ = "advisories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    farmer_id: Mapped[int | None] = mapped_column(ForeignKey("farmer_profiles.id"), nullable=True, index=True)
    advisory_type: Mapped[AdvisoryType] = mapped_column(Enum(AdvisoryType), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    farmer = relationship("FarmerProfile", back_populates="advisories")
