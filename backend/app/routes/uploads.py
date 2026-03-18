"""
Upload routes for handling video (and other media) file uploads.
"""

import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.core.config import settings
from app.dependencies.auth import get_current_admin

router = APIRouter()

ALLOWED_VIDEO_TYPES = {
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",  # .mov
    "video/3gpp",       # mobile recordings
    "video/3gpp2",
    "video/x-m4v",      # iOS
    "video/x-matroska", # .mkv
    "application/octet-stream",  # fallback sent by some mobile browsers
}

ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".webm", ".ogg", ".mov", ".m4v", ".3gp"}

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
}


def ensure_upload_dir():
    """Create upload sub-directories if they don't exist."""
    for subdir in ("videos", "images"):
        path = os.path.join(settings.UPLOAD_DIR, subdir)
        os.makedirs(path, exist_ok=True)


@router.post("/video")
async def upload_video(
    file: UploadFile = File(...),
    _admin: dict = Depends(get_current_admin),
):
    """
    Upload a video file (admin only).

    Returns the public URL for the uploaded video.
    Accepts MP4, WebM, OGG, and MOV files up to the configured max size.
    """
    # Validate content type — also check extension as mobile browsers
    # often send incorrect or generic MIME types
    ext_check = os.path.splitext(file.filename or "")[1].lower()
    if file.content_type not in ALLOWED_VIDEO_TYPES and ext_check not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file.content_type}'. Allowed: mp4, webm, ogg, mov",
        )

    # Read file and check size
    contents = await file.read()
    max_bytes = settings.MAX_VIDEO_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {settings.MAX_VIDEO_SIZE_MB}MB",
        )

    ensure_upload_dir()

    # Generate unique filename preserving extension
    ext = os.path.splitext(file.filename or "video.mp4")[1].lower()
    if ext not in (".mp4", ".webm", ".ogg", ".mov", ".m4v", ".3gp"):
        ext = ".mp4"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, "videos", filename)

    # Write file
    with open(filepath, "wb") as f:
        f.write(contents)

    # Return a relative URL so it works from any domain/environment
    url = f"/uploads/videos/{filename}"
    return {"url": url, "filename": filename, "size": len(contents)}


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    _admin: dict = Depends(get_current_admin),
):
    """
    Upload an image file (admin only).

    Returns the public URL for the uploaded image.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file.content_type}'. Allowed: jpeg, png, gif, webp",
        )

    contents = await file.read()
    max_bytes = 10 * 1024 * 1024  # 10MB for images
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum size is 10MB",
        )

    ensure_upload_dir()

    ext = os.path.splitext(file.filename or "image.jpg")[1].lower()
    if ext not in (".jpg", ".jpeg", ".png", ".gif", ".webp"):
        ext = ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, "images", filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    # Return a relative URL so it works from any domain/environment
    url = f"/uploads/images/{filename}"
    return {"url": url, "filename": filename, "size": len(contents)}
