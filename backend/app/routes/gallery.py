"""
Gallery routes for managing gallery media.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func

from app.core.database import get_db
from app.models.gallery import GalleryMedia
from app.schemas.gallery import (
    GalleryMediaCreate,
    GalleryMediaUpdate,
    GalleryMediaResponse,
    GalleryMediaListResponse,
)
from app.dependencies import get_current_admin
from app.utils.image_processing import (
    optimize_image_base64,
    create_thumbnail_base64,
    extract_image_dimensions,
    generate_blur_placeholder,
)


router = APIRouter()


@router.get("", response_model=GalleryMediaListResponse)
async def get_gallery_media(
    response: Response,
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
    offset: int = 0,
    include_full: bool = False,  # Option to exclude full images for faster loading
):
    """
    Get all gallery media items.
    Public endpoint - anyone can view the gallery.
    
    Set include_full=False to get only thumbnails for faster initial load.
    """
    # Add cache headers for better performance
    response.headers["Cache-Control"] = "public, max-age=300, stale-while-revalidate=60"
    
    # Get total count
    count_result = await db.execute(select(func.count(GalleryMedia.id)))
    total = count_result.scalar()
    
    # Get media items ordered by order_index, then by created_at (newest first)
    result = await db.execute(
        select(GalleryMedia)
        .order_by(GalleryMedia.order_index.asc(), GalleryMedia.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    media_items = result.scalars().all()
    
    return GalleryMediaListResponse(media=media_items, total=total)


@router.get("/{media_id}", response_model=GalleryMediaResponse)
async def get_gallery_media_by_id(
    media_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a single gallery media item by ID."""
    result = await db.execute(
        select(GalleryMedia).where(GalleryMedia.id == media_id)
    )
    media = result.scalar_one_or_none()
    
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found"
        )
    
    return media


@router.post("", response_model=GalleryMediaResponse, status_code=status.HTTP_201_CREATED)
async def create_gallery_media(
    media_data: GalleryMediaCreate,
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(get_current_admin),  # Require admin authentication
):
    """
    Create a new gallery media item.
    Requires admin authentication.
    
    Automatically generates optimized thumbnail and blur placeholder for images.
    """
    thumbnail_url = media_data.thumbnail_url
    blur_placeholder = None
    width = None
    height = None
    optimized_url = media_data.url
    
    # Process images for optimization
    if media_data.media_type == "image" and media_data.url.startswith("data:image"):
        try:
            # Extract dimensions
            width, height = extract_image_dimensions(media_data.url)
            
            # Optimize the main image (max 1920x1080, quality 85)
            optimized_url = optimize_image_base64(media_data.url, max_size=(1920, 1080), quality=85)
            
            # Create thumbnail if not provided (400x400, quality 75)
            if not thumbnail_url:
                thumbnail_url = create_thumbnail_base64(media_data.url, size=(400, 400), quality=75)
            
            # Create blur placeholder for progressive loading
            blur_placeholder = generate_blur_placeholder(media_data.url)
            
        except Exception as e:
            # If optimization fails, use original
            print(f"Image optimization failed: {e}")
            optimized_url = media_data.url
    
    media = GalleryMedia(
        media_type=media_data.media_type,
        url=optimized_url,
        thumbnail_url=thumbnail_url,
        blur_placeholder=blur_placeholder,
        width=width,
        height=height,
        caption=media_data.caption,
        order_index=media_data.order_index,
    )
    
    db.add(media)
    await db.commit()
    await db.refresh(media)
    
    return media


@router.put("/{media_id}", response_model=GalleryMediaResponse)
async def update_gallery_media(
    media_id: int,
    media_data: GalleryMediaUpdate,
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(get_current_admin),
):
    """
    Update a gallery media item.
    Requires admin authentication.
    """
    result = await db.execute(
        select(GalleryMedia).where(GalleryMedia.id == media_id)
    )
    media = result.scalar_one_or_none()
    
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found"
        )
    
    # Update fields if provided
    update_data = media_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(media, field, value)
    
    await db.commit()
    await db.refresh(media)
    
    return media


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_gallery_media(
    media_id: int,
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(get_current_admin),
):
    """
    Delete a gallery media item.
    Requires admin authentication.
    """
    result = await db.execute(
        select(GalleryMedia).where(GalleryMedia.id == media_id)
    )
    media = result.scalar_one_or_none()
    
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media not found"
        )
    
    await db.delete(media)
    await db.commit()
    
    return None


@router.post("/reorder", status_code=status.HTTP_200_OK)
async def reorder_gallery_media(
    order: list[dict],  # List of {id: int, order_index: int}
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(get_current_admin),
):
    """
    Reorder gallery media items.
    Requires admin authentication.
    """
    for item in order:
        media_id = item.get("id")
        order_index = item.get("order_index")
        
        if media_id is not None and order_index is not None:
            result = await db.execute(
                select(GalleryMedia).where(GalleryMedia.id == media_id)
            )
            media = result.scalar_one_or_none()
            if media:
                media.order_index = order_index
    
    await db.commit()
    
    return {"message": "Gallery reordered successfully"}
