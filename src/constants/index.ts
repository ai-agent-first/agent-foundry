
import { Skill, Tool } from '../types';

export const SKILL_LIBRARY: Skill[] = [
  // --- Core Intelligence ---
  {
    id: 'deep_reasoning',
    name: 'Deep Reasoning',
    description: 'Enable chain-of-thought processing for complex logic.',
    icon: 'Brain',
    category: 'intelligence',
    instruction: 'CRITICAL SOP: Before answering, you must perform a step-by-step reasoning process. Output "Thought: [Your reasoning]" before your final answer.'
  },

  // --- Technical & Engineering ---
  {
    id: 'code_gen',
    name: 'Code Expert',
    description: 'Advanced technical expertise for multi-language coding.',
    icon: 'Code',
    category: 'technical'
  },
  {
    id: 'data_engineer',
    name: 'Data Engineering Specialist',
    description: 'Expert in data transformation, cleaning, and mapping.',
    icon: 'Database',
    category: 'technical',
    bundledTools: ['excel_suite', 'data_normalizer', 'mapping_gateway'],
    instruction: 'CRITICAL SOP: precision is key. 1. If receiving raw data, use [data_normalizer] FIRST to standardize formats (especially dates and names). 2. Then use [mapping_gateway] if the user needs to transform schema. 3. Finally, use [excel_suite] to output the result if requested.'
  },

  // --- Financial & Compliance ---
  {
    id: 'financial_analyst',
    name: 'Financial Analyst',
    description: 'Expert financial capability with automated regulatory checks.',
    icon: 'Landmark',
    category: 'technical',
    bundledTools: ['excel_suite', 'starcheck'],
    instruction: 'CRITICAL SOP: When handling financial data, YOU MUST first use [excel_suite] to standardize the dataset, and then IMMEDIATELY use [starcheck] to perform risk assessment. Do not skip the risk assessment step.'
  },
  {
    id: 'compliance_officer',
    name: 'Compliance Officer',
    description: 'Ensures all business actions adhere to regulatory rules.',
    icon: 'ShieldCheck',
    category: 'technical',
    bundledTools: ['rule_engine', 'starcheck'],
    instruction: 'CRITICAL SOP: For any transaction or profile review: 1. Run [starcheck] to get the risk score. 2. Feed the score and details into [rule_engine]. 3. Output the final Compliance Verdict (PASS/FAIL) based on the rule engine result.'
  },

  // --- Creative & Communication ---
  {
    id: 'creative_vision',
    name: 'Creative Vision',
    description: 'Sophisticated image and visual concept generation.',
    icon: 'ImageIcon',
    category: 'creative',
    bundledTools: ['vision_ai']
  },
  {
    id: 'email_drafter',
    name: 'Communication Specialist',
    description: 'Expert in professional communication with strict draft-before-send protocol.',
    icon: 'MessageSquareShare',
    category: 'creative',
    bundledTools: ['email.send', 'comm_hub'],
    instruction: 'CRITICAL SOP: When asked to send an email, DO NOT generate the tool call immediately. 1. First, generate the full Subject and Body Draft and show it to the user. 2. Ask "Ready to send?". 3. ONLY after the user explicitly confirms, generate the {"tool": "email.send", ...} JSON.'
  },

  // --- Specialized Testing ---
  {
    id: 'security_login',
    name: 'Security Access Manager',
    description: 'Specialized skill for handling login, authentication, and access control flows.',
    icon: 'Shield',
    category: 'technical',
    bundledTools: ['email.send'],
    instruction: 'CRITICAL SOP: You are the Security Manager. When asked to perform any login or access action, you MUST first output: "[Security Check] Verifying User Identity...". Do not proceed without this check.'
  }
];

export const TOOL_PLATFORM: Tool[] = [
  // Existing Grounding Tools
  { id: 'web_search', name: 'Google Search', description: 'Live web grounding and real-time news retrieval.', icon: 'Globe', provider: 'Google' },
  { id: 'google_maps', name: 'Spatial Intelligence', description: 'Location services, routing and place discovery.', icon: 'MapIcon', provider: 'Google Cloud' },

  // KYX Platform v2.1.0 Integrated Tools
  {
    id: 'excel_suite',
    name: 'Excel Processor Suite',
    description: 'Enterprise Excel handling: Multi-sheet processing, XML filling, and template adaptation.',
    icon: 'FileSpreadsheet',
    provider: 'KYX Platform'
  },
  {
    id: 'vision_ai',
    name: 'Vision Intelligence',
    description: 'Advanced computer vision: Face comparison, liveness check, and OCR (Text/MRZ) recognition.',
    icon: 'ScanEye',
    provider: 'KYX Platform'
  },
  {
    id: 'data_normalizer',
    name: 'Data Normalizer',
    description: 'Japanese data specialist: Furigana conversion and standardization (11 modules/69 operations).',
    icon: 'Languages',
    provider: 'KYX Platform'
  },
  {
    id: 'rule_engine',
    name: 'Business Rule Engine',
    description: 'Logic orchestration: Rules execution, retail check, and structured payload validation.',
    icon: 'ShieldCheck',
    provider: 'KYX Platform'
  },
  {
    id: 'mapping_gateway',
    name: 'Mapping Gateway',
    description: 'Configuration sync: Data mapping extraction, diff comparison, and config generation.',
    icon: 'Workflow',
    provider: 'KYX Platform'
  },
  {
    id: 'comm_hub',
    name: 'Communication Hub',
    description: 'Unified messaging: Email, Gmail integration, and multi-channel notification push.',
    icon: 'MessageSquareShare',
    provider: 'KYX Platform'
  },
  {
    id: 'starcheck',
    name: 'StarCheck Analysis',
    description: 'Risk & Insight: Feature extraction and proprietary credit scoring analysis engine.',
    icon: 'Star',
    provider: 'KYX Platform'
  }
];

export const AVAILABLE_ICONS = [
  'Globe', 'MapIcon', 'Terminal', 'Database', 'Cpu', 'Brain',
  'Zap', 'Wrench', 'Shield', 'FlaskConical', 'FileSpreadsheet',
  'ScanEye', 'Languages', 'ShieldCheck', 'Workflow', 'MessageSquareShare', 'Star', 'ImageIcon', 'Landmark'
];
