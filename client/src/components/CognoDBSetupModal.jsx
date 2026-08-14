import React from 'react';
import { Database, ExternalLink, X } from 'lucide-react';

export default function CognoDBSetupModal({ isOpen, onClose, dbStatus }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl p-6 rounded-lg bg-white border border-slate-200 shadow-2xl space-y-5 text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">CognoDB Cloud Setup Guide</h3>
              <p className="text-slate-500 text-[11px]">How to connect live managed openCypher database instance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status */}
        <div className={`p-3.5 rounded border flex items-center justify-between font-semibold ${
          dbStatus?.connected
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-amber-50 border-amber-300 text-amber-900'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${dbStatus?.connected ? 'bg-emerald-600' : 'bg-amber-600'}`}></span>
            <span>Status: {dbStatus?.connected ? 'Connected to CognoDB Cloud' : 'Running in Offline Mock Mode'}</span>
          </div>
          {dbStatus?.nodeCount !== undefined && (
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-white text-indigo-700 border border-slate-200">
              {dbStatus.nodeCount} Nodes
            </span>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-3">
          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">1</span>
              <span>Create CognoDB Cloud Account</span>
            </div>
            <p className="text-slate-600 pl-6 text-[11px]">
              Sign up at <a href="https://console.cognodb.com/signup" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold inline-flex items-center gap-1">console.cognodb.com <ExternalLink className="w-3 h-3" /></a>.
            </p>
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">2</span>
              <span>Provision Free Instance</span>
            </div>
            <p className="text-slate-600 pl-6 text-[11px]">
              Create a free (c0) instance and copy your URI (`bolt+s://...`) and password.
            </p>
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">3</span>
              <span>Update `.env`</span>
            </div>
            <div className="pl-6 pt-1">
              <pre className="p-2 rounded bg-slate-900 font-mono text-[11px] text-teal-300">
COGNODB_URI=bolt+s://&lt;instance-id&gt;.databases.cognodb.cloud<br/>
COGNODB_USER=cognodb<br/>
COGNODB_PASSWORD=&lt;password&gt;
              </pre>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-slate-900 text-white font-bold hover:bg-indigo-600 transition-all shadow-sm">
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
}
