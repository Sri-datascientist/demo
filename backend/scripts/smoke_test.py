"""Smoke test for Oyedesi API. Run from backend folder: python scripts/smoke_test.py"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import json
from fastapi.testclient import TestClient

from app.config import settings
from app.main import app

client = TestClient(app)
passed = 0
failed = 0
errors: list[str] = []


def check(name: str, condition: bool, detail: str = "") -> None:
    global passed, failed
    if condition:
        passed += 1
        print(f"  OK  {name}")
    else:
        failed += 1
        msg = f"  FAIL {name}" + (f" — {detail}" if detail else "")
        print(msg)
        errors.append(msg)


def login(email: str, password: str, account_type: str | None = None) -> str:
    body = {"email": email, "password": password}
    if account_type:
        body["account_type"] = account_type
    r = client.post("/api/auth/login/json", json=body)
    if r.status_code != 200:
        return ""
    return r.json()["access_token"]


print("=== Oyedesi Smoke Test ===\n")

# Health
r = client.get("/api/health")
check("GET /api/health", r.status_code == 200 and r.json().get("status") == "ok", r.text)

# Products (public)
r = client.get("/api/products")
products = r.json() if r.status_code == 200 else []
check("GET /api/products", r.status_code == 200 and len(products) >= 1, f"count={len(products)}")

r = client.get("/api/products/categories")
check("GET /api/products/categories", r.status_code == 200)

if products:
    pid = products[0]["id"]
    r = client.get(f"/api/products/{pid}")
    check(f"GET /api/products/{pid}", r.status_code == 200)
    r = client.get(f"/api/products/{pid}/reviews")
    check(f"GET /api/products/{pid}/reviews", r.status_code == 200)

# Admin login + endpoints
admin_token = login(settings.admin_email, settings.admin_password)
check("Admin login", bool(admin_token))
if admin_token:
    h = {"Authorization": f"Bearer {admin_token}"}
    endpoints = [
        "/api/admin/analytics",
        "/api/admin/orders",
        "/api/admin/inventory",
        "/api/admin/farmers",
        "/api/admin/users",
        "/api/admin/crop-listings",
        "/api/admin/payments",
        "/api/admin/advisories",
        "/api/admin/support-tickets",
    ]
    for path in endpoints:
        r = client.get(path, headers=h)
        check(f"GET {path}", r.status_code == 200, r.text[:120])

# Customer login + endpoints
cust_token = login(settings.test_user_email, settings.test_user_password, "customer")
check("Customer login (customer tab)", bool(cust_token))
if cust_token:
    h = {"Authorization": f"Bearer {cust_token}"}
    for path in ["/api/cart", "/api/orders/my", "/api/customer/profile", "/api/customer/addresses", "/api/customer/wallet"]:
        r = client.get(path, headers=h)
        check(f"GET {path}", r.status_code == 200, r.text[:120])

    # Add to cart + checkout flow (optional if stock exists)
    if products:
        r = client.post("/api/cart/items", headers=h, json={"product_id": products[0]["id"], "quantity": 1})
        check("POST /api/cart/items", r.status_code == 200, r.text[:120])

# Farmer login + endpoints
farm_token = login(settings.test_farmer_email, settings.test_farmer_password, "farmer")
check("Farmer login (farmer tab)", bool(farm_token))
if farm_token:
    h = {"Authorization": f"Bearer {farm_token}"}
    farmer_paths = [
        "/api/farmer/dashboard",
        "/api/farmer/profile",
        "/api/farmer/lands",
        "/api/farmer/crops",
        "/api/farmer/listings",
        "/api/farmer/advisories",
        "/api/farmer/payments",
        "/api/farmer/support",
    ]
    for path in farmer_paths:
        r = client.get(path, headers=h)
        check(f"GET {path}", r.status_code == 200, r.text[:120])

# Wrong account type should fail
r = client.post(
    "/api/auth/login/json",
    json={"email": settings.test_user_email, "password": settings.test_user_password, "account_type": "farmer"},
)
check("Customer blocked on farmer tab", r.status_code == 401)

r = client.post(
    "/api/auth/login/json",
    json={"email": settings.test_farmer_email, "password": settings.test_farmer_password, "account_type": "customer"},
)
check("Farmer blocked on customer tab", r.status_code == 401)

# OTP flow
r = client.post("/api/auth/otp/send", json={"email": settings.test_farmer_email})
otp_data = r.json() if r.status_code == 200 else {}
check("POST /api/auth/otp/send", r.status_code == 200)
if otp_data.get("otp_code"):
    r = client.post(
        "/api/auth/otp/verify",
        json={"email": settings.test_farmer_email, "code": otp_data["otp_code"]},
    )
    check("POST /api/auth/otp/verify", r.status_code == 200)

print(f"\n=== Results: {passed} passed, {failed} failed ===")
if errors:
    print("\nFailures:")
    for e in errors:
        print(e)
    sys.exit(1)
print("All smoke tests passed.")
sys.exit(0)
