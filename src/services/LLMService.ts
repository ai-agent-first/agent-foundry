import { TraceStep, TraceStepType, Agent, TokenUsage } from '../types';

export interface LLMResponse {
    content: string;
    sources?: { title: string; uri: string }[];
    trace: TraceStep[];
    usage?: TokenUsage;
}

export interface LLMProvider {
    sendMessage(prompt: string, agent: Agent): Promise<LLMResponse>;
}

export class LLMService {
    private static providers: Record<string, LLMProvider> = {};

    static registerProvider(name: string, provider: LLMProvider) {
        this.providers[name] = provider;
    }

    static async sendMessage(prompt: string, agent: Agent): Promise<LLMResponse> {
        const provider = this.providers[agent.provider || 'gemini'];
        if (!provider) {
            throw new Error(`Provider ${agent.provider} not found`);
        }
        return provider.sendMessage(prompt, agent);
    }

    static createStep(label: string, type: TraceStepType, detail?: string): TraceStep {
        return {
            label,
            type,
            status: 'complete',
            timestamp: new Date().toLocaleTimeString(),
            duration: `${Math.floor(Math.random() * 40 + 10)}ms`,
            detail
        };
    }

    static async executeTool(toolId: string, args: any): Promise<any> {
        try {
            // Lazy import to avoid circular dependencies if any
            const { ToolRegistry } = await import('./tools/ToolRegistry');
            return await ToolRegistry.execute(toolId, args);
        } catch (error: any) {
            console.error(`Error executing tool ${toolId}:`, error);
            return { error: error.message };
        }
    }
}
