import os
import logging
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("cura.database")

DATABASE_URL = os.getenv(
    "DATABASE_URL_POOLED",
    os.getenv(
        "DATABASE_URL",
        "postgresql://neondb_owner:npg_FZfhy1jlct8d@ep-fragrant-pond-baeww0e3-pooler.c-8.eu-central-1.aws.neon.tech/neondb?sslmode=require"
    )
)

def get_connection_string(async_driver: bool = True) -> str:
    """
    Returns standard PostgreSQL connection string formatted for either
    asyncpg (asyncio) or standard psycopg2 (synchronous).
    """
    url = DATABASE_URL
    if async_driver:
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return url

def test_neon_connection() -> bool:
    """
    Quick connectivity check to Neon Serverless PostgreSQL.
    """
    import psycopg2
    try:
        # Strip async prefix if present for psycopg2 check
        sync_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
        conn = psycopg2.connect(sync_url)
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()[0]
        cur.close()
        conn.close()
        logger.info(f"Connected to Neon PostgreSQL successfully: {version}")
        return True
    except Exception as e:
        logger.error(f"Failed to connect to Neon PostgreSQL: {e}")
        return False
