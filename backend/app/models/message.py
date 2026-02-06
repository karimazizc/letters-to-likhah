"""
Message model for long personal messages with embedded media.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime

from app.core.database import Base


def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from title."""
    import re
    # Convert to lowercase and replace spaces with hyphens
    slug = title.lower().strip()
    # Remove special characters, keep only alphanumeric and hyphens
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    # Replace spaces with hyphens
    slug = re.sub(r'[\s_]+', '-', slug)
    # Remove multiple consecutive hyphens
    slug = re.sub(r'-+', '-', slug)
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    return slug


class Message(Base):
    """
    Message model representing long personal messages.
    
    Attributes:
        id: Primary key
        title: Message title (max 255 chars)
        slug: URL-friendly slug generated from title
        content: Full message content (HTML with embedded images/videos)
        excerpt: Short preview text
        published: Whether the message is publicly visible
        created_at: When the message was created
        updated_at: When the message was last modified
        view_count: Total number of views
    """
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(300), nullable=False, unique=True, index=True)
    content = Column(Text, nullable=False)
    excerpt = Column(Text, nullable=True)
    published = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    view_count = Column(Integer, default=0)
    
    def __repr__(self):
        return f"<Message(id={self.id}, title='{self.title}', slug='{self.slug}')>"
