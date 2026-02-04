import React from 'react';
import { X, Shield, Wrench, FileText, CheckCircle2 } from 'lucide-react';
import { Skill } from '../../types';
import { IconRenderer } from '../layout/IconRenderer';

interface SkillDetailModalProps {
    skill: Skill;
    onClose: () => void;
}

export const SkillDetailModal: React.FC<SkillDetailModalProps> = ({ skill, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
                            <IconRenderer name={skill.icon} className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-xl font-bold text-white tracking-tight">{skill.name}</h2>
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-slate-800 text-slate-500 border border-slate-700">
                                    {skill.category}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500">{skill.description}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-slate-800">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">

                    {/* Integrated Tools Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                            <Wrench className="w-4 h-4" />
                            <h4 className="text-xs font-bold uppercase tracking-widest">Bundled Tool Capability</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {skill.bundledTools && skill.bundledTools.length > 0 ? (
                                skill.bundledTools.map(toolId => (
                                    <div key={toolId} className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-xs font-mono text-slate-300">{toolId}</span>
                                    </div>
                                ))
                            ) : (
                                <span className="text-sm text-slate-500 italic">No specific external tools bundled. Pure cognitive skill.</span>
                            )}
                        </div>
                    </div>

                    {/* SOP Definition Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-indigo-400 mb-2">
                            <FileText className="w-4 h-4" />
                            <h4 className="text-xs font-bold uppercase tracking-widest">Standard Operating Protocol (SOP)</h4>
                        </div>

                        <div className="bg-slate-950 rounded-xl border border-indigo-500/30 p-4 relative overflow-hidden group">
                            {/* Visual decorative line */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500" />

                            {skill.instruction ? (
                                <div className="font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                                    {skill.instruction}
                                </div>
                            ) : (
                                <div className="text-sm text-slate-600 italic flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    This skill operates on general autonomous principles without a strict SOP override.
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-slate-500 text-right">
                            * This SOP is injected into the System Prompt when the skill is active.
                        </p>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/50">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/5"
                    >
                        CLOSE DEFINITION
                    </button>
                </div>

            </div>
        </div>
    );
};
