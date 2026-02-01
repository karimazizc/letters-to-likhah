"""
Database configuration and session management.
Uses SQLAlchemy async with asyncpg driver for PostgreSQL.
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.core.config import settings

# Create async engine with optimized connection pooling
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,  # Set to True for SQL query logging
    pool_size=20,  # Increased pool size for better performance
    max_overflow=40,  # Allow more overflow connections
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600,  # Recycle connections every hour
    pool_timeout=30,  # Connection timeout
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for declarative models
Base = declarative_base()


async def get_db():
    """
    Dependency that provides a database session.
    Yields an async session and ensures it's closed after use.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
