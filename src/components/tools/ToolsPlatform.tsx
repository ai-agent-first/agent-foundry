import React, { useState } from 'react';
import { Layers, Search, LayoutGrid, List, Plus, Settings2, ShieldCheck, Zap, Globe, Server, Database } from 'lucide-react';
import { Tool } from '../../types';
import { IconRenderer } from '../layout/IconRenderer';

interface ToolsPlatformProps {
    tools: Tool[];
    onAddTool?: () => void;
}

export const ToolsPlatform: React.FC<ToolsPlatformProps> = ({ tools, onAddTool }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');

    const filteredTools = tools.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-slate-950 text-slate-200">
            {/* Header */}
            <header className="px-8 py-6 border-b border-slate-800/60 bg-slate-900/20 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                            <Database className="w-6 h-6 text-emerald-400" />
                            GLOBAL TOOL REGISTRY
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">Manage external integrations and gateway connections.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onAddTool} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs tracking-wide flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20">
                            <Plus className="w-4 h-4" /> ADD NEW TOOL
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search tools..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500'}`}><LayoutGrid className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-inner' : 'text-slate-500'}`}><List className="w-4 h-4" /></button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="p-8 overflow-y-auto custom-scrollbar">
                {filteredTools.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-800 rounded-3xl text-center space-y-4 opacity-50">
                        <Server className="w-12 h-12 text-slate-600" />
                        <p className="font-bold text-slate-400">No tools found in registry.</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
                        {filteredTools.map(tool => (
                            viewMode === 'grid' ? (
                                <div key={tool.id} className="group p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/50 transition-all hover:bg-slate-900/60 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 rounded-xl bg-slate-800 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                                            <IconRenderer name={typeof tool.icon === 'string' ? tool.icon : 'Globe'} className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-mono uppercase bg-slate-950 px-2 py-1 rounded text-slate-500 border border-slate-800">{tool.provider}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white mb-1">{tool.name}</h3>
                                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{tool.description}</p>
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center gap-2">
                                        <div className="flex-1 flex gap-1">
                                            {Object.keys(tool.parameters?.properties || {}).slice(0, 3).map(prop => (
                                                <span key={prop} className="text-[9px] px-1.5 py-0.5 bg-slate-800/50 rounded text-slate-500 font-mono">{prop}</span>
                                            ))}
                                            {(Object.keys(tool.parameters?.properties || {}).length > 3) && <span className="text-[9px] px-1.5 py-0.5 bg-slate-800/50 rounded text-slate-500 font-mono">+{Object.keys(tool.parameters?.properties || {}).length - 3}</span>}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div key={tool.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/30 flex items-center gap-4 transition-all">
                                    <div className="p-2.5 rounded-lg bg-slate-800 text-slate-400">
                                        <IconRenderer name={typeof tool.icon === 'string' ? tool.icon : 'Globe'} className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-sm text-white">{tool.name}</h3>
                                            <span className="text-[9px] font-mono uppercase bg-slate-950 px-1.5 py-0.5 rounded text-slate-500 border border-slate-800">{tool.provider}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{tool.description}</p>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
