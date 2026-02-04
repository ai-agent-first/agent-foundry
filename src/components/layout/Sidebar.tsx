
import React from 'react';
import { Plus, ChevronRight, User, LayoutDashboard, GitBranch, Database, Cpu, Search, Activity } from 'lucide-react';
import { Agent } from '../../types';

interface SidebarProps {
  agents: Agent[];
  activeId: string;
  currentView: 'dashboard' | 'hub' | 'agent' | 'config' | 'tools';
  isOpen: boolean;
  onSelectView: (view: 'dashboard' | 'hub' | 'agent' | 'config' | 'tools') => void;
  onSelectAgent: (id: string) => void;
  onCreateAgent: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  agents, activeId, currentView, isOpen, onSelectView, onSelectAgent, onCreateAgent
}) => {
  return (
    <aside className={`${isOpen ? 'w-72' : 'w-0'} transition-all duration-300 border-r border-slate-800/60 bg-slate-900/40 flex flex-col overflow-hidden shrink-0 z-20`}>
      {/* Brand */}
      <div className="p-6 pb-2 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-400/30">
          <BotIcon className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-black tracking-tighter bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">FOUNDRY</h1>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-6 space-y-8">
        {/* Navigation Group: PLATFORM */}
        <section className="space-y-1">
          <p className="px-3 text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Orchestration</p>
          <SidebarNavItem
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="Dashboard"
            active={currentView === 'dashboard'}
            onClick={() => onSelectView('dashboard')}
          />
          <SidebarNavItem
            icon={<GitBranch className="w-4 h-4" />}
            label="Workflow Hub"
            active={currentView === 'hub'}
            onClick={() => onSelectView('hub')}
            badge={agents.length > 0 ? "LIVE" : undefined}
          />
          <SidebarNavItem
            icon={<Database className="w-4 h-4" />}
            label="Global Tools"
            active={currentView === 'tools'}
            onClick={() => onSelectView('tools')}
          />
        </section>

        {/* Navigation Group: AGENTS */}
        <section className="space-y-1">
          <div className="px-3 flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Agents</p>
            <button
              onClick={onCreateAgent}
              className="p-1 hover:bg-slate-800 rounded-md text-indigo-400 transition-colors"
              title="New Agent"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            {agents.length === 0 && (
              <div className="px-3 py-4 border border-dashed border-slate-800 rounded-xl text-center">
                <p className="text-[10px] text-slate-600 italic">No agents deployed.</p>
              </div>
            )}
            {agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => onSelectAgent(agent.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all group ${activeId === agent.id && currentView !== 'hub' && currentView !== 'dashboard'
                  ? 'bg-indigo-600/10 ring-1 ring-indigo-500/40'
                  : 'hover:bg-slate-800/50'
                  }`}
              >
                <div className="relative">
                  <img src={agent.avatar} className="w-8 h-8 rounded-lg bg-slate-800 p-0.5" alt="" />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900 ${activeId === agent.id ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                </div>
                <div className="flex-1 text-left truncate">
                  <p className={`font-bold text-xs ${activeId === agent.id && currentView !== 'hub' && currentView !== 'dashboard' ? 'text-white' : 'text-slate-400'}`}>
                    {agent.name}
                  </p>
                  <p className="text-[9px] text-slate-600 font-medium uppercase tracking-tighter truncate">{agent.role}</p>
                </div>
                {activeId === agent.id && currentView !== 'hub' && currentView !== 'dashboard' && <Activity className="w-3 h-3 text-indigo-400 animate-pulse" />}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 shrink-0">
        <div className="flex items-center gap-3 p-3 bg-slate-950/40 rounded-xl border border-slate-800/50 group cursor-default">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-500 group-hover:text-indigo-400 transition-colors">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-white tracking-widest uppercase">Kernel Mode</p>
            <p className="text-[9px] text-slate-500 font-mono truncate">FOUNDRY_v2.1.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

const SidebarNavItem = ({ icon, label, active, onClick, badge }: { icon: any, label: string, active: boolean, onClick: () => void, badge?: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
      }`}
  >
    {icon}
    <span className="text-xs font-bold tracking-tight flex-1 text-left">{label}</span>
    {badge && <span className="text-[8px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full font-black animate-pulse">{badge}</span>}
  </button>
);

const BotIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>;
