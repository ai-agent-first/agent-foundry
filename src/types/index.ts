
import React from 'react';

export type ToolStatus = 'idle' | 'verifying' | 'verified' | 'error';
export type ViewMode = 'grid' | 'list';
export type TraceStepType = 'plan' | 'think' | 'act' | 'decide' | 'final' | 'init' | 'tool';

export interface TraceStep {
  label: string;
  type: TraceStepType;
  status: 'complete' | 'processing' | 'pending';
  timestamp: string;
  duration?: string;
  detail?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'intelligence' | 'creative' | 'technical';
  bundledTools?: string[];
  instruction?: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  provider: string;
  isCustom?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  personality: string;
  skills: string[];
  tools: string[];
  avatar: string;
  provider: 'gemini' | 'openai' | 'ollama';
  model: string;
  metrics?: {
    totalTokens: number;
    totalCost: number;
    details: {
      input: number;
      output: number;
    }
  };
}

export interface TokenUsage {
  input: number;
  output: number;
  total: number;
  cost?: number;
}

export interface LLMResponse {
  content: string;
  sources?: any[];
  trace?: any[];
  usage?: TokenUsage;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  sources?: { title: string; uri: string }[];
  trace?: TraceStep[];
}
