
import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Send, User, ExternalLink, Activity, ChevronRight, Terminal,
  ClipboardList, Brain, Zap, Power, CheckCircle2, Info, Timer,
  History, GitBranch, Eye, ArrowRight, Gauge, Database, Cpu
} from 'lucide-react';
import { Agent, Message, TraceStepType, TraceStep } from '../../types';

interface ChatTabProps {
  agent: Agent;
  messages: Message[];
  input: string;
  onInputChange: (val: string) => void;
  onSend: () => void;
  loading: boolean;
}

const StepIcon = ({ type, className }: { type: TraceStepType, className?: string }) => {
  switch (type) {
    case 'init': return <Activity className={className} />;
    case 'plan': return <ClipboardList className={className} />;
    case 'think': return <Brain className={className} />;
    case 'decide': return <Zap className={className} />;
    case 'act': return <Power className={className} />;
    case 'final': return <CheckCircle2 className={className} />;
    default: return <Info className={className} />;
  }
};

const StepColor = (type: TraceStepType) => {
  switch (type) {
    case 'init': return 'text-slate-400';
    case 'plan': return 'text-indigo-400';
    case 'think': return 'text-purple-400';
    case 'decide': return 'text-amber-400';
    case 'act': return 'text-emerald-400';
    default: return 'text-slate-400';
  }
};

const MessageContent = ({ content }: { content: string }) => {
  // Parsing logic for Thought/Plan/Security blocks
  const parts = useMemo(() => {
    const segments: { type: 'text' | 'thought' | 'security', content: string }[] = [];
    const lines = content.split('\n');
    let buffer: string[] = [];
    let currentType: 'text' | 'thought' | 'security' = 'text';

    const flush = () => {
      if (buffer.length > 0) {
        segments.push({ type: currentType, content: buffer.join('\n') });
        buffer = [];
      }
    };

    lines.forEach(line => {
      const isThought = line.startsWith('[Thought]') || line.startsWith('[Plan]') || line.startsWith('Thought:');
      const isSecurity = line.startsWith('[Security Check]') || line.includes('[Security Access Manager Protocol]');

      if (isThought) {
        if (currentType !== 'thought') flush();
        currentType = 'thought';
      } else if (isSecurity) {
        if (currentType !== 'security') flush();
        currentType = 'security';
      } else if (currentType !== 'text' && line.trim() === '') {
        // Empty line often ends a block? Let's be loose -> actually usually blocks end with [Action] or just next para
        // For simplicity, let's treat normal text as normal text if it doesn't look like a continued thought list
      }

      // Quick heuristic: If we are in thought mode, but line is purely empty or looks like normal text, maybe switch back?
      // Actually, let's just regex match specific blocks if possible.
      // Better regex approach:
      buffer.push(line);
    });
    flush();

    // Regex-based robust parser replacement
    const regexSegments: { type: 'text' | 'thought' | 'security', content: string }[] = [];
    let remaining = content;

    // Match [Thought] ... [Action] or just lines starting with Tags
    // For now, let's just highlight specific lines.
    return content.split('\n').map((line, i) => {
      if (line.match(/^\[?(Thought|Plan)\]?:?/i)) return { type: 'thought', content: line };
      if (line.match(/^\[Security Check\]/i)) return { type: 'security', content: line };
      return { type: 'text', content: line };
    }) as { type: 'text' | 'thought' | 'security', content: string }[];

  }, [content]);

  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (part.type === 'thought') {
          return (
            <div key={i} className="text-xs font-mono text-slate-500 bg-slate-950/30 p-2 rounded-lg border border-slate-800/50 flex items-start gap-2">
              <Brain className="w-3 h-3 mt-0.5 shrink-0 text-purple-400" />
              <span>{part.content.replace(/^\[?(Thought|Plan)\]?:?\s*/i, '')}</span>
            </div>
          );
        }
        if (part.type === 'security') {
          return (
            <div key={i} className="text-xs font-bold text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>{part.content}</span>
            </div>
          );
        }
        return <p key={i} className="whitespace-pre-wrap min-h-[1.2em]">{part.content}</p>;
      })}
    </div>
  );
};

// Import ShieldCheck as it's used
import { ShieldCheck } from 'lucide-react';

export const ChatTab: React.FC<ChatTabProps> = ({ agent, messages, input, onInputChange, onSend, loading }) => {
  const endRef = useRef<HTMLDivElement>(null);
  const [selectedExeId, setSelectedExeId] = useState<string | null>(null);
  const [showTrace, setShowTrace] = useState(true);

  const assistantMessages = useMemo(() => messages.filter(m => m.role === 'assistant'), [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (assistantMessages.length > 0 && !selectedExeId) {
      setSelectedExeId(assistantMessages[assistantMessages.length - 1].id);
    }
  }, [messages]);

  const activeExecution = assistantMessages.find(m => m.id === (selectedExeId || assistantMessages[assistantMessages.length - 1]?.id));

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950/20">
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-30 gap-6">
              <BotIcon className="w-16 h-16 text-slate-800" />
              <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-600">Playground Initialized</p>
            </div>
          )}
          {messages.map(m => (
            <div key={m.id} className={`flex gap-5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xl ${m.role === 'user' ? 'bg-indigo-600 border border-indigo-400' : 'bg-slate-900 border border-slate-800 overflow-hidden'}`}>
                {m.role === 'user' ? <User className="w-5 h-5 text-white" /> : <img src={agent.avatar} className="w-full h-full object-cover" />}
              </div>
              <div className={`max-w-[80%] space-y-3 ${m.role === 'user' ? 'items-end text-right' : ''}`}>
                <div className={`group relative p-5 rounded-3xl text-sm leading-relaxed shadow-xl ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-900 border border-slate-800 rounded-tl-none text-slate-200'}`}>
                  <MessageContent content={m.content} />
                  {m.role === 'assistant' && m.trace && (
                    <button
                      onClick={() => { setSelectedExeId(m.id); setShowTrace(true); }}
                      className="absolute -right-12 top-0 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all shadow-2xl"
                    >
                      <Eye className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>
                {m.sources && m.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {m.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border border-slate-800 rounded-full text-[10px] text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all">
                        <ExternalLink className="w-3 h-3" /> {s.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-5 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800" />
              <div className="h-14 bg-slate-900 border border-slate-800 rounded-3xl w-2/3" />
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-8 border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto flex items-end gap-4 bg-slate-900/40 p-3 rounded-[2rem] border border-slate-800 focus-within:border-indigo-500/50 transition-all shadow-2xl group">
            <textarea
              rows={1}
              className="flex-1 bg-transparent border-none outline-none px-5 py-3 resize-none text-sm placeholder:text-slate-600 custom-scrollbar max-h-40"
              placeholder={`Communicate with ${agent.name}...`}
              value={input}
              onChange={e => onInputChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), onSend())}
            />
            <button onClick={onSend} disabled={loading || !input.trim()} className="p-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95"><Send className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {/* Local Execution Sidebar */}
      <div className={`${showTrace ? 'w-96' : 'w-0'} border-l border-slate-800 bg-slate-900/80 flex flex-col transition-all duration-300 relative shadow-2xl backdrop-blur-lg`}>
        <button onClick={() => setShowTrace(!showTrace)} className="absolute -left-5 top-1/2 -translate-y-1/2 w-5 h-20 bg-slate-900 border border-slate-800 rounded-l-xl flex items-center justify-center text-slate-600 hover:text-white transition-colors z-30">
          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showTrace ? '' : 'rotate-180'}`} />
        </button>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 bg-slate-950/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <GitBranch className="w-4.5 h-4.5 text-emerald-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">Execution Stream</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                ACTIVE_NODE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/40 flex flex-col items-center text-center">
                <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Response Latency</p>
                <p className="text-xs font-mono font-bold text-indigo-400">0.92s</p>
              </div>
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/40 flex flex-col items-center text-center">
                <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Mem Profile</p>
                <p className="text-xs font-mono font-bold text-emerald-400">42.1MB</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            {!activeExecution ? (
              <div className="py-20 text-center space-y-4 opacity-30 px-6">
                <Terminal className="w-12 h-12 mx-auto" />
                <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">System awaiting next cognitive sequence...</p>
              </div>
            ) : (
              <div className="space-y-0 relative">
                <div className="absolute left-[17px] top-6 bottom-6 w-px bg-slate-800" />
                {activeExecution.trace?.map((step, idx) => (
                  <div key={idx} className="relative pl-12 pb-8 last:pb-0 group/node">
                    <div className={`absolute left-0 top-0 w-9 h-9 rounded-xl border border-slate-700 bg-slate-900 flex items-center justify-center z-10 transition-all shadow-xl group-hover/node:scale-110 ${StepColor(step.type)}`}>
                      <StepIcon type={step.type} className="w-4.5 h-4.5" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[11px] font-black text-slate-200 uppercase tracking-tight">{step.label}</h4>
                        <span className="text-[9px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800/50">{step.duration}</span>
                      </div>
                      <div className="p-3.5 bg-slate-950/40 border border-slate-800/60 rounded-xl text-[11px] text-slate-500 leading-relaxed font-medium group-hover/node:border-indigo-500/20 transition-all">
                        {step.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 border-t border-slate-800 bg-slate-950/30">
            <div className="flex items-center justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Activity className="w-3 h-3 text-emerald-500" /> Secure Tunnel Active</span>
              <span className="font-mono">GATEWAY_v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BotIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg>;
