import React from 'react';
import { Network, X, Layers } from 'lucide-react';

export default function DataModelDiagram({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl p-6 rounded-lg bg-white border border-slate-200 shadow-2xl space-y-5 text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Graph Schema Specification</h3>
              <p className="text-slate-500 text-[11px]">Labeled Nodes, Typed Relationships, &amp; Key Properties</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Schema Flow */}
        <div className="p-4 rounded bg-slate-50 border border-slate-200 space-y-3">
          <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
            <Network className="w-4 h-4 text-indigo-600" />
            <span>Graph Schema Topology</span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center">
            
            <div className="p-2.5 rounded bg-pink-50 border border-pink-200 text-pink-900 font-bold text-[11px]">
              :Facility
            </div>

            <span className="text-[10px] font-mono text-slate-400">&lt;-[:LOCATED_AT]-</span>

            <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-[11px]">
              :Supplier
            </div>

            <span className="text-[10px] font-mono text-slate-400">-[:SUPPLIES]-&gt;</span>

            <div className="p-2.5 rounded bg-purple-50 border border-purple-200 text-purple-900 font-bold text-[11px]">
              :Component
            </div>

            <span className="text-[10px] font-mono text-slate-400">-[:REQUIRES*1..5]-&gt;</span>

            <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-blue-900 font-bold text-[11px]">
              :Product
            </div>

          </div>
        </div>

        {/* Labels Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-blue-700">:Product Node</div>
            <p className="text-slate-600 text-[11px]">Properties: <code className="font-mono text-indigo-900 font-semibold">id, name, sku, revenue, riskScore</code></p>
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-purple-700">:Component Node</div>
            <p className="text-slate-600 text-[11px]">Properties: <code className="font-mono text-indigo-900 font-semibold">id, name, code, leadTimeDays, unitCost</code></p>
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-amber-700">:Material Node</div>
            <p className="text-slate-600 text-[11px]">Properties: <code className="font-mono text-indigo-900 font-semibold">id, name, category, scarcityIndex</code></p>
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-emerald-700">:Supplier Node</div>
            <p className="text-slate-600 text-[11px]">Properties: <code className="font-mono text-indigo-900 font-semibold">id, name, tier, country, reliabilityScore</code></p>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-slate-900 text-white font-bold hover:bg-indigo-600 transition-all shadow-sm">
            Close Schema
          </button>
        </div>

      </div>
    </div>
  );
}
