
import React, { useState, useEffect } from 'react';
import { X, Wrench, Globe } from 'lucide-react';
import { Tool } from '../../types';
import { AVAILABLE_ICONS } from '../../constants';
import { IconRenderer } from '../layout/IconRenderer';

interface ToolFormModalProps {
  tool?: Tool | null;
  onClose: () => void;
  onSubmit: (tool: Tool) => void;
}

export const ToolFormModal: React.FC<ToolFormModalProps> = ({ tool, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<Tool>>({
    name: '',
    description: '',
    provider: 'Custom',
    icon: 'Globe',
    id: ''
  });

  useEffect(() => {
    if (tool) setFormData(tool);
  }, [tool]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <form
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl"
        onSubmit={e => {
          e.preventDefault();
          onSubmit({
            ...formData,
            id: tool?.id || `tool-${Date.now()}`,
            icon: formData.icon || 'Globe',
            isCustom: true
          } as Tool);
        }}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Wrench className="w-5 h-5 text-indigo-400" />
            {tool ? 'Tool Configuration' : 'Add Tool'}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tool Name</label>
            <input
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 focus:border-indigo-500 outline-none text-sm"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Weather Engine"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Icon Selection</label>
            <div className="grid grid-cols-5 gap-2">
              {AVAILABLE_ICONS.map(iconName => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: iconName })}
                  className={`p-2.5 rounded-lg border transition-all flex justify-center ${formData.icon === iconName ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                >
                  <IconRenderer name={iconName} className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Provider / Origin</label>
            <input
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 focus:border-indigo-500 outline-none text-sm"
              value={formData.provider}
              onChange={e => setFormData({ ...formData, provider: e.target.value })}
              placeholder="e.g. MetaCloud"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Instruction Set</label>
            <textarea
              required
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 focus:border-indigo-500 outline-none resize-none text-sm"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe tool capabilities for the LLM..."
            />
          </div>
        </div>

        <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all text-sm tracking-widest">
          {tool ? 'UPDATE TOOL' : 'REGISTER TOOL'}
        </button>
      </form>
    </div>
  );
};
