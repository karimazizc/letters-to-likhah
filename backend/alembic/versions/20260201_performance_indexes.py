"""Add performance indexes and gallery optimization fields

Revision ID: 20260201_performance_indexes
Revises: 20260131_000001_initial_migration
Create Date: 2026-02-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20260201_performance_indexes'
down_revision: Union[str, None] = '20260131_000001_initial_migration'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to gallery_media table
    op.add_column('gallery_media', sa.Column('blur_placeholder', sa.Text(), nullable=True))
    op.add_column('gallery_media', sa.Column('width', sa.Integer(), nullable=True))
    op.add_column('gallery_media', sa.Column('height', sa.Integer(), nullable=True))
    
    # Add performance indexes for gallery_media
    op.create_index('idx_gallery_media_order_index', 'gallery_media', ['order_index'], unique=False)
    op.create_index('idx_gallery_media_created_at', 'gallery_media', ['created_at'], unique=False)
    
    # Add performance indexes for posts
    op.create_index('idx_posts_created_at', 'posts', ['created_at'], unique=False, if_not_exists=True)
    op.create_index('idx_posts_is_published', 'posts', ['is_published'], unique=False, if_not_exists=True)
    
    # Add performance indexes for analytics
    op.create_index('idx_analytics_timestamp', 'analytics', ['timestamp'], unique=False, if_not_exists=True)
    op.create_index('idx_analytics_post_id', 'analytics', ['post_id'], unique=False, if_not_exists=True)
    op.create_index('idx_analytics_ip_session', 'analytics', ['ip_address', 'session_id'], unique=False, if_not_exists=True)


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_analytics_ip_session', table_name='analytics')
    op.drop_index('idx_analytics_post_id', table_name='analytics')
    op.drop_index('idx_analytics_timestamp', table_name='analytics')
    op.drop_index('idx_posts_is_published', table_name='posts')
    op.drop_index('idx_posts_created_at', table_name='posts')
    op.drop_index('idx_gallery_media_created_at', table_name='gallery_media')
    op.drop_index('idx_gallery_media_order_index', table_name='gallery_media')
    
    # Drop columns
    op.drop_column('gallery_media', 'height')
    op.drop_column('gallery_media', 'width')
    op.drop_column('gallery_media', 'blur_placeholder')
