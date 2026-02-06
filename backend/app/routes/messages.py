"""
Message routes for CRUD operations on personal messages.
"""

import re
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.message import Message, generate_slug
from app.schemas.message import MessageCreate, MessageUpdate, MessageResponse, MessageListResponse
from app.dependencies.auth import get_current_admin

router = APIRouter()


@router.get("", response_model=MessageListResponse)
async def get_messages(
    response: Response,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    include_unpublished: bool = Query(False, description="Include unpublished messages (admin only)"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all messages with pagination.
    
    By default, only returns published messages.
    Use include_unpublished=true for admin view.
    """
    # Add cache headers
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=30"
    
    # Build query based on publish status
    if include_unpublished:
        query = select(Message)
    else:
        query = select(Message).where(Message.published == True)
    
    # Order by creation date (newest first)
    query = query.order_by(Message.created_at.desc())
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # Apply pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    messages = result.scalars().all()
    
    total_pages = (total + page_size - 1) // page_size
    
    return MessageListResponse(
        messages=[MessageResponse.model_validate(msg) for msg in messages],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/slug/{slug}", response_model=MessageResponse)
async def get_message_by_slug(
    slug: str,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """
    Get a single message by slug.
    
    Returns the message if it exists and is published.
    """
    # Add cache headers
    response.headers["Cache-Control"] = "public, max-age=300, stale-while-revalidate=60"
    
    result = await db.execute(select(Message).where(Message.slug == slug))
    message = result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    
    if not message.published:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    
    return MessageResponse.model_validate(message)


@router.get("/{message_id}", response_model=MessageResponse)
async def get_message(
    message_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Get a single message by ID.
    """
    result = await db.execute(select(Message).where(Message.id == message_id))
    message = result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    
    return MessageResponse.model_validate(message)


@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    message_data: MessageCreate,
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """
    Create a new message (admin only).
    
    Requires JWT authentication.
    Automatically generates slug from title.
    """
    # Generate slug from title
    base_slug = generate_slug(message_data.title)
    slug = base_slug
    
    # Ensure slug is unique
    counter = 1
    while True:
        existing = await db.execute(select(Message).where(Message.slug == slug))
        if not existing.scalar_one_or_none():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    # Auto-generate excerpt if not provided
    excerpt = message_data.excerpt
    if not excerpt and message_data.content:
        # Strip HTML tags for plain text excerpt
        plain_text = re.sub(r'<[^>]+>', '', message_data.content)
        excerpt = plain_text[:200] + "..." if len(plain_text) > 200 else plain_text
    
    message = Message(
        title=message_data.title,
        slug=slug,
        content=message_data.content,
        excerpt=excerpt,
        published=message_data.published,
    )
    
    db.add(message)
    await db.commit()
    await db.refresh(message)
    
    return MessageResponse.model_validate(message)


@router.put("/{message_id}", response_model=MessageResponse)
async def update_message(
    message_id: int,
    message_data: MessageUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """
    Update an existing message (admin only).
    
    Requires JWT authentication.
    Updates slug if title changes.
    """
    result = await db.execute(select(Message).where(Message.id == message_id))
    message = result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    
    update_data = message_data.model_dump(exclude_unset=True)
    
    # If title is being updated, regenerate slug
    if "title" in update_data:
        base_slug = generate_slug(update_data["title"])
        slug = base_slug
        
        # Ensure slug is unique (excluding current message)
        counter = 1
        while True:
            existing = await db.execute(
                select(Message).where(Message.slug == slug, Message.id != message_id)
            )
            if not existing.scalar_one_or_none():
                break
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        message.slug = slug
    
    for field, value in update_data.items():
        setattr(message, field, value)
    
    await db.commit()
    await db.refresh(message)
    
    return MessageResponse.model_validate(message)


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: dict = Depends(get_current_admin),
):
    """
    Delete a message (admin only).
    
    Requires JWT authentication.
    """
    result = await db.execute(select(Message).where(Message.id == message_id))
    message = result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    
    await db.delete(message)
    await db.commit()
    
    return None


@router.post("/{message_id}/view", status_code=status.HTTP_200_OK)
async def increment_view_count(
    message_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Increment the view count for a message.
    """
    result = await db.execute(select(Message).where(Message.id == message_id))
    message = result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found",
        )
    
    message.view_count = (message.view_count or 0) + 1
    await db.commit()
    
    return {"view_count": message.view_count}
