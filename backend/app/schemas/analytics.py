from typing import Dict, List

from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    total_orders: int
    total_revenue: float
    total_customers: int
    total_farmers: int
    total_products: int
    low_stock_count: int
    pending_crop_listings: int
    pending_soil_reports: int = 0
    open_support_tickets: int = 0
    orders_by_status: Dict[str, int]
    revenue_by_month: List[dict]
