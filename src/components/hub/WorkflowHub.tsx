
import React, { useState, useMemo } from 'react';
import { Search, ListFilter, Terminal, History, GitBranch, ArrowRight, Eye, Cpu, Activity, Clock, Layers } from 'lucide-react';
import { Agent, Message } from '../../types';

interface WorkflowHubProps {
  agents: Agent[];
  messages: Record<string, Message[]>;
  onNavigateToAgent: (id: string) => void;
}

export const WorkflowHub: React.FC<WorkflowHubProps> = ({ agents, messages, onNavigateToAgent }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Aggregate all assistant executions across all agents
  const allExecutions = useMemo(() => {
    const list: any[] = [];
    Object.entries(messages).forEach(([agentId, agentMessages]) => {
      const agent = agents.find(a => a.id === agentId);
      if (!agent) return;

      const assistantMsgs = agentMessages.filter(m => m.role === 'assistant');
      assistantMsgs.forEach((m, idx) => {
        const userMsg = agentMessages.find((prev, pIdx) => pIdx < agentMessages.indexOf(m) && prev.role === 'user');
        list.push({
          id: m.id,
          agentId,
          agentName: agent.name,
          agentAvatar: agent.avatar,
          agentRole: agent.role,
          exeNum: `#EXE-${String(list.length + 1).padStart(3, '0')}`,
          prompt: userMsg?.content || 'System Call',
          timestamp: m.trace?.[0]?.timestamp || 'N/A',
          steps: m.trace?.length || 0,
          result: m.content,
          trace: m.trace || []
        });
      });
    });
    return list.sort((a, b) => b.id.localeCompare(a.id)); // Newest first
  }, [messages, agents]);

  const filteredExecutions = allExecutions.filter(e =>
    e.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.agentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col overflow-hidden animate-in fade-in duration-500">
      {/* Header Panel */}
      <div className="p-8 pb-4 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/10 rounded-lg">
                <GitBranch className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Workflow Hub</h1>
            </div>
            <p className="text-sm text-slate-500 max-w-lg">Global execution registry for multi-agent orchestration. Monitoring cognitive transitions in real-time.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search across all agents..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm w-72 focus:border-indigo-500 outline-none transition-all shadow-xl"
              />
            </div>
            <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all shadow-xl">
              <ListFilter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-8 py-4 shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-4">
          <HubStatCard icon={<Cpu />} label="Total Executions" value={allExecutions.length.toString()} color="text-indigo-400" />
          <HubStatCard icon={<Layers />} label="Active Agents" value={agents.length.toString()} color="text-emerald-400" />
          <HubStatCard icon={<Activity />} label="Avg. Latency" value="0.84s" color="text-amber-400" />
          <HubStatCard icon={<Clock />} label="System Uptime" value="14d 2h" color="text-blue-400" />
        </div>
      </div>

      {/* Index Table */}
      <div className="flex-1 overflow-hidden p-8 pt-4">
        <div className="max-w-7xl mx-auto h-full bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm">
          <div className="grid grid-cols-12 gap-4 px-8 py-5 bg-slate-900 border-b border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <div className="col-span-1">Execution ID</div>
            <div className="col-span-2">Origin Agent</div>
            <div className="col-span-4">Request Directive</div>
            <div className="col-span-1 text-center">Nodes</div>
            <div className="col-span-2">Execution Phase</div>
            <div className="col-span-2 text-right">Timestamp</div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredExecutions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 gap-6 py-20">
                <Terminal className="w-16 h-16" />
                <div className="text-center">
                  <p className="text-lg font-black uppercase tracking-widest mb-1">No Data Detected</p>
                  <p className="text-xs">Orchestration logs will appear here upon first execution.</p>
                </div>
              </div>
            ) : (
              filteredExecutions.map((exe) => (
                <div
                  key={exe.id}
                  className="grid grid-cols-12 gap-4 px-8 py-6 border-b border-slate-800/40 hover:bg-indigo-500/5 transition-all group items-center"
                >
                  <div className="col-span-1">
                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/5 px-2 py-1 rounded border border-indigo-500/20 shadow-sm">
                      {exe.exeNum}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={() => onNavigateToAgent(exe.agentId)}
                      className="flex items-center gap-2.5 text-left group/agent"
                    >
                      <img src={exe.agentAvatar} className="w-7 h-7 rounded-lg border border-slate-700 bg-slate-800" alt="" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-200 truncate group-hover/agent:text-indigo-400 transition-colors">{exe.agentName}</span>
                        <span className="text-[9px] text-slate-600 font-black uppercase truncate tracking-tighter">{exe.agentRole}</span>
                      </div>
                    </button>
                  </div>
                  <div className="col-span-4 pr-6">
                    <p className="text-xs font-medium text-slate-300 line-clamp-2 italic leading-relaxed">
                      "{exe.prompt}"
                    </p>
                  </div>
                  <div className="col-span-1 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 rounded-full border border-slate-800 text-[10px] font-mono text-emerald-400 font-bold">
                      {exe.steps}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SUCCESS_READY</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400">{exe.timestamp}</span>
                      <button
                        onClick={() => onNavigateToAgent(exe.agentId)}
                        className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-8 py-4 bg-slate-950/40 border-t border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <div className="flex gap-8">
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Telemetry: Online</span>
              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Security: Layer 4</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-indigo-400" />
              Real-time Processing Stream Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fix: Properly type the icon prop to avoid TypeScript error when cloning with className
const HubStatCard = ({ icon, label, value, color }: { icon: React.ReactElement<any>, label: string, value: string, color: string }) => (
  <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-500/30 transition-all shadow-xl backdrop-blur-sm group">
    <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 ${color} group-hover:scale-110 transition-transform`}>
      {React.cloneElement(icon, { className: "w-5 h-5" })}
    </div>
    <div className="flex flex-col">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-xl font-black text-white tracking-tight">{value}</p>
    </div>
  </div>
);
