import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import GraphView from './components/GraphView';
import DisruptionSimulator from './components/DisruptionSimulator';
import BottleneckAnalysis from './components/BottleneckAnalysis';
import QueryInspector from './components/QueryInspector';
import CognoDBSetupModal from './components/CognoDBSetupModal';
import DataModelDiagram from './components/DataModelDiagram';
import BackendVerificationModal from './components/BackendVerificationModal';
import { fetchHealthStatus, fetchGraphData, seedDatabase } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('graph');
  const [dbStatus, setDbStatus] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], relationships: [] });
  const [isLoadingGraph, setIsLoadingGraph] = useState(true);
  const [selectedSupplierId, setSelectedSupplierId] = useState('SUP-401');
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isDiagramOpen, setIsDiagramOpen] = useState(false);
  const [isProofOpen, setIsProofOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const loadInitialData = async () => {
    setIsLoadingGraph(true);
    try {
      const health = await fetchHealthStatus();
      setDbStatus(health);

      const data = await fetchGraphData(100);
      setGraphData(data);
    } catch (err) {
      console.error('Error connecting to backend:', err);
      setDbStatus({ connected: false, error: err.message });
    } finally {
      setIsLoadingGraph(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const res = await seedDatabase();
      if (res.success) {
        await loadInitialData();
      } else {
        alert(`Seeding failed: ${res.error}`);
      }
    } catch (err) {
      alert(`Seeding error: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSelectNode = (nodeId) => {
    if (nodeId && nodeId.startsWith('SUP-')) {
      setSelectedSupplierId(nodeId);
      setActiveTab('simulator');
    }
  };

  const handleSelectSupplierFromBottleneck = (supplierId) => {
    setSelectedSupplierId(supplierId);
    setActiveTab('simulator');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Header Bar */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dbStatus={dbStatus}
        onOpenSetup={() => setIsSetupOpen(true)}
        onOpenDiagram={() => setIsDiagramOpen(true)}
        onOpenProof={() => setIsProofOpen(true)}
        onSeed={handleSeedDatabase}
        isSeeding={isSeeding}
      />

      {/* Main Content View */}
      <main className="flex-1 w-full relative">
        {activeTab === 'graph' && (
          <GraphView 
            graphData={graphData}
            isLoading={isLoadingGraph}
            onSelectNode={handleSelectNode}
            selectedNodeId={selectedSupplierId}
            mode={graphData.mode}
          />
        )}

        {activeTab === 'simulator' && (
          <DisruptionSimulator initialSupplierId={selectedSupplierId} />
        )}

        {activeTab === 'bottlenecks' && (
          <BottleneckAnalysis onSelectSupplier={handleSelectSupplierFromBottleneck} />
        )}

        {activeTab === 'inspector' && (
          <QueryInspector />
        )}
      </main>

      {/* Modals */}
      <CognoDBSetupModal 
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        dbStatus={dbStatus}
      />

      <DataModelDiagram 
        isOpen={isDiagramOpen}
        onClose={() => setIsDiagramOpen(false)}
      />

      <BackendVerificationModal
        isOpen={isProofOpen}
        onClose={() => setIsProofOpen(false)}
        dbStatus={dbStatus}
      />

    </div>
  );
}
