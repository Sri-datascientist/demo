import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import NullPool

from app.config import settings


def _normalize_database_url(url: str) -> str:
    """Ensure SQLAlchemy uses an installed DB driver (e.g. mysql+pymysql)."""
    if url.startswith("mysql://"):
        return url.replace("mysql://", "mysql+pymysql://", 1)
    return url


def _engine_connect_args(url: str) -> dict:
    if url.startswith("mysql"):
        return {"charset": "utf8mb4"}
    elif url.startswith("sqlite"):
        return {"check_same_thread": False}
    return {}


def _engine_kwargs() -> dict:
    kwargs: dict = {"pool_pre_ping": True}
    # Lambda: avoid stale pooled connections across invocations
    if os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        kwargs["poolclass"] = NullPool
    return kwargs


_db_url = _normalize_database_url(settings.database_url)
engine = create_engine(_db_url, connect_args=_engine_connect_args(_db_url), **_engine_kwargs())
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
