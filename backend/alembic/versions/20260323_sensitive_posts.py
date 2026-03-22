"""Add sensitive column to posts

Revision ID: 20260323_sensitive_posts
Revises: 20260206_analytics_page_types
Create Date: 2026-03-23
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers
revision: str = '20260323_sensitive_posts'
down_revision: str = '20260206_analytics_page_types'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('posts', sa.Column('sensitive', sa.Boolean(), nullable=True, server_default=sa.text('false')))
    op.create_index(op.f('ix_posts_sensitive'), 'posts', ['sensitive'], unique=False)
    # Backfill existing rows
    op.execute("UPDATE posts SET sensitive = false WHERE sensitive IS NULL")


def downgrade() -> None:
    op.drop_index(op.f('ix_posts_sensitive'), table_name='posts')
    op.drop_column('posts', 'sensitive')
