
import React, { useMemo } from 'react';
import {
  Activity,
  Users,
  Zap,
  Clock,
  ShieldCheck,
  ArrowUpRight,
  TrendingUp,
  Server,
  Globe,
  Cpu,
  Search,
  MessageSquare,
  Bot
} from 'lucide-react';
import { Agent, Message } from '../../types';

interface DashboardProps {
  agents: Agent[];
  messages: Record<string, Message[]>;
  onNavigateToAgent: (id: string) => void;
  onNavigateToHub: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ agents, messages, onNavigateToAgent, onNavigateToHub }) => {
  const totalExecutions = useMemo(() => {
    return Object.values(messages).reduce((acc, msgs) => acc + msgs.filter(m => m.role === 'assistant').length, 0);
  }, [messages]);

  const recentExecutions = useMemo(() => {
    const all = [];
    for (const [agentId, msgs] of Object.entries(messages)) {
      const agent = agents.find(a => a.id === agentId);
      if (!agent) continue;
      const assistantMsgs = msgs.filter(m => m.role === 'assistant');
      assistantMsgs.forEach(m => {
        all.push({
          id: m.id,
          agentName: agent.name,
          agentAvatar: agent.avatar,
          content: m.content,
          timestamp: m.trace?.[0]?.timestamp || 'Now'
        });
      });
    }
    return all.sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);
  }, [messages, agents]);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-8 space-y-8 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white tracking-tight">System Overview</h1>
            <p className="text-slate-500 font-medium">Foundry v2.1.0 Operational Status: <span className="text-emerald-500 font-black">OPTIMAL</span></p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-400">
              <Server className="w-3.5 h-3.5" /> Region: US-EAST-1
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Security: SECURED
            </div>
          </div>
        </div>

        {/* Major KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard icon={<Users className="text-indigo-400" />} label="Total Agents" value={agents.length.toString()} trend="+2 this week" />
          <StatCard icon={<Zap className="text-amber-400" />} label="Executions" value={totalExecutions.toString()} trend="+12% activity" />
          <StatCard icon={<Activity className="text-emerald-400" />} label="Avg Latency" value="0.84s" trend="-50ms improvement" />
          <StatCard icon={<Clock className="text-blue-400" />} label="Uptime" value="99.99%" trend="Stable" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Recent Global Activity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-widest text-[10px]">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Global Intelligence Stream
              </h3>
              <button onClick={onNavigateToHub} className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-all uppercase tracking-widest">
                Explore Hub <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800 shadow-2xl">
              {recentExecutions.length === 0 ? (
                <div className="py-24 text-center space-y-4 opacity-30">
                  <Activity className="w-12 h-12 mx-auto animate-pulse" />
                  <p className="text-sm font-bold uppercase tracking-widest">No Activity Records Yet</p>
                </div>
              ) : (
                recentExecutions.map(exe => (
                  <div key={exe.id} className="p-6 hover:bg-slate-800/20 transition-all flex gap-4 group">
                    <img src={exe.agentAvatar} className="w-10 h-10 rounded-xl border border-slate-700 shrink-0" alt="" />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-white">{exe.agentName}</span>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">{exe.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-1 italic">"{exe.content}"</p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-all text-indigo-400 p-2">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Agent Health Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-widest text-[10px]">
              <Bot className="w-4 h-4 text-emerald-400" />
              Agent Core Health
            </h3>
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              {agents.map(agent => (
                <div key={agent.id} className="flex items-center justify-between p-3 bg-slate-950/40 rounded-2xl border border-slate-800/50 hover:border-indigo-500/30 transition-all group cursor-pointer" onClick={() => onNavigateToAgent(agent.id)}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={agent.avatar} className="w-8 h-8 rounded-lg" alt="" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white">{agent.name}</span>
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">{agent.role}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="h-1 w-12 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[90%]" />
                    </div>
                    <span className="text-[8px] font-mono text-emerald-500 mt-1 uppercase font-black">Online</span>
                  </div>
                </div>
              ))}
              {agents.length === 0 && <p className="text-xs text-slate-500 italic text-center py-4">No agents deployed.</p>}
            </div>

            {/* Platform Distribution Card */}
            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Resource Allocation</h4>
              </div>
              <div className="space-y-3">
                <ProgressItem label="Neural Processing" value={65} color="bg-indigo-500" />
                <ProgressItem label="Tool Execution" value={32} color="bg-emerald-500" />
                <ProgressItem label="Context Memory" value={18} color="bg-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Global Footer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/50">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-slate-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grounding Network</span>
              <span className="text-xs font-bold text-slate-300">Google Search & Maps: READY</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Search className="text-slate-500 w-5 h-5" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Tokens Processed</span>
              <span className="text-xs font-bold text-slate-300">1.2M Units</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MessageSquare className="text-slate-500 w-5 h-5" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Average Sentiment</span>
              <span className="text-xs font-bold text-emerald-400">POSITIVE (0.92)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Fix: Properly type the icon prop to avoid TypeScript error when cloning with className
const StatCard = ({ icon, label, value, trend }: { icon: React.ReactElement<any>, label: string, value: string, trend: string }) => (
  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl hover:border-indigo-500/30 transition-all shadow-xl backdrop-blur-sm group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
      <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase">{trend}</span>
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-black text-white tracking-tight">{value}</p>
    </div>
  </div>
);

const ProgressItem = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
      <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }} />
    </div>
  </div>
);
