import random
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.config import settings
from app.models.otp import OtpCode


def generate_otp_code() -> str:
    return f"{random.randint(100000, 999999)}"


def create_otp(db: Session, email: str, purpose: str = "verify") -> str:
    code = generate_otp_code()
    db.query(OtpCode).filter(OtpCode.email == email, OtpCode.purpose == purpose).delete()
    otp = OtpCode(
        email=email,
        code=code,
        purpose=purpose,
        expires_at=datetime.utcnow() + timedelta(minutes=settings.otp_expire_minutes),
    )
    db.add(otp)
    db.commit()
    return code


def verify_otp(db: Session, email: str, code: str, purpose: str = "verify") -> bool:
    otp = (
        db.query(OtpCode)
        .filter(
            OtpCode.email == email,
            OtpCode.purpose == purpose,
            OtpCode.code == code,
            OtpCode.verified == False,
        )
        .order_by(OtpCode.created_at.desc())
        .first()
    )
    if not otp or otp.expires_at < datetime.utcnow():
        return False
    otp.verified = True
    db.commit()
    return True
