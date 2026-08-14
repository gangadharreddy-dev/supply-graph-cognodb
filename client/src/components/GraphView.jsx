import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { Search, Filter, ZoomIn, ArrowUpRight, X } from 'lucide-react';

const NODE_STYLES = {
  Product: { color: '#2563eb', shape: 'diamond', size: 26 },
  Component: { color: '#7c3aed', shape: 'dot', size: 20 },
  Material: { color: '#d97706', shape: 'triangle', size: 18 },
  Supplier: { color: '#059669', shape: 'square', size: 24 },
  Facility: { color: '#e11d48', shape: 'star', size: 20 }
};

export default function GraphView({ graphData, isLoading, onSelectNode, selectedNodeId, mode }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [filterLabel, setFilterLabel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeDetails, setSelectedNodeDetails] = useState(null);

  useEffect(() => {
    if (!containerRef.current || !graphData || !graphData.nodes) return;

    const filteredNodesList = graphData.nodes.filter(n => {
      const matchesLabel = filterLabel === 'ALL' || n.label === filterLabel;
      const matchesSearch = !searchQuery || 
        (n.name && n.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (n.id && n.id.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesLabel && matchesSearch;
    });

    const nodeIdsSet = new Set(filteredNodesList.map(n => n.id));

    const visNodes = filteredNodesList.map(node => {
      const style = NODE_STYLES[node.label] || { color: '#64748b', shape: 'dot', size: 20 };
      const isSelected = selectedNodeId === node.id;

      return {
        id: node.id,
        label: `${node.name || node.id}\n[${node.label}]`,
        shape: style.shape,
        size: isSelected ? style.size + 8 : style.size,
        color: {
          background: style.color,
          border: isSelected ? '#0f172a' : '#ffffff',
          highlight: { background: style.color, border: '#0f172a' }
        },
        font: { color: '#0f172a', size: 11, face: 'Plus Jakarta Sans', multi: true, bold: true },
        borderWidth: isSelected ? 3 : 1.5,
        shadow: { enabled: true, color: 'rgba(0,0,0,0.1)', size: 5, x: 2, y: 2 },
        title: `<b>${node.name}</b> (${node.label})<br/>ID: ${node.id}`
      };
    });

    const visEdges = (graphData.relationships || [])
      .filter(rel => nodeIdsSet.has(rel.from) && nodeIdsSet.has(rel.to))
      .map(rel => ({
        id: rel.id || `${rel.from}-${rel.to}`,
        from: rel.from,
        to: rel.to,
        label: rel.type,
        arrows: 'to',
        color: { color: '#94a3b8', highlight: '#2563eb' },
        font: { color: '#475569', size: 9, align: 'middle', background: '#ffffff' },
        width: 1.5,
        smooth: { type: 'cubicBezier', forceDirection: 'horizontal', roundness: 0.4 }
      }));

    const data = {
      nodes: new DataSet(visNodes),
      edges: new DataSet(visEdges)
    };

    const options = {
      physics: {
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -50,
          centralGravity: 0.01,
          springLength: 100,
          springConstant: 0.08
        },
        maxVelocity: 50,
        minVelocity: 0.1,
        stabilization: { iterations: 150 }
      },
      interaction: { hover: true, tooltipDelay: 150, zoomView: true, dragView: true }
    };

    const network = new Network(containerRef.current, data, options);
    networkRef.current = network;

    network.on('selectNode', (params) => {
      const nodeId = params.nodes[0];
      const targetNode = graphData.nodes.find(n => n.id === nodeId);
      setSelectedNodeDetails(targetNode);
      if (onSelectNode) onSelectNode(nodeId);
    });

    network.on('deselectNode', () => {
      setSelectedNodeDetails(null);
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [graphData, filterLabel, searchQuery, selectedNodeId]);

  const handleFitView = () => {
    if (networkRef.current) {
      networkRef.current.fit({ animation: { duration: 400 } });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-65px)] flex flex-col overflow-hidden bg-slate-50">
      
      {/* Top Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-white border border-slate-200 shadow-md">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search nodes by name, SKU, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['ALL', 'Product', 'Component', 'Material', 'Supplier', 'Facility'].map(label => (
            <button
              key={label}
              onClick={() => setFilterLabel(label)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                filterLabel === label
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Fit Canvas */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleFitView}
            className="px-3 py-1.5 rounded bg-white border border-slate-300 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
            title="Reset Canvas Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" /> Reset View
          </button>
        </div>

      </div>

      {/* Main Canvas Container */}
      <div className="relative flex-1 w-full h-full">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20">
            <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-3 text-xs font-medium text-slate-600 font-mono">Loading Graph Topology...</p>
          </div>
        ) : null}

        <div ref={containerRef} className="w-full h-full bg-slate-50" />

        {/* Floating Legend */}
        <div className="absolute bottom-4 left-4 z-10 p-3 rounded-lg bg-white border border-slate-200 shadow-md text-xs space-y-2">
          <div className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider">Node Legend</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-medium">
            <div className="flex items-center gap-2 text-slate-800">
              <span className="w-2.5 h-2.5 rotate-45 bg-blue-600"></span> Product
            </div>
            <div className="flex items-center gap-2 text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Component
            </div>
            <div className="flex items-center gap-2 text-slate-800">
              <span className="w-2.5 h-2.5 bg-amber-600"></span> Material
            </div>
            <div className="flex items-center gap-2 text-slate-800">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span> Supplier
            </div>
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        {selectedNodeDetails && (
          <div className="absolute top-20 right-4 z-10 w-80 p-4 rounded-lg bg-white border border-slate-200 shadow-xl space-y-3 text-xs">
            <div className="flex items-start justify-between border-b border-slate-200 pb-2">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  :{selectedNodeDetails.label}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1">{selectedNodeDetails.name}</h3>
                <p className="text-[11px] font-mono text-slate-500">{selectedNodeDetails.id}</p>
              </div>
              <button onClick={() => setSelectedNodeDetails(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="font-mono font-semibold text-slate-500 text-[10px] uppercase">Node Properties</div>
              {Object.entries(selectedNodeDetails)
                .filter(([k]) => !['id', 'name', 'label'].includes(k))
                .map(([key, val]) => (
                  <div key={key} className="flex justify-between py-1 border-b border-slate-100 font-mono text-[11px]">
                    <span className="text-slate-500">{key}:</span>
                    <span className="text-indigo-900 font-bold">{typeof val === 'number' ? val.toLocaleString() : String(val)}</span>
                  </div>
                ))}
            </div>

            {selectedNodeDetails.label === 'Supplier' && (
              <div className="pt-2">
                <button
                  onClick={() => onSelectNode(selectedNodeDetails.id)}
                  className="w-full py-1.5 px-3 rounded text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ArrowUpRight className="w-4 h-4" /> Run Disruption Path Tracer
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
