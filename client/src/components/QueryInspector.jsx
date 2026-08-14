import React, { useState, useEffect } from 'react';
import { fetchCypherCatalog } from '../api/client';
import { Code, Copy, Check, ShieldCheck, Terminal } from 'lucide-react';

export default function QueryInspector() {
  const [catalog, setCatalog] = useState({});
  const [selectedKey, setSelectedKey] = useState('DISRUPTION_BLAST_RADIUS');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCypherCatalog().then(data => {
      setCatalog(data || {});
    }).catch(err => console.error(err));
  }, []);

  const currentQuery = catalog[selectedKey] || {
    description: 'Multi-Hop Disruption Blast Radius Query',
    cypher: `MATCH path = (s:Supplier {id: $supplierId})-[:SUPPLIES|REQUIRES_COMPONENT|MADE_OF*1..5]->(p:Product)\nRETURN s.name, p.name, p.revenue, length(path) AS depth`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentQuery.cypher);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-6">
      
      {/* Title Panel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-lg bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Code className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-extrabold text-slate-900">Parameterized openCypher Query Console</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Parameterized Driver Calls
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Inspect the exact openCypher statements executed over the official Neo4j Bolt driver against CognoDB Cloud. All inputs use parameterized `$variable` bindings to eliminate injection risks.
          </p>
        </div>
      </div>

      {/* Query Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {Object.keys(catalog).map(key => (
          <button
            key={key}
            onClick={() => setSelectedKey(key)}
            className={`px-3.5 py-2 rounded text-xs font-bold font-mono transition-all border whitespace-nowrap ${
              selectedKey === key
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Code Display */}
      <div className="p-6 rounded-lg bg-white border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600" />
            <span className="font-mono font-bold text-sm text-slate-900">{selectedKey}</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            {copied ? 'Copied Cypher!' : 'Copy Cypher'}
          </button>
        </div>

        <p className="text-xs text-slate-600 italic">{currentQuery.description}</p>

        <div className="p-4 rounded bg-slate-900 border border-slate-800 overflow-x-auto shadow-inner">
          <pre className="font-mono text-xs text-teal-300 leading-relaxed whitespace-pre-wrap">
            {currentQuery.cypher.trim()}
          </pre>
        </div>

        <div className="p-3.5 rounded bg-slate-50 border border-slate-200 text-xs space-y-1">
          <div className="font-bold text-emerald-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Official Neo4j Bolt Driver Binding:
          </div>
          <p className="text-slate-600 font-mono text-[11px]">
            session.run(CYPHER_STATEMENT, &#123; supplierId: "SUP-401", minProducts: 2 &#125;)
          </p>
        </div>
      </div>

    </div>
  );
}
