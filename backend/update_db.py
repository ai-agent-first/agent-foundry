
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    user = os.getenv("DB_USER", "root")
    password = os.getenv("DB_PASS", "rootpass")
    host = os.getenv("DB_HOST", "127.0.0.1")
    port = os.getenv("DB_PORT", "3306")
    db_name = os.getenv("DB_NAME", "agent_foundry")
    DATABASE_URL = f"mysql+aiomysql://{user}:{password}@{host}:{port}/{db_name}"

async def upgrade_db():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        print("Checking 'agents' table schema...")
        try:
            await conn.execute(text("ALTER TABLE agents ADD COLUMN provider VARCHAR(50) NOT NULL DEFAULT 'gemini'"))
            print("Added 'provider' column.")
        except Exception as e:
            print(f"Provider column might exist: {e}")

        try:
            await conn.execute(text("ALTER TABLE agents ADD COLUMN model VARCHAR(100) NOT NULL DEFAULT 'gemini-1.5-flash'"))
            print("Added 'model' column.")
        except Exception as e:
            print(f"Model column might exist: {e}")
        
        await conn.commit()
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(upgrade_db())
