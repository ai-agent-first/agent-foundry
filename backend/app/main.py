import os
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from .db.session import engine, Base, get_db
from . import models, schemas
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import aiohttp

load_dotenv()

app = FastAPI(title="Agent Foundry API")

# --- Proxy for Local Ollama ---
@app.get("/proxy/ollama/tags")
async def get_ollama_tags():
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://127.0.0.1:11434/api/tags") as resp:
                if resp.status != 200:
                    return {"models": []}
                data = await resp.json()
                return data
    except Exception as e:
        print(f"Ollama fetch error: {e}")
        return {"models": []}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    # Attempt to create database if it doesn't exist
    from .db.session import DATABASE_URL
    import sqlalchemy
    from urllib.parse import urlparse
    
    # Extract DB name and connection info
    if "sqlite" in DATABASE_URL:
        print("Using SQLite database. Skipping manual DB creation.")
    else:
        # mysql+aiomysql://root:rootpass@127.0.0.1:3306/agent_foundry
        try:
            tmp_url = DATABASE_URL.replace("mysql+aiomysql", "mysql+pymysql") # pymysql for sync creation
            u = urlparse(tmp_url)
            db_name = u.path.lstrip('/')
            base_url = f"{u.scheme}://{u.netloc}/"
            
            # Connect to MySQL server without database
            engine_sync = sqlalchemy.create_engine(base_url)
            with engine_sync.connect() as conn:
                conn.execute(sqlalchemy.text(f"CREATE DATABASE IF NOT EXISTS {db_name}"))
            engine_sync.dispose()
        except Exception as e:
            print(f"Database creation failed (may already exist or insufficient permissions): {e}")

    # Create tables on startup (In production, use Alembic)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/agents", response_model=List[schemas.Agent])
async def get_agents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Agent))
    return result.scalars().all()

@app.post("/agents", response_model=schemas.Agent)
async def create_agent(agent: schemas.AgentCreate, db: AsyncSession = Depends(get_db)):
    db_agent = models.Agent(**agent.dict())
    db.add(db_agent)
    await db.commit()
    await db.refresh(db_agent)
    return db_agent

@app.get("/agents/{agent_id}", response_model=schemas.AgentWithMessages)
async def get_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Agent).where(models.Agent.id == agent_id))
    db_agent = result.scalar_one_or_none()
    if not db_agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return db_agent

@app.put("/agents/{agent_id}", response_model=schemas.Agent)
async def update_agent(agent_id: str, agent_update: schemas.AgentCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Agent).where(models.Agent.id == agent_id))
    db_agent = result.scalar_one_or_none()
    if not db_agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    for var, value in agent_update.dict().items():
        setattr(db_agent, var, value)
    
    await db.commit()
    await db.refresh(db_agent)
    return db_agent

@app.delete("/agents/{agent_id}")
async def delete_agent(agent_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Agent).where(models.Agent.id == agent_id))
    db_agent = result.scalar_one_or_none()
    if not db_agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    await db.delete(db_agent)
    await db.commit()
    return {"detail": "Agent deleted"}

@app.get("/messages", response_model=List[schemas.Message])
async def get_messages(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Message).order_by(models.Message.id.desc()))
    return result.scalars().all()

@app.post("/messages", response_model=schemas.Message)
async def create_message(message: schemas.MessageCreate, db: AsyncSession = Depends(get_db)):
    db_message = models.Message(**message.dict())
    db.add(db_message)
    await db.commit()
    await db.refresh(db_message)
    return db_message

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8021)
