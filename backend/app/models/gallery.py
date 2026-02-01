"""
Gallery model for storing media items (images/videos).
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
import enum

from app.core.database import Base


class MediaType(str, enum.Enum):
    """Enum for media types."""
    IMAGE = "image"
    VIDEO = "video"


class GalleryMedia(Base):
    """
    GalleryMedia model representing images and videos in the gallery.
    
    Attributes:
        id: Primary key
        media_type: Type of media (image or video)
        url: URL or base64 data of the media
        thumbnail_url: Thumbnail for images/videos (optimized small version)
        blur_placeholder: Tiny base64 image for progressive loading
        width: Original image width
        height: Original image height
        caption: Optional caption for the media
        order_index: For ordering media in the gallery
        created_at: When the media was uploaded
    """
    __tablename__ = "gallery_media"
    
    id = Column(Integer, primary_key=True, index=True)
    media_type = Column(String(10), nullable=False, default="image")
    url = Column(Text, nullable=False)  # Base64 data or URL
    thumbnail_url = Column(Text, nullable=True)  # Optimized thumbnail
    blur_placeholder = Column(Text, nullable=True)  # Tiny blur placeholder
    width = Column(Integer, nullable=True)  # Original width
    height = Column(Integer, nullable=True)  # Original height
    caption = Column(String(255), nullable=True)
    order_index = Column(Integer, default=0, index=True)  # Added index
    created_at = Column(DateTime, default=datetime.utcnow, index=True)  # Added index
    
    def __repr__(self):
        return f"<GalleryMedia(id={self.id}, type='{self.media_type}')>"
