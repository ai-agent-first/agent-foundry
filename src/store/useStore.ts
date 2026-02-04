import { create } from 'zustand';
import { Agent, Message } from '../types';
import api from '../services/api';

interface State {
    agents: Agent[];
    messages: Record<string, Message[]>;
    activeId: string;
    loading: boolean;

    fetchAgents: () => Promise<void>;
    createAgent: (agent: Agent) => Promise<void>;
    updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>;
    deleteAgent: (id: string) => Promise<void>;

    setActiveId: (id: string) => void;

    fetchMessages: () => Promise<void>;
    addMessage: (agentId: string, message: Message) => Promise<void>;

    installSkill: (agentId: string, skillId: string) => Promise<void>;
    uninstallSkill: (agentId: string, skillId: string) => Promise<void>;
    installTool: (agentId: string, toolId: string) => Promise<void>;
    uninstallTool: (agentId: string, toolId: string) => Promise<void>;

    trackUsage: (agentId: string, usage: { input: number; output: number }) => Promise<void>;
}

export const useStore = create<State>((set, get) => ({
    agents: [],
    messages: {},
    activeId: '',
    loading: false,

    fetchAgents: async () => {
        set({ loading: true });
        try {
            const { data } = await api.get('/agents');
            set({
                agents: data,
                activeId: get().activeId || data[0]?.id || ''
            });
        } finally {
            set({ loading: false });
        }
    },

    createAgent: async (agent) => {
        const { data } = await api.post('/agents', agent);
        set(state => ({ agents: [...state.agents, data] }));
    },

    updateAgent: async (id, updates) => {
        const agent = get().agents.find(a => a.id === id);
        if (!agent) return;
        const { data } = await api.put(`/agents/${id}`, { ...agent, ...updates });
        set(state => ({
            agents: state.agents.map(a => a.id === id ? data : a)
        }));
    },

    deleteAgent: async (id) => {
        await api.delete(`/agents/${id}`);
        set(state => ({
            agents: state.agents.filter(a => a.id !== id),
            activeId: state.activeId === id ? (state.agents.length > 1 ? state.agents[0].id : '') : state.activeId
        }));
    },

    setActiveId: (id) => set({ activeId: id }),

    fetchMessages: async () => {
        const { data } = await api.get('/messages');
        const grouped: Record<string, Message[]> = {};
        data.forEach((m: Message & { agent_id: string }) => {
            if (!grouped[m.agent_id]) grouped[m.agent_id] = [];
            grouped[m.agent_id].push(m);
        });
        set({ messages: grouped });
    },

    addMessage: async (agentId, message) => {
        const { data } = await api.post('/messages', { ...message, agent_id: agentId });
        set(state => ({
            messages: {
                ...state.messages,
                [agentId]: [...(state.messages[agentId] || []), data]
            }
        }));
    },

    installSkill: async (agentId, skillId) => {
        const agent = get().agents.find(a => a.id === agentId);
        if (!agent || agent.skills.includes(skillId)) return;

        let newSkills = [...agent.skills, skillId];
        let newTools = [...agent.tools];

        // Auto-install bundled tools
        const { SKILL_LIBRARY } = await import('../constants');
        const skillDef = SKILL_LIBRARY.find(s => s.id === skillId);

        if (skillDef?.bundledTools) {
            skillDef.bundledTools.forEach(toolId => {
                if (!newTools.includes(toolId)) {
                    newTools.push(toolId);
                }
            });
        }

        await get().updateAgent(agentId, { skills: newSkills, tools: newTools });
    },

    uninstallSkill: async (agentId, skillId) => {
        const agent = get().agents.find(a => a.id === agentId);
        if (!agent) return;
        const newSkills = agent.skills.filter(s => s !== skillId);
        await get().updateAgent(agentId, { skills: newSkills });
    },

    installTool: async (agentId, toolId) => {
        const agent = get().agents.find(a => a.id === agentId);
        if (!agent || agent.tools.includes(toolId)) return;
        const newTools = [...agent.tools, toolId];
        await get().updateAgent(agentId, { tools: newTools });
    },

    uninstallTool: async (agentId, toolId) => {
        const agent = get().agents.find(a => a.id === agentId);
        if (!agent) return;
        const newTools = agent.tools.filter(t => t !== toolId);
        await get().updateAgent(agentId, { tools: newTools });
    },

    trackUsage: async (agentId, usage) => {
        const agent = get().agents.find(a => a.id === agentId);
        if (!agent) return;

        const currentMetrics = agent.metrics || {
            totalTokens: 0,
            totalCost: 0,
            details: { input: 0, output: 0 }
        };

        const newMetrics = {
            totalTokens: currentMetrics.totalTokens + usage.input + usage.output,
            totalCost: currentMetrics.totalCost + ((usage.input * 0.075 + usage.output * 0.30) / 1_000_000), // Estimated Gemini Flash pricing
            details: {
                input: currentMetrics.details.input + usage.input,
                output: currentMetrics.details.output + usage.output
            }
        };

        // Optimistic update
        set(state => ({
            agents: state.agents.map(a => a.id === agentId ? { ...a, metrics: newMetrics } : a)
        }));

        // Persist
        await api.put(`/agents/${agentId}`, { ...agent, metrics: newMetrics });
    }
}));
