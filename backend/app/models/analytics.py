"""
Analytics model for tracking page views and visitor information.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Analytics(Base):
    """
    Analytics model for tracking visitor information across all pages.
    
    Attributes:
        id: Primary key
        page_type: Which page was viewed (home, post, message, music, memories)
        resource_id: ID of the specific resource viewed (post_id, message_id, etc.)
        post_id: Legacy FK to posts (kept for backwards compat)
        ip_address: Visitor's IP address (IPv4/IPv6)
        country: Visitor's country from geolocation
        city: Visitor's city from geolocation
        user_agent: Browser/device information
        referrer: Where the visitor came from
        timestamp: When the page was viewed
        session_id: Unique session identifier for deduplication
    """
    __tablename__ = "analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    page_type = Column(String(50), nullable=True, index=True, default="post")  # home, post, message, music, memories
    resource_id = Column(Integer, nullable=True, index=True)  # ID of the specific resource
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), index=True)
    ip_address = Column(String(45), nullable=True)  # Supports IPv6
    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    user_agent = Column(Text, nullable=True)
    referrer = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    session_id = Column(String(255), nullable=True, index=True)
    
    # Relationship to post
    post = relationship("Post", back_populates="analytics")
    
    def __repr__(self):
        return f"<Analytics(id={self.id}, page={self.page_type}, ip={self.ip_address})>"
