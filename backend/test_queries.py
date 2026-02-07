import asyncio
from app.core.database import AsyncSessionLocal
from app.models.analytics import Analytics
from app.models.post import Post
from app.models.message import Message
from sqlalchemy import select, func, distinct
from datetime import datetime, timedelta

async def test():
    async with AsyncSessionLocal() as db:
        now = datetime.utcnow()
        period_start = now - timedelta(days=30)

        # Test 1: basic count
        r = await db.execute(select(func.count(Analytics.id)))
        print(f"Total rows: {r.scalar()}")

        # Test 2: page_type query
        try:
            q = (
                select(
                    func.coalesce(Analytics.page_type, "post").label("page_type"),
                    func.count(Analytics.id).label("views"),
                    func.count(distinct(Analytics.ip_address)).label("unique_visitors"),
                )
                .where(Analytics.timestamp >= period_start)
                .group_by(Analytics.page_type)
                .order_by(func.count(Analytics.id).desc())
            )
            r = await db.execute(q)
            rows = r.all()
            for row in rows:
                print(f"  page_type={row.page_type}, views={row.views}, unique={row.unique_visitors}")
            print(f"page_type query: OK ({len(rows)} rows)")
        except Exception as e:
            print(f"page_type query FAILED: {e}")

        # Test 3: top resources
        try:
            q = (
                select(
                    func.coalesce(Analytics.page_type, "post").label("page_type"),
                    Analytics.resource_id,
                    func.count(Analytics.id).label("views"),
                    func.count(distinct(Analytics.ip_address)).label("unique_visitors"),
                )
                .where(Analytics.timestamp >= period_start, Analytics.resource_id.isnot(None))
                .group_by(Analytics.page_type, Analytics.resource_id)
                .order_by(func.count(Analytics.id).desc())
                .limit(10)
            )
            r = await db.execute(q)
            rows = r.all()
            print(f"top_resources query: OK ({len(rows)} rows)")
        except Exception as e:
            print(f"top_resources FAILED: {e}")

        # Test 4: sessions
        try:
            q = (
                select(
                    Analytics.session_id,
                    func.min(Analytics.ip_address).label("ip_address"),
                    func.count(Analytics.id).label("visit_count"),
                    func.count(distinct(Analytics.page_type)).label("pages_viewed"),
                )
                .where(Analytics.session_id.isnot(None))
                .group_by(Analytics.session_id)
                .order_by(func.max(Analytics.timestamp).desc())
                .limit(5)
            )
            r = await db.execute(q)
            rows = r.all()
            print(f"sessions query: OK ({len(rows)} rows)")
        except Exception as e:
            print(f"sessions FAILED: {e}")

        # Test 5: daily stats with func.date
        try:
            q = (
                select(
                    func.date(Analytics.timestamp).label("date"),
                    func.count(Analytics.id).label("views"),
                )
                .where(Analytics.timestamp >= period_start)
                .group_by(func.date(Analytics.timestamp))
                .order_by(func.date(Analytics.timestamp))
            )
            r = await db.execute(q)
            rows = r.all()
            print(f"daily_stats query: OK ({len(rows)} rows)")
        except Exception as e:
            print(f"daily_stats FAILED: {e}")

        # Test 6: hourly stats
        try:
            q = (
                select(
                    func.extract("hour", Analytics.timestamp).label("hour"),
                    func.count(Analytics.id).label("views"),
                )
                .where(Analytics.timestamp >= period_start)
                .group_by(func.extract("hour", Analytics.timestamp))
                .order_by(func.extract("hour", Analytics.timestamp))
            )
            r = await db.execute(q)
            rows = r.all()
            print(f"hourly_stats query: OK ({len(rows)} rows)")
        except Exception as e:
            print(f"hourly_stats FAILED: {e}")

        # Test 7: post stats join
        try:
            q = (
                select(
                    Post.id,
                    Post.title,
                    Post.view_count,
                    func.count(distinct(Analytics.ip_address)).label("unique_visitors"),
                )
                .outerjoin(Analytics, Post.id == Analytics.post_id)
                .group_by(Post.id)
                .order_by(Post.view_count.desc())
            )
            r = await db.execute(q)
            rows = r.all()
            print(f"post_stats query: OK ({len(rows)} rows)")
        except Exception as e:
            print(f"post_stats FAILED: {e}")

        print("\nAll tests complete!")

asyncio.run(test())
