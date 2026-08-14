import React, { useState, useEffect } from 'react';
import { fetchBottlenecks } from '../api/client';
import { Cpu, ShieldAlert, ArrowUpRight } from 'lucide-react';

export default function BottleneckAnalysis({ onSelectSupplier }) {
  const [minProducts, setMinProducts] = useState(2);
  const [bottlenecks, setBottlenecks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadBottlenecks = async (minProds) => {
    setIsLoading(true);
    try {
      const res = await fetchBottlenecks(minProds);
      setBottlenecks(res.bottlenecks || []);
    } catch (err) {
      console.error('Failed to load bottleneck analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBottlenecks(minProducts);
  }, [minProducts]);

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-lg bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
              <Cpu className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-extrabold text-slate-900">Bottleneck & Single Point of Failure (SPOF) Analysis</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-semibold">
              RDBMS-Awkward Query
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Detect critical multi-product bottleneck suppliers whose outage creates systemic vulnerability across multiple high-revenue product lines.
          </p>
        </div>

        {/* Min Products Filter */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <span className="text-slate-600 font-medium pl-2">Min Affected Products:</span>
          {[2, 3, 4].map(num => (
            <button
              key={num}
              onClick={() => setMinProducts(num)}
              className={`px-3 py-1 rounded font-bold transition-all ${
                minProducts === num
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ≥ {num} Products
            </button>
          ))}
        </div>
      </div>

      {/* RDBMS vs Cypher Explainer Box */}
      <div className="p-4 rounded-lg bg-white border border-indigo-200 text-xs space-y-2 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-indigo-900">
          <ShieldAlert className="w-4 h-4 text-indigo-600" />
          <span>Why this Cypher query is awkward in Relational SQL:</span>
        </div>
        <p className="text-slate-700 leading-relaxed">
          In SQL, finding bottleneck suppliers requires joining 5+ multi-tier BOM tables with variable depth recursion (`WITH RECURSIVE`), aggregation over non-leaf nodes, and complex duplicate handling. In openCypher, it is expressed cleanly:
        </p>
        <div className="p-3 rounded bg-slate-900 font-mono text-[11px] text-teal-300 border border-slate-800 overflow-x-auto">
          MATCH (p:Product)-[:REQUIRES_COMPONENT*1..5]-&gt;(c:Component)&lt;-[:SUPPLIES]-(s:Supplier)<br/>
          WITH s, count(DISTINCT p) AS affectedProducts, sum(DISTINCT p.revenue) AS totalRevenueAtRisk<br/>
          WHERE affectedProducts &gt;= $minProducts<br/>
          RETURN s.name, s.tier, affectedProducts, totalRevenueAtRisk ORDER BY totalRevenueAtRisk DESC
        </div>
      </div>

      {/* Main Table / Grid */}
      {isLoading ? (
        <div className="p-8 rounded-lg bg-white border border-slate-200 flex justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bottlenecks.map((item, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-lg bg-white border border-slate-200 hover:border-slate-400 transition-all space-y-3 shadow-sm group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                    {item.supplierTier} • {item.country}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-1">{item.supplierName}</h3>
                  <p className="text-xs font-mono text-slate-500">{item.supplierId}</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  {item.reliabilityScore}% Reliability
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-500 block">IMPACTED PRODUCTS</span>
                  <span className="text-lg font-black text-amber-700 font-mono">{item.affectedProductsCount} Products</span>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-500 block">REVENUE AT RISK</span>
                  <span className="text-lg font-black text-rose-700 font-mono">${(item.totalRevenueAtRisk || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Affected Product Pills */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Impacted End-Products:</span>
                <div className="flex flex-wrap gap-1">
                  {item.products && item.products.map((prod, pIdx) => (
                    <span key={pIdx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                      {prod.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectSupplier(item.supplierId)}
                className="w-full mt-2 py-2 px-3 rounded text-xs font-bold bg-slate-900 text-white hover:bg-indigo-600 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ArrowUpRight className="w-4 h-4" /> Simulate Disruption Blast Radius
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
