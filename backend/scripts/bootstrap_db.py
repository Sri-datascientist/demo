"""Create MySQL database/user (requires root), then create tables and seed data.

Usage (from backend folder):
    set MYSQL_ROOT_PASSWORD=your_mysql_root_password
    python scripts/bootstrap_db.py

Or pass root password as first argument:
    python scripts/bootstrap_db.py your_mysql_root_password
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pymysql
from sqlalchemy.engine.url import make_url

from scripts.init_db import init_db

DB_NAME = "oyedesi"
DB_USER = "oyedesi_user"
DB_PASSWORD = "Oyedesi2026_secure"


def _root_password() -> str:
    if len(sys.argv) > 1 and not sys.argv[1].startswith("-"):
        return sys.argv[1]
    password = os.getenv("MYSQL_ROOT_PASSWORD", "")
    if not password:
        print("Set MYSQL_ROOT_PASSWORD or run: python scripts/bootstrap_db.py <root_password>")
        sys.exit(1)
    return password


def bootstrap() -> None:
    from app.config import settings

    url = make_url(settings.database_url)
    host = url.host or "127.0.0.1"
    port = int(url.port or 3306)
    root_password = _root_password()

    print(f"Connecting to MySQL at {host}:{port} as root...")
    conn = pymysql.connect(
        host=host,
        port=port,
        user="root",
        password=root_password,
        charset="utf8mb4",
        autocommit=True,
    )
    try:
        with conn.cursor() as cur:
            cur.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            for host_pattern in ("localhost", "127.0.0.1"):
                cur.execute(f"DROP USER IF EXISTS '{DB_USER}'@'{host_pattern}'")
                cur.execute(
                    f"CREATE USER '{DB_USER}'@'{host_pattern}' IDENTIFIED BY %s",
                    (DB_PASSWORD,),
                )
                cur.execute(f"GRANT ALL PRIVILEGES ON `{DB_NAME}`.* TO '{DB_USER}'@'{host_pattern}'")
            cur.execute("FLUSH PRIVILEGES")
        print(f"Database '{DB_NAME}' and user '{DB_USER}' are ready.")
    finally:
        conn.close()

    init_db(reset=False)


if __name__ == "__main__":
    bootstrap()
