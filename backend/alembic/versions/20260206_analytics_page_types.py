"""Add page_type, resource_id, referrer to analytics

Revision ID: 20260206_analytics_page_types
Revises: 20260202_messages
Create Date: 2026-02-06 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20260206_analytics_page_types'
down_revision: Union[str, None] = '20260202_messages'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to analytics table
    op.add_column('analytics', sa.Column('page_type', sa.String(50), nullable=True, server_default='post'))
    op.add_column('analytics', sa.Column('resource_id', sa.Integer(), nullable=True))
    op.add_column('analytics', sa.Column('referrer', sa.Text(), nullable=True))
    
    # Create indexes for new columns
    op.create_index(op.f('ix_analytics_page_type'), 'analytics', ['page_type'], unique=False)
    op.create_index(op.f('ix_analytics_resource_id'), 'analytics', ['resource_id'], unique=False)
    op.create_index(op.f('ix_analytics_session_id'), 'analytics', ['session_id'], unique=False)
    
    # Backfill existing records: set resource_id = post_id for existing entries
    op.execute("UPDATE analytics SET resource_id = post_id WHERE post_id IS NOT NULL")
    op.execute("UPDATE analytics SET page_type = 'post' WHERE page_type IS NULL")


def downgrade() -> None:
    op.drop_index(op.f('ix_analytics_session_id'), table_name='analytics')
    op.drop_index(op.f('ix_analytics_resource_id'), table_name='analytics')
    op.drop_index(op.f('ix_analytics_page_type'), table_name='analytics')
    op.drop_column('analytics', 'referrer')
    op.drop_column('analytics', 'resource_id')
    op.drop_column('analytics', 'page_type')
