import React from 'react';
import { Network, AlertCircle, Cpu, Code, Database, RefreshCw, HelpCircle, ShieldCheck } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  dbStatus, 
  onOpenSetup, 
  onOpenDiagram, 
  onOpenProof,
  onSeed, 
  isSeeding 
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur px-4 lg:px-8 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-slate-900">
                SupplyGraph
              </h1>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-indigo-700 border border-slate-300">
                openCypher Bolt
              </span>
            </div>
            <p className="text-xs text-slate-500">Global Supply Chain Multi-Hop Risk Graph</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'graph'
                ? 'bg-white text-indigo-700 shadow-sm font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Graph Topology
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'simulator'
                ? 'bg-white text-indigo-700 shadow-sm font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Disruption Pathfinder
          </button>

          <button
            onClick={() => setActiveTab('bottlenecks')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'bottlenecks'
                ? 'bg-white text-indigo-700 shadow-sm font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Bottleneck SPOF
          </button>

          <button
            onClick={() => setActiveTab('inspector')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'inspector'
                ? 'bg-white text-indigo-700 shadow-sm font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Cypher Console
          </button>
        </nav>

        {/* Database Status & Proof Matrix */}
        <div className="flex items-center gap-2 text-xs">
          
          <button
            onClick={onOpenProof}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-all shadow-sm"
            title="View Live Backend & Driver Proof Matrix"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Proof Matrix
          </button>

          <button
            onClick={onOpenDiagram}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
            title="View Graph Schema Specs"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
            Schema
          </button>

          {/* Database Status */}
          {dbStatus?.connected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>CognoDB Live</span>
            </div>
          ) : (
            <button
              onClick={onOpenSetup}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-[11px] bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-all shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <Database className="w-3.5 h-3.5 text-amber-600" />
              <span>Mock Mode (Setup URI)</span>
            </button>
          )}

          {/* Seed Button */}
          <button
            onClick={onSeed}
            disabled={isSeeding || !dbStatus?.connected}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium border shadow-sm transition-all ${
              dbStatus?.connected
                ? 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
            {isSeeding ? 'Seeding...' : 'Seed DB'}
          </button>
        </div>

      </div>
    </header>
  );
}
