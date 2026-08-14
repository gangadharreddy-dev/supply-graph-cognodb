import React, { useState, useEffect } from 'react';
import { simulateDisruption, fetchAlternativeSuppliers } from '../api/client';
import { AlertCircle, DollarSign, Layers, ChevronRight, ShieldCheck, Zap } from 'lucide-react';

const PRESET_SUPPLIERS = [
  { id: 'SUP-401', name: 'TSMC (Tier 3)', desc: 'Provides 3nm N3E Processors & Silicon Ingot Wafers' },
  { id: 'SUP-402', name: 'ASML Holding N.V. (Tier 4)', desc: 'Manufactures EUV Photolithography Lens Optics' },
  { id: 'SUP-403', name: 'Infineon Technologies AG (Tier 2)', desc: 'Supplies 800V SiC Power Modules for EVs & Laptops' }
];

export default function DisruptionSimulator({ initialSupplierId }) {
  const [selectedSupplierId, setSelectedSupplierId] = useState(initialSupplierId || 'SUP-401');
  const [simulationResult, setSimulationResult] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const runSimulation = async (supplierId) => {
    setIsLoading(true);
    try {
      const result = await simulateDisruption(supplierId);
      setSimulationResult(result);

      if (result.affectedProducts && result.affectedProducts.length > 0) {
        const altRes = await fetchAlternativeSuppliers(result.affectedProducts[0].id, supplierId);
        setAlternatives(altRes.alternatives || []);
      } else {
        setAlternatives([]);
      }
    } catch (err) {
      console.error('Failed to run disruption simulation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSupplierId) {
      runSimulation(selectedSupplierId);
    }
  }, [selectedSupplierId]);

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-lg bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-rose-50 text-rose-600 border border-rose-200">
              <AlertCircle className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-extrabold text-slate-900">Multi-Hop Disruption Pathfinder</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-semibold">
              2..5 Hops Traversal
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Simulate a supplier outage and execute a parameterized openCypher variable-depth path query to calculate downstream product impact and total annual revenue at risk.
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_SUPPLIERS.map(sup => (
            <button
              key={sup.id}
              onClick={() => setSelectedSupplierId(sup.id)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all border ${
                selectedSupplierId === sup.id
                  ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {sup.name}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-xs font-mono text-slate-500">Executing openCypher path traversal...</p>
        </div>
      ) : simulationResult ? (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-5 rounded-lg bg-white border border-rose-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>REVENUE AT RISK</span>
                <DollarSign className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-700 mt-2 font-mono">
                ${(simulationResult.totalRevenueAtRisk || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Summed revenue across impacted consumer products</p>
            </div>

            <div className="p-5 rounded-lg bg-white border border-amber-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>IMPACTED END-PRODUCTS</span>
                <Layers className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-800 mt-2 font-mono">
                {simulationResult.affectedProductsCount || 0} Products
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Direct and indirect dependencies</p>
            </div>

            <div className="p-5 rounded-lg bg-white border border-indigo-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>QUERY LATENCY</span>
                <Zap className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xl font-bold text-indigo-700 mt-2 font-mono">
                {simulationResult.durationMs || 5} ms
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Engine: {simulationResult.mode === 'LIVE_COGNODB' ? 'Live CognoDB Bolt' : 'Mock Cache Engine'}
              </p>
            </div>

          </div>

          {/* Paths & Alternate Routing */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Multi-Hop Path Visual Tree */}
            <div className="lg:col-span-2 p-6 rounded-lg bg-white border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Multi-Hop Dependency Path Traces (openCypher 1..5 Hops)
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  {simulationResult.paths?.length || 0} Paths Traced
                </span>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {simulationResult.paths && simulationResult.paths.length > 0 ? (
                  simulationResult.paths.map((path, idx) => (
                    <div key={idx} className="p-3 rounded bg-slate-50 border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-rose-700 font-bold">Path #{idx + 1}</span>
                        <span className="px-2 py-0.5 rounded bg-white text-indigo-700 border border-slate-200 font-semibold">
                          {path.depth} Hop{path.depth > 1 ? 's' : ''} Deep
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 py-1">
                        {path.pathNodes && path.pathNodes.map((node, nIdx) => (
                          <React.Fragment key={nIdx}>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white border border-slate-200 text-xs shadow-sm">
                              <span className={`w-2 h-2 rounded-full ${
                                node.label === 'Product' ? 'bg-blue-600' :
                                node.label === 'Component' ? 'bg-purple-600' :
                                node.label === 'Material' ? 'bg-amber-600' : 'bg-emerald-600'
                              }`}></span>
                              <span className="font-semibold text-slate-900">{node.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">({node.label})</span>
                            </div>
                            {nIdx < path.pathNodes.length - 1 && (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No active paths found for this supplier node.
                  </div>
                )}
              </div>
            </div>

            {/* Alternate Suppliers */}
            <div className="p-6 rounded-lg bg-white border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Alternate Vendor Routing</h3>
              </div>

              <div className="space-y-3 text-xs">
                {alternatives && alternatives.length > 0 ? (
                  alternatives.map((alt, idx) => (
                    <div key={idx} className="p-3 rounded bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900">{alt.altSupplierName}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                          Reliability: {alt.score}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Substitutes component: <strong className="text-slate-900">{alt.componentName}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-emerald-200/60">
                        <span>Country: {alt.country}</span>
                        <span>Lead Time: {alt.leadTimeDays} days</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-500 text-xs bg-slate-50 rounded border border-slate-200">
                    No secondary supplier routing required.
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      ) : null}

    </div>
  );
}
