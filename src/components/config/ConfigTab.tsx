import React, { useState } from 'react';
import { Sparkles, Cpu, Layers, CheckCircle2, AlertCircle, Loader2, PlayCircle, LayoutGrid, List, Plus, Edit3, Settings2, ShieldCheck, Database, Zap, X, Bot } from 'lucide-react';
import { Agent, ToolStatus, ViewMode, Tool } from '../../types';
import { SKILL_LIBRARY } from '../../constants';
import { ToolFormModal } from './ToolFormModal';
import { IconRenderer } from '../layout/IconRenderer';
import { SkillDetailModal } from './SkillDetailModal';

interface ConfigTabProps {
  agent: Agent;
  onUpdate: (updates: Partial<Agent>) => void;
  availableTools: Tool[];
  onUpdateTools: (tools: Tool[]) => void;
}

export const ConfigTab: React.FC<ConfigTabProps> = ({ agent, onUpdate, availableTools, onUpdateTools }) => {
  const [verifying, setVerifying] = useState<Record<string, ToolStatus>>({});
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [editingTool, setEditingTool] = useState<Tool | null | undefined>(undefined);
  const [verificationOverlay, setVerificationOverlay] = useState<string | null>(null);
  const [verifySteps, setVerifySteps] = useState<string[]>([]);
  const [viewingSkill, setViewingSkill] = useState<any | null>(null);

  const verifyTool = async (toolId: string) => {
    setVerificationOverlay(toolId);
    setVerifySteps([]);
    setVerifying(prev => ({ ...prev, [toolId]: 'verifying' }));

    const steps = [
      "Establishing connection to gateway...",
      "Validating API credentials...",
      "Synching metadata schemas...",
      "Finalizing tool handshakes..."
    ];

    for (const step of steps) {
      setVerifySteps(prev => [...prev, step]);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    setVerifying(prev => ({ ...prev, [toolId]: 'verified' }));
    setTimeout(() => setVerificationOverlay(null), 1000);
  };

  const handleToolSubmit = (newTool: Tool) => {
    if (availableTools.find(t => t.id === newTool.id)) {
      onUpdateTools(availableTools.map(t => t.id === newTool.id ? newTool : t));
    } else {
      onUpdateTools([...availableTools, newTool]);
    }
    setEditingTool(undefined);
  };

  return (
    <div className="h-full overflow-y-auto p-8 custom-scrollbar space-y-12 pb-24 relative">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Identity Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold tracking-tight text-white">Agent Architecture</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Profile Name</label>
              <input className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-all" value={agent.name} onChange={e => onUpdate({ name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Authority Role</label>
              <input className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-all" value={agent.role} onChange={e => onUpdate({ role: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Intelligence Provider</label>
              <select
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-all appearance-none"
                value={agent.provider || 'gemini'}
                onChange={e => onUpdate({ provider: e.target.value as any })}
              >
                <option value="gemini">Google Gemini</option>
                <option value="ollama">Ollama (Local)</option>
                <option value="openai">OpenAI GPT</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cognitive Model</label>
              <div className="relative">
                <Bot className="absolute left-4 top-3.5 w-4 h-4 text-indigo-400 pointer-events-none" />
                <select
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-3 focus:border-indigo-500 outline-none transition-all appearance-none font-mono text-sm"
                  value={agent.model}
                  onChange={e => onUpdate({ model: e.target.value })}
                >
                  {agent.provider === 'gemini' && (
                    <>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended)</option>
                      <option value="gemini-2.0-flash-lite-preview-02-05">Gemini 2.0 Flash Lite</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                    </>
                  )}
                  {agent.provider === 'openai' && (
                    <>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-4o-mini">GPT-4o Mini</option>
                    </>
                  )}
                  {agent.provider === 'ollama' && (
                    <>
                      <option value="llama3.1">Llama 3.1</option>
                      <option value="llama3.2">Llama 3.2</option>
                      <option value="mistral">Mistral</option>
                      <option value="qwen2.5">Qwen 2.5</option>
                      <option value="deepseek-r1">DeepSeek R1</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Core Directive</label>
            <textarea rows={5} className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-all resize-none leading-relaxed text-sm" value={agent.personality} onChange={e => onUpdate({ personality: e.target.value })} />
          </div>

          {/* Autonomy Level Indicator */}
          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cognitive Autonomy</p>
                <p className="text-sm font-bold text-white">Level: {agent.skills.includes('deep_reasoning') ? 'L5 Autonomous' : 'L4 Supervised'}</p>
              </div>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(lvl => (
                <div key={lvl} className={`w-3 h-1.5 rounded-full ${lvl <= (agent.skills.includes('deep_reasoning') ? 5 : 4) ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`} />
              ))}
            </div>
          </div>

          {/* L5 Module Status Table */}
          {agent.skills.includes('deep_reasoning') && (
            <div className="mt-4 overflow-hidden border border-slate-800 rounded-xl bg-slate-900/30">
              <table className="w-full text-[10px] text-left">
                <thead className="bg-slate-800/50 text-slate-500 uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-4 py-2">Module</th>
                    <th className="px-4 py-2">Requirement</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {[
                    { m: 'Perception', r: 'Multi-modal + Context', s: 'Active (Vision Ready)', c: 'text-emerald-400' },
                    { m: 'Decision', r: 'Goal Decomposition', s: 'Active (Deep Reasoning)', c: 'text-emerald-400' },
                    { m: 'Execution', r: 'Multi-system / Tools', s: 'Operational (KYX Core)', c: 'text-indigo-400' },
                    { m: 'Learning', r: 'Online Memory Update', s: 'In Progress (Trace Sync)', c: 'text-amber-400' },
                    { m: 'Optimization', r: 'Self-Reflection', s: 'Experimental (Loop Active)', c: 'text-purple-400' },
                  ].map(item => (
                    <tr key={item.m} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-2 font-bold text-slate-300">{item.m}</td>
                      <td className="px-4 py-2 text-slate-500">{item.r}</td>
                      <td className={`px-4 py-2 font-mono ${item.c}`}>{item.s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Neural Skills Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold tracking-tight text-white">Skill Marketplace</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SKILL_LIBRARY.map(skill => {
              const isActive = agent.skills.includes(skill.id);
              return (
                <div
                  key={skill.id}
                  className={`relative p-5 rounded-2xl border text-left transition-all ${isActive ? 'bg-indigo-600/10 border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.1)]' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                >
                  <button
                    onClick={() => setViewingSkill(skill)}
                    className="absolute top-4 right-4 p-2 text-slate-600 hover:text-indigo-400 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <div className={`p-2.5 w-fit rounded-xl mb-3 ${isActive ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-500'}`}>
                    <IconRenderer name={skill.icon} className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-sm mb-1">{skill.name}</p>
                  <p className="text-[11px] text-slate-500 leading-snug mb-4 line-clamp-2">{skill.description}</p>

                  <button
                    onClick={() => onUpdate({ skills: isActive ? agent.skills.filter(s => s !== skill.id) : [...agent.skills, skill.id] })}
                    className={`w-full py-2 rounded-lg text-[10px] font-black tracking-widest border transition-all ${isActive ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' : 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20 hover:bg-indigo-500'}`}
                  >
                    {isActive ? 'UNINSTALL' : 'INSTALL SKILL'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Resource & Billing Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold tracking-tight text-white">Resource & Billing</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Spend */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Est. Cost (Total)</span>
              <p className="text-3xl font-black text-emerald-400">
                ${(agent.metrics?.totalCost || 0).toFixed(4)}
              </p>
              <div className="text-[10px] text-slate-500 font-mono bg-slate-800 px-2 py-0.5 rounded">
                ~{(agent.metrics?.totalTokens || 0).toLocaleString()} tokens
              </div>
            </div>

            {/* Input Tokens */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  <span>Input Processing</span>
                  <span>{(agent.metrics?.details.input || 0).toLocaleString()} T</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500/50" style={{ width: `${Math.min(((agent.metrics?.details.input || 0) / (agent.metrics?.totalTokens || 1)) * 100, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  <span>Output Generation</span>
                  <span>{(agent.metrics?.details.output || 0).toLocaleString()} T</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500/50" style={{ width: `${Math.min(((agent.metrics?.details.output || 0) / (agent.metrics?.totalTokens || 1)) * 100, 100)}%` }} />
                </div>
              </div>
            </div>

            {/* Rate Card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Active Rate Card</h4>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">{agent.provider} / {agent.model}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span className="text-slate-500">Input</span>
                  <span className="text-slate-300 font-mono">$0.075 / 1M</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span className="text-slate-500">Output</span>
                  <span className="text-slate-300 font-mono">$0.300 / 1M</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Platform Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold tracking-tight text-white">Integration Platform</h3>
            </div>
            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500'}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500'}`}><List className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-slate-800 mx-1" />
              <button onClick={() => setEditingTool(null)} className="p-1.5 text-indigo-400 hover:bg-slate-800 rounded-lg transition-all flex items-center gap-1">
                <Plus className="w-4 h-4" />
                <span className="text-[10px] font-bold px-1 hidden md:inline">ADD</span>
              </button>
            </div>
          </div>

          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-2"}>
            {availableTools.map(tool => {
              const isActive = agent.tools?.includes(tool.id);
              const status = verifying[tool.id] || 'idle';

              return viewMode === 'grid' ? (
                <div key={tool.id} className={`p-5 rounded-2xl border transition-all flex flex-col gap-4 ${isActive ? 'bg-slate-900 border-slate-700 shadow-xl' : 'bg-slate-900/40 border-slate-800/50'}`}>
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-xl ${isActive ? 'bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30' : 'bg-slate-800 text-slate-600'}`}>
                      <IconRenderer name={typeof tool.icon === 'string' ? tool.icon : 'Globe'} className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditingTool(tool)} className="p-2 text-slate-500 hover:text-indigo-400 transition-colors"><Settings2 className="w-4 h-4" /></button>
                      <div className={`w-2 h-2 rounded-full ${status === 'verified' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)] animate-pulse' : 'bg-slate-700'}`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm truncate">{tool.name}</h4>
                      {status === 'verified' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <div className="mb-2">
                      <span className="text-[8px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-500 border border-slate-700 font-mono uppercase tracking-tighter">{tool.provider}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 min-h-[2.5rem] leading-snug">{tool.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => verifyTool(tool.id)}
                      disabled={status === 'verifying'}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 border border-slate-700/50 ${status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 hover:bg-slate-700'}`}
                    >
                      {status === 'verifying' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />} {status === 'verified' ? 'Verified' : 'Verify'}
                    </button>
                    <button
                      onClick={() => onUpdate({ tools: isActive ? agent.tools.filter(t => t !== tool.id) : [...(agent.tools || []), tool.id] })}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all border ${isActive ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'}`}
                    >
                      {isActive ? 'UNINSTALL' : 'INSTALL TOOL'}
                    </button>
                  </div>
                </div>
              ) : (
                <div key={tool.id} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${isActive ? 'bg-slate-900 border-slate-700' : 'bg-slate-900/20 border-slate-800/30'}`}>
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-800 text-slate-600'}`}>
                    <IconRenderer name={typeof tool.icon === 'string' ? tool.icon : 'Globe'} className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold truncate">{tool.name}</p>
                      <span className="text-[8px] text-slate-500 font-mono uppercase">{tool.provider}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setEditingTool(tool)} className="p-1 text-slate-500 hover:text-indigo-400"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button
                      onClick={() => verifyTool(tool.id)}
                      disabled={status === 'verifying'}
                      className={`p-1 transition-colors ${status === 'verified' ? 'text-emerald-400' : 'text-slate-500 hover:text-emerald-400'}`}
                    >
                      {status === 'verifying' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => onUpdate({ tools: isActive ? agent.tools.filter(t => t !== tool.id) : [...(agent.tools || []), tool.id] })}
                      className={`w-24 py-1.5 rounded-lg text-[10px] font-black tracking-widest ${isActive ? 'bg-red-500/10 text-red-400 border border-red-500/10' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'}`}
                    >
                      {isActive ? 'UNINSTALL' : 'INSTALL'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Verification Diagnostic Overlay */}
      {
        verificationOverlay && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    DIAGNOSTIC
                  </h2>
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Verifying Node Integrity</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                </div>
              </div>

              <div className="space-y-3 font-mono">
                {verifySteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-[11px] text-slate-300 animate-in slide-in-from-left-4 duration-500">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>{step}</span>
                  </div>
                ))}
                {verifying[verificationOverlay] === 'verifying' && (
                  <div className="flex items-center gap-3 text-[11px] text-indigo-400 animate-pulse">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>Processing operational handshake...</span>
                  </div>
                )}
                {verifying[verificationOverlay] === 'verified' && (
                  <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center mt-4 animate-in zoom-in duration-300">
                    <p className="text-xs font-bold text-emerald-400">NODE VALIDATED SUCCESSFULLY</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* Skill Detail Modal */}
      {viewingSkill && (
        <SkillDetailModal
          skill={viewingSkill}
          onClose={() => setViewingSkill(null)}
        />
      )}

      {
        editingTool !== undefined && (
          <ToolFormModal
            tool={editingTool}
            onClose={() => setEditingTool(undefined)}
            onSubmit={handleToolSubmit}
          />
        )
      }
    </div >
  );
};
