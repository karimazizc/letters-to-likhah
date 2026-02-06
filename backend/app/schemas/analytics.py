"""
Pydantic schemas for Analytics validation and serialization.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class AnalyticsTrack(BaseModel):
    """Schema for tracking a page view."""
    post_id: Optional[int] = Field(None, description="ID of the viewed post (legacy)")
    page_type: str = Field("post", description="Type of page: home, post, message, music, memories")
    resource_id: Optional[int] = Field(None, description="ID of the specific resource viewed")
    session_id: Optional[str] = Field(None, description="Client session identifier")
    referrer: Optional[str] = Field(None, description="Referrer URL")


class AnalyticsResponse(BaseModel):
    """Schema for analytics entry response."""
    id: int
    page_type: Optional[str]
    resource_id: Optional[int]
    post_id: Optional[int]
    ip_address: Optional[str]
    country: Optional[str]
    city: Optional[str]
    user_agent: Optional[str]
    referrer: Optional[str]
    timestamp: datetime
    session_id: Optional[str]
    
    class Config:
        from_attributes = True


class VisitorResponse(BaseModel):
    """Schema for visitor details response."""
    id: int
    page_type: Optional[str]
    resource_id: Optional[int]
    post_id: Optional[int]
    resource_title: Optional[str]
    ip_address: Optional[str]
    country: Optional[str]
    city: Optional[str]
    user_agent: Optional[str]
    referrer: Optional[str]
    timestamp: datetime
    session_id: Optional[str]
    
    class Config:
        from_attributes = True


class PostStats(BaseModel):
    """Stats for a single post."""
    post_id: int
    title: str
    view_count: int
    unique_visitors: int


class GeoStats(BaseModel):
    """Geographic distribution stats."""
    country: str
    count: int


class DailyStats(BaseModel):
    """Daily view statistics."""
    date: str
    views: int


class HourlyStats(BaseModel):
    """Hourly distribution."""
    hour: int
    views: int


class PageTypeStats(BaseModel):
    """Stats per page type."""
    page_type: str
    views: int
    unique_visitors: int


class DeviceStats(BaseModel):
    """Device/browser breakdown."""
    device: str
    count: int


class TopResource(BaseModel):
    """Most viewed resource."""
    page_type: str
    resource_id: Optional[int]
    title: Optional[str]
    views: int
    unique_visitors: int


class SessionInfo(BaseModel):
    """Session information for a unique visitor."""
    session_id: str
    ip_address: Optional[str]
    country: Optional[str]
    city: Optional[str]
    device: Optional[str]
    visit_count: int
    first_seen: datetime
    last_seen: datetime
    pages_viewed: int


class StatsResponse(BaseModel):
    """Schema for overall analytics statistics."""
    total_views: int
    total_unique_visitors: int
    total_posts: int
    views_today: int
    views_this_week: int
    views_this_month: int
    posts_stats: List[PostStats]
    geo_stats: List[GeoStats]
    daily_stats: List[DailyStats]
    page_type_stats: List[PageTypeStats]
    hourly_stats: List[HourlyStats]
    device_stats: List[DeviceStats]
    top_resources: List[TopResource]


class VisitorListResponse(BaseModel):
    """Paginated visitor list."""
    visitors: List[VisitorResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class SessionListResponse(BaseModel):
    """Paginated session list."""
    sessions: List[SessionInfo]
    total: int
    page: int
    page_size: int
    total_pages: int
