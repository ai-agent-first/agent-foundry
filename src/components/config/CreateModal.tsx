
import React from 'react';
import { X, Bot, Info } from 'lucide-react';
import { Agent } from '../../types';
import { SKILL_LIBRARY, TOOL_PLATFORM } from '../../constants';

interface CreateModalProps {
  onClose: () => void;
  onSubmit: (agent: Agent) => void;
}

export const CreateModal: React.FC<CreateModalProps> = ({ onClose, onSubmit }) => {
  const [provider, setProvider] = React.useState<'gemini' | 'openai' | 'ollama'>('gemini');
  const [ollamaModels, setOllamaModels] = React.useState<string[]>([]);
  const [apiKey, setApiKey] = React.useState('');

  React.useEffect(() => {
    if (provider === 'ollama') {
      fetch('http://127.0.0.1:8021/proxy/ollama/tags')
        .then(res => res.json())
        .then(data => {
          if (data.models && Array.isArray(data.models)) {
            setOllamaModels(data.models.map((m: any) => m.name));
          }
        })
        .catch(() => setOllamaModels(['llama3.2', 'mistral', 'phi3'])); // Fallbacks
    }
  }, [provider]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <form
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200"
        onSubmit={e => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          onSubmit({
            id: `agent-${Date.now()}`,
            name: fd.get('name') as string,
            role: fd.get('role') as string,
            description: fd.get('description') as string,
            personality: fd.get('personality') as string,
            provider: provider,
            model: fd.get('model') as string,
            skills: [],
            tools: [],
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${fd.get('name') || Math.random()}`
          });
          // Note: In a real app, we would save the apiKey to a secure store or context.
          if (apiKey) {
            console.log(`[Security] Registering custom API Key for ${provider}`);
            // localStorage.setItem(`${provider}_key`, apiKey); // Example persistence
          }
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Forge New Agent</h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Identity Name</label>
              <input required name="name" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition-all text-sm" placeholder="e.g. Vulcan" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expertise Role</label>
              <input required name="role" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition-all text-sm" placeholder="e.g. Architect" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">LLM Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition-all text-sm appearance-none"
              >
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI GPT</option>
                <option value="ollama">Ollama (Local)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Base Model</label>
              <select name="model" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition-all text-sm appearance-none">
                <>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended)</option>
                  <option value="gemini-2.0-flash-lite-preview-02-05">Gemini 2.0 Flash Lite</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </>
                <>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended)</option>
                  <option value="gemini-2.0-flash-lite-preview-02-05">Gemini 2.0 Flash Lite</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </>
                {provider === 'openai' && (
                  <>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="o1-preview">OpenAI o1</option>
                  </>
                )}
                {provider === 'ollama' && (
                  <>
                    {ollamaModels.length > 0 ? (
                      ollamaModels.map(m => <option key={m} value={m}>{m}</option>)
                    ) : (
                      <option disabled>Loading models...</option>
                    )}
                  </>
                )}
              </select>
            </div>
          </div>

          {provider !== 'ollama' && (
            <div className="space-y-1.5 relative">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">API Key (Optional)</label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition-all text-sm font-mono"
                placeholder="sk-..."
              />
              <p className="text-[9px] text-slate-500">Leave blank to use system environment variables.</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              Core Description <Info className="w-3 h-3 opacity-50" />
            </label>
            <input required name="description" className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 transition-all text-sm" placeholder="Brief summary of capabilities..." />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Primary Directives</label>
            <textarea required name="personality" rows={4} className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 resize-none transition-all text-sm leading-relaxed" placeholder="Detailed system instructions..." />
          </div>
        </div>

        <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-sm tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]">
          INITIATE AGENT
        </button>
      </form>
    </div>
  );
};
