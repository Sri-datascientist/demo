from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_BACKEND_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "mysql+pymysql://oyedesi_user:Oyedesi2026_secure@127.0.0.1:3306/oyedesi"
    secret_key: str = "dev-secret-change-in-production"
    access_token_expire_minutes: int = 1440
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    # Local dev: true (auto-create tables + seed). Lambda: set RUN_STARTUP_INIT=false
    run_startup_init: bool = True
    admin_email: str = "admin@oyedesi.co"
    admin_password: str = "TestAdmin@123"
    test_user_email: str = "user@oyedesi.co"
    test_user_password: str = "TestUser@123"
    test_user_name: str = "Test Customer"
    test_farmer_email: str = "farmer@oyedesi.co"
    test_farmer_password: str = "TestFarmer@123"
    test_farmer_name: str = "Test Farmer"
    otp_expire_minutes: int = 10
    otp_dev_mode: bool = True
    kyc_dev_mode: bool = True
    digilocker_redirect_base: str = "http://localhost:3000/farmer/kyc"
    test_hub_email: str = "hub@oyedesi.co"
    test_hub_password: str = "TestHub@123"
    test_hub_name: str = "District Hub Collector"

    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = "sriniani00@gmail.com"
    smtp_password: str = "utmopfrqrgbocudt"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
