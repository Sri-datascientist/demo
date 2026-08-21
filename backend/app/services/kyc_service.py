"""Farmer KYC via DigiLocker (production) or dev auto-verify stub."""

import re
import secrets
from datetime import datetime

from sqlalchemy.orm import Session

from app.config import settings
from app.models.farmer import FarmerProfile, KycStatus, VerificationStatus

_AADHAAR_RE = re.compile(r"^\d{12}$")

# Verhoeff algorithm tables for Aadhaar checksum validation
_d = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    [7, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    [8, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    [9, 9, 8, 7, 6, 5, 4, 3, 2, 1],
]
_p = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 7, 0, 8],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
]
_inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9]


def normalize_aadhaar(value: str) -> str:
    return re.sub(r"\s|-", "", value.strip())


def mask_aadhaar(aadhaar: str) -> str:
    if len(aadhaar) != 12:
        return ""
    return f"XXXX-XXXX-{aadhaar[-4:]}"


def validate_aadhaar_format(aadhaar: str) -> bool:
    if not _AADHAAR_RE.match(aadhaar):
        return False
    if aadhaar[0] in ("0", "1"):
        return False
    c = 0
    for i, ch in enumerate(reversed(aadhaar)):
        c = _d[c][_p[i % 8][int(ch)]]
    return c == 0


def initiate_digilocker_session(aadhaar: str) -> dict:
    """Start DigiLocker verification. In dev mode returns session for immediate completion."""
    session_id = f"DL-{secrets.token_hex(12)}"
    return {
        "session_id": session_id,
        "provider": "digilocker",
        "redirect_url": f"{settings.digilocker_redirect_base}?session={session_id}",
        "auto_verify": settings.kyc_dev_mode,
    }


def complete_digilocker_verification(
    db: Session,
    profile: FarmerProfile,
    aadhaar: str,
    session_id: str,
) -> FarmerProfile:
    aadhaar = normalize_aadhaar(aadhaar)
    if not validate_aadhaar_format(aadhaar):
        profile.kyc_status = KycStatus.failed
        profile.kyc_provider = "digilocker"
        db.commit()
        raise ValueError("Invalid Aadhaar number")

    if settings.kyc_dev_mode:
        profile.aadhaar_masked = mask_aadhaar(aadhaar)
        profile.kyc_status = KycStatus.verified
        profile.kyc_provider = "digilocker"
        profile.kyc_reference = session_id
        profile.kyc_verified_at = datetime.utcnow()
        profile.verification_status = VerificationStatus.verified
        db.commit()
        db.refresh(profile)
        return profile

    # Production: call DigiLocker API here; stub fails until integrated
    profile.kyc_status = KycStatus.failed
    profile.kyc_provider = "digilocker"
    db.commit()
    raise ValueError("DigiLocker integration not configured. Set KYC_DEV_MODE=true for development.")
