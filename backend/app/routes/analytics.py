"""
Analytics routes for tracking and reporting.
"""

import math
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request, BackgroundTasks
from sqlalchemy import select, func, distinct, case, literal_column, text
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
import re

from app.core.database import get_db
from app.core.config import settings
from app.models.post import Post
from app.models.message import Message
from app.models.analytics import Analytics
from app.schemas.analytics import (
    AnalyticsTrack,
    VisitorResponse,
    VisitorListResponse,
    StatsResponse,
    PostStats,
    GeoStats,
    DailyStats,
    HourlyStats,
    PageTypeStats,
    DeviceStats,
    TopResource,
    SessionInfo,
    SessionListResponse,
)
from app.dependencies.auth import get_current_admin

router = APIRouter()


def parse_user_agent(ua: str) -> str:
    """Extract a readable device/browser string from user agent."""
    if not ua:
        return "Unknown"
    
    # Detect bots
    if re.search(r'bot|crawl|spider|slurp|mediapartners', ua, re.I):
        return "Bot"
    
    # Detect device
    device = "Desktop"
    if re.search(r'iPhone|iPad|iPod', ua):
        device = "iPhone" if "iPhone" in ua else "iPad"
    elif re.search(r'Android', ua):
        device = "Android"
    elif re.search(r'Mac OS X', ua):
        device = "Mac"
    elif re.search(r'Windows', ua):
        device = "Windows"
    elif re.search(r'Linux', ua):
        device = "Linux"
    
    # Detect browser
    browser = ""
    if re.search(r'Edg/', ua):
        browser = "Edge"
    elif re.search(r'Chrome/', ua) and not re.search(r'Edg/', ua):
        browser = "Chrome"
    elif re.search(r'Safari/', ua) and not re.search(r'Chrome/', ua):
        browser = "Safari"
    elif re.search(r'Firefox/', ua):
        browser = "Firefox"
    elif re.search(r'MSIE|Trident', ua):
        browser = "IE"
    else:
        browser = "Other"
    
    return f"{device} / {browser}"


async def get_geolocation(ip_address: str) -> dict:
    """
    Get geolocation data for an IP address using ip-api.com.
    """
    if ip_address in ["127.0.0.1", "localhost", "::1"] or ip_address.startswith("192.168.") or ip_address.startswith("10."):
        return {"country": "Local", "city": "Development"}
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{settings.GEOIP_API_URL}/{ip_address}")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    return {
                        "country": data.get("country", "Unknown"),
                        "city": data.get("city", "Unknown"),
                    }
    except Exception:
        pass
    
    return {"country": "Unknown", "city": "Unknown"}


async def track_view_background(
    page_type: str,
    resource_id: Optional[int],
    post_id: Optional[int],
    ip_address: str,
    user_agent: str,
    session_id: Optional[str],
    referrer: Optional[str],
    db: AsyncSession,
):
    """
    Background task to track a page view.
    """
    # Get geolocation
    geo_data = await get_geolocation(ip_address)
    
    # Check for duplicate view (same page_type + resource + IP + session within 30 min)
    if session_id:
        thirty_min_ago = datetime.utcnow() - timedelta(minutes=30)
        existing_query = select(Analytics).where(
            Analytics.page_type == page_type,
            Analytics.resource_id == resource_id,
            Analytics.ip_address == ip_address,
            Analytics.session_id == session_id,
            Analytics.timestamp > thirty_min_ago,
        )
        result = await db.execute(existing_query)
        if result.scalar_one_or_none():
            return  # Skip duplicate
    
    # Create analytics entry
    analytics = Analytics(
        page_type=page_type,
        resource_id=resource_id,
        post_id=post_id if page_type == "post" else None,
        ip_address=ip_address,
        country=geo_data["country"],
        city=geo_data["city"],
        user_agent=user_agent,
        referrer=referrer,
        session_id=session_id,
    )
    
    db.add(analytics)
    
    # Increment view count on post/message
    if page_type == "post" and resource_id:
        post_result = await db.execute(select(Post).where(Post.id == resource_id))
        post = post_result.scalar_one_or_none()
        if post:
            post.view_count = (post.view_count or 0) + 1
    elif page_type == "message" and resource_id:
        msg_result = await db.execute(select(Message).where(Message.id == resource_id))
        msg = msg_result.scalar_one_or_none()
        if msg:
            msg.view_count = (msg.view_count or 0) + 1
    
    await db.commit()


