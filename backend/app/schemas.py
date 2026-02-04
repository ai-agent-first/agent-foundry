from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

class TraceStep(BaseModel):
    label: str
    type: str
    status: str
    timestamp: str
    duration: Optional[str] = None
    detail: Optional[str] = None

class Source(BaseModel):
    title: str
    uri: str

class MessageBase(BaseModel):
    id: str
    role: str
    content: str
    trace: Optional[List[Any]] = None
    sources: Optional[List[Source]] = None

class MessageCreate(MessageBase):
    agent_id: str

class Message(MessageBase):
    timestamp: datetime
    class Config:
        from_attributes = True

class AgentBase(BaseModel):
    id: str
    name: str
    role: str
    description: Optional[str] = None
    personality: str
    avatar: str
    skills: List[str] = []
    tools: List[str] = []
    provider: str = 'gemini'
    model: str = 'gemini-1.5-flash'

class AgentCreate(AgentBase):
    pass

class Agent(AgentBase):
    created_at: datetime
    class Config:
        from_attributes = True

class AgentWithMessages(Agent):
    messages: List[Message] = []
