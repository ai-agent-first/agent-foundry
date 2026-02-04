from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .db.session import Base

class Agent(Base):
    __tablename__ = "agents"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    description = Column(Text)
    personality = Column(Text)
    avatar = Column(String(500))
    skills = Column(JSON)  # Store as JSON list
    tools = Column(JSON)   # Store as JSON list
    provider = Column(String(50), nullable=False, default='gemini')
    model = Column(String(100), nullable=False, default='gemini-1.5-flash')
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    messages = relationship("Message", back_populates="agent", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String(50), primary_key=True, index=True)
    agent_id = Column(String(50), ForeignKey("agents.id"), nullable=False)
    role = Column(String(50), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    trace = Column(JSON)  # Store processing trace
    sources = Column(JSON) # Store grounding sources
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    agent = relationship("Agent", back_populates="messages")