@router.post("/track", status_code=status.HTTP_202_ACCEPTED)
async def track_view(
    data: AnalyticsTrack,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Track a page view for any page type.
    """
    # Extract IP from headers (handle proxies)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        ip_address = forwarded_for.split(",")[0].strip()
    else:
        ip_address = request.client.host if request.client else "Unknown"
    
    user_agent = request.headers.get("User-Agent", "Unknown")
    
    # Legacy compat: if post_id is set but page_type is default, treat as post
    page_type = data.page_type or "post"
    resource_id = data.resource_id or data.post_id
    
    background_tasks.add_task(
        track_view_background,
        page_type,
        resource_id,
        data.post_id,
        ip_address,
        user_agent,
        data.session_id,
        data.referrer,
        db,
    )
    
    return {"status": "accepted"}


@router.get("/stats", response_model=StatsResponse)
async def get_stats(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """
    Get comprehensive analytics statistics (admin only).
    """
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    period_start = today_start - timedelta(days=days)
    
    # ── Totals ──────────────────────────────────────────────────────
    total_views_result = await db.execute(select(func.count(Analytics.id)))
    total_views = total_views_result.scalar() or 0
    
    unique_visitors_result = await db.execute(
        select(func.count(distinct(Analytics.ip_address)))
    )
    total_unique_visitors = unique_visitors_result.scalar() or 0
    
    total_posts_result = await db.execute(select(func.count(Post.id)))
    total_posts = total_posts_result.scalar() or 0
    
    views_today_result = await db.execute(
        select(func.count(Analytics.id)).where(Analytics.timestamp >= today_start)
    )
    views_today = views_today_result.scalar() or 0
    
    views_week_result = await db.execute(
        select(func.count(Analytics.id)).where(Analytics.timestamp >= week_start)
    )
    views_this_week = views_week_result.scalar() or 0
    
    views_month_result = await db.execute(
        select(func.count(Analytics.id)).where(Analytics.timestamp >= period_start)
    )
    views_this_month = views_month_result.scalar() or 0
    
    # ── Per-post stats ──────────────────────────────────────────────
    posts_stats_query = (
        select(
            Post.id,
            Post.title,
            Post.view_count,
            func.count(distinct(Analytics.ip_address)).label("unique_visitors")
        )
        .outerjoin(Analytics, Post.id == Analytics.post_id)
        .group_by(Post.id)
        .order_by(Post.view_count.desc())
    )
    posts_stats_result = await db.execute(posts_stats_query)
    posts_stats = [
        PostStats(
            post_id=row.id,
            title=row.title,
            view_count=row.view_count or 0,
            unique_visitors=row.unique_visitors or 0,
        )
        for row in posts_stats_result.all()
    ]
    
    # ── Geographic distribution ─────────────────────────────────────
    geo_query = (
        select(Analytics.country, func.count(Analytics.id).label("count"))
        .where(Analytics.country.isnot(None))
        .group_by(Analytics.country)
        .order_by(func.count(Analytics.id).desc())
        .limit(15)
    )
    geo_result = await db.execute(geo_query)
    geo_stats = [
        GeoStats(country=row.country, count=row.count)
        for row in geo_result.all()
    ]
    
    # ── Daily stats ─────────────────────────────────────────────────
    daily_query = (
        select(
            func.date(Analytics.timestamp).label("date"),
            func.count(Analytics.id).label("views")
        )
        .where(Analytics.timestamp >= period_start)
        .group_by(func.date(Analytics.timestamp))
        .order_by(func.date(Analytics.timestamp))
    )
    daily_result = await db.execute(daily_query)
    daily_stats = [
        DailyStats(date=str(row.date), views=row.views)
        for row in daily_result.all()
    ]
    
    # ── Page type breakdown ─────────────────────────────────────────
    page_type_query = (
        select(
            func.coalesce(Analytics.page_type, "post").label("page_type"),
            func.count(Analytics.id).label("views"),
            func.count(distinct(Analytics.ip_address)).label("unique_visitors"),
        )
        .where(Analytics.timestamp >= period_start)
        .group_by(Analytics.page_type)
        .order_by(func.count(Analytics.id).desc())
    )
    page_type_result = await db.execute(page_type_query)
    page_type_stats = [
        PageTypeStats(page_type=row.page_type, views=row.views, unique_visitors=row.unique_visitors)
        for row in page_type_result.all()
    ]
    
    # ── Hourly distribution ─────────────────────────────────────────
    hourly_query = (
        select(
            func.extract("hour", Analytics.timestamp).label("hour"),
            func.count(Analytics.id).label("views"),
        )
        .where(Analytics.timestamp >= period_start)
        .group_by(func.extract("hour", Analytics.timestamp))
        .order_by(func.extract("hour", Analytics.timestamp))
    )
    hourly_result = await db.execute(hourly_query)
    hourly_stats = [
        HourlyStats(hour=int(row.hour), views=row.views)
        for row in hourly_result.all()
    ]
    
    # ── Device / Browser breakdown ──────────────────────────────────
    all_ua_query = (
        select(Analytics.user_agent)
        .where(
            Analytics.timestamp >= period_start,
            Analytics.user_agent.isnot(None),
        )
    )
    ua_result = await db.execute(all_ua_query)
    device_counts = {}
    for row in ua_result.all():
        device = parse_user_agent(row.user_agent)
        device_counts[device] = device_counts.get(device, 0) + 1
    
    device_stats = sorted(
        [DeviceStats(device=d, count=c) for d, c in device_counts.items()],
        key=lambda x: x.count,
        reverse=True,
    )[:15]
    
    # ── Top resources (across all page types) ───────────────────────
    top_res_query = (
        select(
            func.coalesce(Analytics.page_type, "post").label("page_type"),
            Analytics.resource_id,
            func.count(Analytics.id).label("views"),
            func.count(distinct(Analytics.ip_address)).label("unique_visitors"),
        )
        .where(
            Analytics.timestamp >= period_start,
            Analytics.resource_id.isnot(None),
        )
        .group_by(Analytics.page_type, Analytics.resource_id)
        .order_by(func.count(Analytics.id).desc())
        .limit(10)
    )
    top_res_result = await db.execute(top_res_query)
    top_resources = []
    for row in top_res_result.all():
        title = None
        if row.page_type == "post" and row.resource_id:
            t = await db.execute(select(Post.title).where(Post.id == row.resource_id))
            title = t.scalar()
        elif row.page_type == "message" and row.resource_id:
            t = await db.execute(select(Message.title).where(Message.id == row.resource_id))
            title = t.scalar()
        top_resources.append(TopResource(
            page_type=row.page_type,
            resource_id=row.resource_id,
            title=title,
            views=row.views,
            unique_visitors=row.unique_visitors,
        ))
    
    return StatsResponse(
        total_views=total_views,
        total_unique_visitors=total_unique_visitors,
        total_posts=total_posts,
        views_today=views_today,
        views_this_week=views_this_week,
        views_this_month=views_this_month,
        posts_stats=posts_stats,
        geo_stats=geo_stats,
        daily_stats=daily_stats,
        page_type_stats=page_type_stats,
        hourly_stats=hourly_stats,
        device_stats=device_stats,
        top_resources=top_resources,
    )


@router.get("/visitors", response_model=VisitorListResponse)
async def get_visitors(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    page_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """
    Get visitor details with pagination (admin only).
    """
    # Count total
    count_query = select(func.count(Analytics.id))
    if page_type:
        count_query = count_query.where(Analytics.page_type == page_type)
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    total_pages = max(1, math.ceil(total / page_size))
    
    offset = (page - 1) * page_size
    
    query = (
        select(Analytics)
        .order_by(Analytics.timestamp.desc())
        .offset(offset)
        .limit(page_size)
    )
    if page_type:
        query = query.where(Analytics.page_type == page_type)
    
    result = await db.execute(query)
    visitors = []
    
    for row in result.scalars().all():
        # Resolve resource title
        resource_title = None
        if row.page_type == "post" and row.resource_id:
            t = await db.execute(select(Post.title).where(Post.id == row.resource_id))
            resource_title = t.scalar()
        elif row.page_type == "message" and row.resource_id:
            t = await db.execute(select(Message.title).where(Message.id == row.resource_id))
            resource_title = t.scalar()
        elif row.page_type in ["home", "music", "memories"]:
            resource_title = row.page_type.capitalize()
        
        visitors.append(
            VisitorResponse(
                id=row.id,
                page_type=row.page_type,
                resource_id=row.resource_id,
                post_id=row.post_id,
                resource_title=resource_title,
                ip_address=row.ip_address,
                country=row.country,
                city=row.city,
                user_agent=row.user_agent,
                referrer=row.referrer,
                timestamp=row.timestamp,
                session_id=row.session_id,
            )
        )
    
    return VisitorListResponse(
        visitors=visitors,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/sessions", response_model=SessionListResponse)
async def get_sessions(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """
    Get unique sessions with visit counts (admin only).
    Shows how many times each visitor has returned.
    """
    # Count total distinct sessions
    count_query = select(func.count(distinct(Analytics.session_id))).where(
        Analytics.session_id.isnot(None)
    )
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    total_pages = max(1, math.ceil(total / page_size))
    
    offset = (page - 1) * page_size
    
    sessions_query = (
        select(
            Analytics.session_id,
            func.min(Analytics.ip_address).label("ip_address"),
            func.min(Analytics.country).label("country"),
            func.min(Analytics.city).label("city"),
            func.min(Analytics.user_agent).label("user_agent"),
            func.count(Analytics.id).label("visit_count"),
            func.min(Analytics.timestamp).label("first_seen"),
            func.max(Analytics.timestamp).label("last_seen"),
            func.count(distinct(Analytics.page_type)).label("pages_viewed"),
        )
        .where(Analytics.session_id.isnot(None))
        .group_by(Analytics.session_id)
        .order_by(func.max(Analytics.timestamp).desc())
        .offset(offset)
        .limit(page_size)
    )
    
    result = await db.execute(sessions_query)
    sessions = [
        SessionInfo(
            session_id=row.session_id,
            ip_address=row.ip_address,
            country=row.country,
            city=row.city,
            device=parse_user_agent(row.user_agent),
            visit_count=row.visit_count,
            first_seen=row.first_seen,
            last_seen=row.last_seen,
            pages_viewed=row.pages_viewed,
        )
        for row in result.all()
    ]
    
    return SessionListResponse(
        sessions=sessions,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )
