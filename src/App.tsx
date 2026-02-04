import React, { useEffect, useMemo } from 'react';
import { Trash2, MessageCircle, Settings, Bot, ChevronLeft, GitBranch, LayoutDashboard, Database, Plus } from 'lucide-react';
import { useStore } from './store/useStore';
import { Sidebar } from './components/layout/Sidebar';
import { ConfigTab } from './components/config/ConfigTab';
import { ChatTab } from './components/chat/ChatTab';
import { WorkflowHub } from './components/hub/WorkflowHub';
import { Dashboard } from './components/dashboard/Dashboard';
import { CreateModal } from './components/config/CreateModal';
import { LLMService } from './services/GeminiService';
import { ToolsPlatform } from './components/tools/ToolsPlatform';

const App: React.FC = () => {
  const {
    agents, activeId, messages, loading,
    fetchAgents, fetchMessages, setActiveId, deleteAgent, createAgent, updateAgent, addMessage
  } = useStore();

  const [viewMode, setViewMode] = React.useState<'dashboard' | 'hub' | 'agent' | 'config' | 'tools'>('dashboard');
  const [input, setInput] = React.useState('');
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [tools, setTools] = React.useState<any[]>([]);

  useEffect(() => {
    const migrate = async () => {
      // Initialize Tools from Gateway
      const { ToolRegistry } = await import('./services/tools/ToolRegistry');
      await ToolRegistry.fetchTools();
      setTools(ToolRegistry.getAllTools());

      await fetchAgents();
      await fetchMessages();

      const localAgents = localStorage.getItem('agents');
      if (localAgents && agents.length === 0) {
        console.log('Detecting legacy data, initiating migration...');
        const parsedAgents = JSON.parse(localAgents);
        for (const agent of parsedAgents) {
          await createAgent(agent);
        }

        const localMessages = localStorage.getItem('messages');
        if (localMessages) {
          const parsedMessages = JSON.parse(localMessages);
          for (const [agentId, msgs] of Object.entries(parsedMessages)) {
            for (const msg of msgs as any[]) {
              await addMessage(agentId, msg);
            }
          }
        }
        // localStorage.clear(); // Optional: Clear after migration
        console.log('Migration complete.');
        await fetchAgents();
        await fetchMessages();
      }
    };
    migrate();
  }, []);

  const activeAgent = useMemo(() => agents.find(a => a.id === activeId), [agents, activeId]);

  const handleSend = async () => {
    if (!input.trim() || !activeAgent || loading) return;
    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: input };
    await addMessage(activeId, userMsg);
    setInput('');

    try {
      const result = await LLMService.sendMessage(input, activeAgent);

      // Track Token Usage
      if (result.usage) {
        useStore.getState().trackUsage(activeId, {
          input: result.usage.input,
          output: result.usage.output
        });
      }

      const aiMsg = { id: (Date.now() + 1).toString(), role: 'assistant' as const, ...result };
      await addMessage(activeId, aiMsg);
    } catch (e: any) {
      await addMessage(activeId, { id: `err-${Date.now()}`, role: 'assistant', content: e.message });
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30">
      <Sidebar
        agents={agents}
        activeId={activeId}
        currentView={viewMode}
        isOpen={sidebarOpen}
        onSelectView={(view) => setViewMode(view as any)}
        onSelectAgent={(id) => { setActiveId(id); setViewMode('agent'); }}
        onCreateAgent={() => setShowModal(true)}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/20">
        {viewMode === 'dashboard' ? (
          <Dashboard
            agents={agents}
            messages={messages}
            onNavigateToAgent={(id) => { setActiveId(id); setViewMode('agent'); }}
            onNavigateToHub={() => setViewMode('hub')}
          />
        ) : viewMode === 'hub' ? (
          <WorkflowHub
            agents={agents}
            messages={messages}
            onNavigateToAgent={(id) => { setActiveId(id); setViewMode('agent'); }}
          />
        ) : viewMode === 'tools' ? (
          <ToolsPlatform
            tools={tools}
            onAddTool={() => { /* Implement modal trigger if needed */ }}
          />
        ) : activeAgent ? (
          <>
            <header className="h-16 border-b border-slate-800/50 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur-xl z-10 shrink-0">

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={activeAgent.avatar} className="w-9 h-9 rounded-xl border border-slate-700 shadow-lg" alt="" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-black text-sm tracking-tight flex items-center gap-2">
                      {activeAgent.name}
                      <span className="text-[9px] uppercase bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 font-bold tracking-widest">
                        {activeAgent.role}
                      </span>
                    </h2>
                    <p className="text-[10px] text-slate-500 font-medium">Session Active • UUID: {activeAgent.id.split('-')[1]}</p>
                  </div>
                </div>

                {/* Token Metrics Display */}
                <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-900/40 border border-slate-800 rounded-lg">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Est. Cost</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">${(activeAgent.metrics?.totalCost || 0).toFixed(4)}</span>
                  </div>
                  <div className="w-px h-6 bg-slate-800 mx-1" />
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Tokens</span>
                    <span className="text-xs font-mono text-slate-400">{(activeAgent.metrics?.totalTokens || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center bg-slate-900/80 rounded-xl p-1 border border-slate-800 shadow-inner">
                <button
                  onClick={() => setViewMode('agent')}
                  className={`px-5 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all flex items-center gap-2 ${viewMode === 'agent' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <MessageCircle className="w-3.5 h-3.5" /> PLAYGROUND
                </button>
                <button
                  onClick={() => setViewMode('config')}
                  className={`px-5 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all flex items-center gap-2 ${viewMode === 'config' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Settings className="w-3.5 h-3.5" /> CONFIG
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (confirm(`Destroy Agent "${activeAgent.name}"?`)) {
                      deleteAgent(activeId);
                      setViewMode('dashboard');
                    }
                  }}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-hidden relative">
              {viewMode === 'config' ? (
                <ConfigTab
                  agent={activeAgent}
                  onUpdate={up => updateAgent(activeId, up)}
                  availableTools={tools}
                  onUpdateTools={(newTools) => setTools(newTools)}
                />
              ) : (
                <ChatTab
                  agent={activeAgent}
                  messages={messages[activeId] || []}
                  input={input}
                  onInputChange={setInput}
                  onSend={handleSend}
                  loading={loading}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-8 animate-in fade-in duration-700">
            <Bot className="w-24 h-24 text-slate-800 animate-pulse" />
            <div className="space-y-3">
              <h2 className="text-3xl font-black tracking-tight text-white">Agent Offline</h2>
              <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">Select an Agent from the sidebar to begin orchestration or browse the Workflow Hub.</p>
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <CreateModal
          onClose={() => setShowModal(false)}
          onSubmit={next => {
            createAgent(next);
            setActiveId(next.id);
            setViewMode('agent');
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default App;
