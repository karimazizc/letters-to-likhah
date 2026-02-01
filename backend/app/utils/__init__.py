"""Utility functions for the application."""

from app.utils.image_processing import (
    optimize_image_base64,
    create_thumbnail_base64,
    extract_image_dimensions,
)

__all__ = [
    "optimize_image_base64",
    "create_thumbnail_base64",
    "extract_image_dimensions",
]
