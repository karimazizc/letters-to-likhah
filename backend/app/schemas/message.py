"""
Pydantic schemas for Message validation and serialization.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class MessageBase(BaseModel):
    """Base schema for message data."""
    title: str = Field(..., min_length=1, max_length=255, description="Message title")
    content: str = Field(..., min_length=1, description="Message content (HTML with embedded media)")
    excerpt: Optional[str] = Field(None, description="Short preview text")


class MessageCreate(MessageBase):
    """Schema for creating a new message."""
    published: bool = Field(default=False, description="Whether to publish immediately")


class MessageUpdate(BaseModel):
    """Schema for updating an existing message."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    excerpt: Optional[str] = None
    published: Optional[bool] = None


class MessageResponse(MessageBase):
    """Schema for message response."""
    id: int
    slug: str
    published: bool
    created_at: datetime
    updated_at: datetime
    view_count: int
    
    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    """Schema for paginated message list response."""
    messages: List[MessageResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
