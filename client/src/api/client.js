/**
 * API Client helper for SupplyGraph Backend
 */

// Fallback seed data in case API fetch is blocked by browser/proxy
const FALLBACK_SEED_DATA = {
  mode: 'MOCK_FALLBACK',
  nodes: [
    { id: 'PRD-101', label: 'Product', name: 'Apple MacBook Pro M3 Max', sku: 'MBP-M3-MAX-16', revenue: 18500000, category: 'Consumer Hardware', riskScore: 84 },
    { id: 'PRD-102', label: 'Product', name: 'Tesla Model Y SiC Inverter', sku: 'TSL-MY-INV-800', revenue: 34200000, category: 'Automotive', riskScore: 92 },
    { id: 'PRD-103', label: 'Product', name: 'Sony PlayStation 5 Pro', sku: 'SNY-PS5-PRO-2TB', revenue: 21000000, category: 'Gaming', riskScore: 76 },
    { id: 'PRD-104', label: 'Product', name: 'Dell XPS 16 Developer Workstation', sku: 'DEL-XPS16-DEV', revenue: 12800000, category: 'Enterprise IT', riskScore: 68 },

    { id: 'CMP-201', label: 'Component', name: 'TSMC 3nm N3E SoC Processor', code: 'CMP-TSMC-3NM', leadTimeDays: 60, unitCost: 450 },
    { id: 'CMP-202', label: 'Component', name: 'ASML EUV Projection Lens Mirror', code: 'CMP-EUV-OPTIC', leadTimeDays: 90, unitCost: 12000 },
    { id: 'CMP-203', label: 'Component', name: 'Infineon 800V SiC MOSFET Module', code: 'CMP-INF-SIC-800', leadTimeDays: 45, unitCost: 320 },
    { id: 'CMP-204', label: 'Component', name: 'LG Energy 4680 Cylindrical Cell Pack', code: 'CMP-LGE-4680', leadTimeDays: 40, unitCost: 1400 },
    { id: 'CMP-205', label: 'Component', name: 'Sony MicroOLED 4K Display Panel', code: 'CMP-SNY-OLED-4K', leadTimeDays: 50, unitCost: 550 },

    { id: 'MAT-301', label: 'Material', name: 'High-Purity Silicon Ingot (99.9999999%)', category: 'Semiconductor Raw', scarcityIndex: 9.4 },
    { id: 'MAT-302', label: 'Material', name: 'Battery-Grade Lithium Carbonate (99.5%)', category: 'Chemical Energy', scarcityIndex: 8.8 },
    { id: 'MAT-303', label: 'Material', name: 'Neodymium-Iron-Boron Permanent Alloy', category: 'Rare Earth Elements', scarcityIndex: 8.5 },
    { id: 'MAT-304', label: 'Material', name: 'Monocrystalline Sapphire Crystal Glass', category: 'Precision Optics', scarcityIndex: 7.2 },

    { id: 'SUP-401', label: 'Supplier', name: 'TSMC (Taiwan Semiconductor Manufacturing Co.)', tier: 'Tier-3', country: 'Taiwan', reliabilityScore: 98, status: 'ACTIVE' },
    { id: 'SUP-402', label: 'Supplier', name: 'ASML Holding N.V.', tier: 'Tier-4', country: 'Netherlands', reliabilityScore: 97, status: 'ACTIVE' },
    { id: 'SUP-403', label: 'Supplier', name: 'Infineon Technologies AG', tier: 'Tier-2', country: 'Germany', reliabilityScore: 94, status: 'ACTIVE' },
    { id: 'SUP-404', label: 'Supplier', name: 'LG Energy Solution Ltd', tier: 'Tier-2', country: 'South Korea', reliabilityScore: 91, status: 'ACTIVE' },
    { id: 'SUP-405', label: 'Supplier', name: 'Kyoto Precision Semiconductor Optics', tier: 'Tier-3', country: 'Japan', reliabilityScore: 95, status: 'ACTIVE' },
    { id: 'SUP-406', label: 'Supplier', name: 'Albemarle Lithium Corporation', tier: 'Tier-4', country: 'United States', reliabilityScore: 89, status: 'ACTIVE' },

    { id: 'FAC-501', label: 'Facility', name: 'TSMC Fab 18 (3nm N3E Cleanroom)', city: 'Tainan', country: 'Taiwan', riskFactor: 'Geopolitical / Seismic Zone' },
    { id: 'FAC-502', label: 'Facility', name: 'ASML Veldhoven Innovation Campus', city: 'Veldhoven', country: 'Netherlands', riskFactor: 'Export Compliance Controls' },
    { id: 'FAC-503', label: 'Facility', name: 'Infineon Villach 300mm Power Fab', city: 'Villach', country: 'Austria', riskFactor: 'Energy Grid Surcharge' }
  ],
  relationships: [
    { id: 'r1', from: 'PRD-101', to: 'CMP-201', type: 'REQUIRES_COMPONENT' },
    { id: 'r2', from: 'PRD-101', to: 'CMP-205', type: 'REQUIRES_COMPONENT' },
    { id: 'r3', from: 'PRD-102', to: 'CMP-203', type: 'REQUIRES_COMPONENT' },
    { id: 'r4', from: 'PRD-102', to: 'CMP-204', type: 'REQUIRES_COMPONENT' },
    { id: 'r5', from: 'PRD-103', to: 'CMP-201', type: 'REQUIRES_COMPONENT' },
    { id: 'r6', from: 'PRD-103', to: 'CMP-205', type: 'REQUIRES_COMPONENT' },
    { id: 'r7', from: 'PRD-104', to: 'CMP-201', type: 'REQUIRES_COMPONENT' },
    { id: 'r8', from: 'PRD-104', to: 'CMP-203', type: 'REQUIRES_COMPONENT' },

    { id: 'r9', from: 'CMP-201', to: 'MAT-301', type: 'MADE_OF' },
    { id: 'r10', from: 'CMP-202', to: 'MAT-304', type: 'MADE_OF' },
    { id: 'r11', from: 'CMP-203', to: 'MAT-301', type: 'MADE_OF' },
    { id: 'r12', from: 'CMP-204', to: 'MAT-302', type: 'MADE_OF' },
    { id: 'r13', from: 'CMP-205', to: 'MAT-304', type: 'MADE_OF' },

    { id: 'r14', from: 'SUP-401', to: 'CMP-201', type: 'SUPPLIES' },
    { id: 'r15', from: 'SUP-401', to: 'MAT-301', type: 'SUPPLIES' },
    { id: 'r16', from: 'SUP-402', to: 'CMP-202', type: 'SUPPLIES' },
    { id: 'r17', from: 'SUP-403', to: 'CMP-203', type: 'SUPPLIES' },
    { id: 'r18', from: 'SUP-404', to: 'CMP-204', type: 'SUPPLIES' },
    { id: 'r19', from: 'SUP-405', to: 'CMP-205', type: 'SUPPLIES' },
    { id: 'r20', from: 'SUP-406', to: 'MAT-302', type: 'SUPPLIES' },

    { id: 'r21', from: 'SUP-401', to: 'FAC-501', type: 'LOCATED_AT' },
    { id: 'r22', from: 'SUP-402', to: 'FAC-502', type: 'LOCATED_AT' },
    { id: 'r23', from: 'SUP-403', to: 'FAC-503', type: 'LOCATED_AT' }
  ]
};

export async function fetchHealthStatus() {
  try {
    const res = await fetch('/api/health');
    if (res.ok) return await res.json();
  } catch (e) {
    try {
      const res2 = await fetch('http://localhost:3001/api/health');
      if (res2.ok) return await res2.json();
    } catch (e2) {}
  }
  return { connected: false, mode: 'MOCK_FALLBACK', reason: 'Running in local fallback mode' };
}

export async function fetchGraphData(limit = 100) {
  try {
    const res = await fetch(`/api/graph?limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      if (data.nodes && data.nodes.length > 0) return data;
    }
  } catch (e) {
    try {
      const res2 = await fetch(`http://localhost:3001/api/graph?limit=${limit}`);
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2.nodes && data2.nodes.length > 0) return data2;
      }
    } catch (e2) {}
  }
  return FALLBACK_SEED_DATA;
}

export async function simulateDisruption(supplierId) {
  try {
    const res = await fetch(`/api/simulate-disruption?supplierId=${encodeURIComponent(supplierId)}`);
    if (res.ok) return await res.json();
  } catch (e) {
    try {
      const res2 = await fetch(`http://localhost:3001/api/simulate-disruption?supplierId=${encodeURIComponent(supplierId)}`);
      if (res2.ok) return await res2.json();
    } catch (e2) {}
  }

  // Local fallback calculation for TSMC / ASML / Infineon
  const supplier = FALLBACK_SEED_DATA.nodes.find(n => n.id === supplierId);
  const suppliedComponents = FALLBACK_SEED_DATA.relationships
    .filter(r => r.from === supplierId)
    .map(r => r.to);

  const affectedProductsMap = new Map();
  const paths = [];

  suppliedComponents.forEach(cmpId => {
    const componentNode = FALLBACK_SEED_DATA.nodes.find(n => n.id === cmpId);
    
    // Level 2 (Supplier -> Component -> Product)
    const productRels = FALLBACK_SEED_DATA.relationships.filter(r => r.to === cmpId && r.type === 'REQUIRES_COMPONENT');
    productRels.forEach(pRel => {
      const prod = FALLBACK_SEED_DATA.nodes.find(n => n.id === pRel.from);
      if (prod) {
        affectedProductsMap.set(prod.id, prod);
        paths.push({
          depth: 2,
          pathNodes: [
            { id: supplier?.id, name: supplier?.name, label: 'Supplier' },
            { id: componentNode?.id, name: componentNode?.name, label: 'Component' },
            { id: prod.id, name: prod.name, label: 'Product' }
          ]
        });
      }
    });

    // Level 3 (Supplier -> Material -> Component -> Product)
    const matRels = FALLBACK_SEED_DATA.relationships.filter(r => r.to === cmpId && r.type === 'MADE_OF');
    matRels.forEach(mRel => {
      const compTarget = FALLBACK_SEED_DATA.nodes.find(n => n.id === mRel.from);
      if (compTarget) {
        const prodRels2 = FALLBACK_SEED_DATA.relationships.filter(r => r.to === compTarget.id);
        prodRels2.forEach(pr2 => {
          const prod2 = FALLBACK_SEED_DATA.nodes.find(n => n.id === pr2.from);
          if (prod2) {
            affectedProductsMap.set(prod2.id, prod2);
            paths.push({
              depth: 3,
              pathNodes: [
                { id: supplier?.id, name: supplier?.name, label: 'Supplier' },
                { id: componentNode?.id, name: componentNode?.name, label: 'Material' },
                { id: compTarget.id, name: compTarget.name, label: 'Component' },
                { id: prod2.id, name: prod2.name, label: 'Product' }
              ]
            });
          }
        });
      }
    });
  });

  const affectedProducts = Array.from(affectedProductsMap.values());
  const totalRevenueAtRisk = affectedProducts.reduce((acc, p) => acc + (p.revenue || 0), 0);

  return {
    mode: 'MOCK_FALLBACK',
    supplierId,
    supplierName: supplier?.name || supplierId,
    supplierTier: supplier?.tier || 'Tier-3',
    affectedProductsCount: affectedProducts.length,
    totalRevenueAtRisk,
    affectedProducts,
    paths,
    durationMs: 4
  };
}

export async function fetchBottlenecks(minProducts = 2) {
  try {
    const res = await fetch(`/api/bottlenecks?minProducts=${minProducts}`);
    if (res.ok) {
      const data = await res.json();
      if (data.bottlenecks && data.bottlenecks.length > 0) return data;
    }
  } catch (e) {
    try {
      const res2 = await fetch(`http://localhost:3001/api/bottlenecks?minProducts=${minProducts}`);
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2.bottlenecks && data2.bottlenecks.length > 0) return data2;
      }
    } catch (e2) {}
  }

  // Local fallback bottlenecks
  const suppliers = FALLBACK_SEED_DATA.nodes.filter(n => n.label === 'Supplier');
  const bottlenecks = suppliers.map(sup => {
    const suppliedRels = FALLBACK_SEED_DATA.relationships.filter(r => r.from === sup.id);
    const affectedProdsMap = new Map();

    suppliedRels.forEach(sRel => {
      const target = FALLBACK_SEED_DATA.nodes.find(n => n.id === sRel.to);
      if (target) {
        FALLBACK_SEED_DATA.relationships.filter(r => r.to === target.id).forEach(pRel => {
          const prod = FALLBACK_SEED_DATA.nodes.find(n => n.id === pRel.from);
          if (prod && prod.label === 'Product') affectedProdsMap.set(prod.id, prod);
        });
      }
    });

    const products = Array.from(affectedProdsMap.values());
    const totalRevenueAtRisk = products.reduce((acc, p) => acc + (p.revenue || 0), 0);

    return {
      supplierId: sup.id,
      supplierName: sup.name,
      supplierTier: sup.tier,
      country: sup.country,
      reliabilityScore: sup.reliabilityScore,
      affectedProductsCount: products.length,
      totalRevenueAtRisk,
      products
    };
  }).filter(b => b.affectedProductsCount >= minProducts)
    .sort((a, b) => b.totalRevenueAtRisk - a.totalRevenueAtRisk);

  return { mode: 'MOCK_FALLBACK', bottlenecks, durationMs: 3 };
}

export async function fetchAlternativeSuppliers(productId, disruptedSupplierId) {
  try {
    const res = await fetch(`/api/alternative-suppliers?productId=${encodeURIComponent(productId)}&disruptedSupplierId=${encodeURIComponent(disruptedSupplierId)}`);
    if (res.ok) return await res.json();
  } catch (e) {
    try {
      const res2 = await fetch(`http://localhost:3001/api/alternative-suppliers?productId=${encodeURIComponent(productId)}&disruptedSupplierId=${encodeURIComponent(disruptedSupplierId)}`);
      if (res2.ok) return await res2.json();
    } catch (e2) {}
  }

  return {
    mode: 'MOCK_FALLBACK',
    alternatives: [
      {
        componentId: 'CMP-201',
        componentName: 'TSMC 3nm N3E SoC Processor',
        altSupplierId: 'SUP-405',
        altSupplierName: 'Kyoto Precision Semiconductor Optics',
        altSupplierTier: 'Tier-3',
        country: 'Japan',
        score: 95,
        leadTimeDays: 50
      },
      {
        componentId: 'CMP-203',
        componentName: 'Infineon 800V SiC MOSFET Module',
        altSupplierId: 'SUP-401',
        altSupplierName: 'TSMC',
        altSupplierTier: 'Tier-3',
        country: 'Taiwan',
        score: 98,
        leadTimeDays: 60
      }
    ],
    durationMs: 3
  };
}

export async function seedDatabase() {
  try {
    const res = await fetch('/api/seed', { method: 'POST' });
    if (res.ok) return await res.json();
  } catch (e) {
    try {
      const res2 = await fetch('http://localhost:3001/api/seed', { method: 'POST' });
      if (res2.ok) return await res2.json();
    } catch (e2) {}
  }
  return { success: false, error: 'Database endpoint unavailable' };
}

export async function fetchCypherCatalog() {
  try {
    const res = await fetch('/api/cypher-catalog');
    if (res.ok) return await res.json();
  } catch (e) {
    try {
      const res2 = await fetch('http://localhost:3001/api/cypher-catalog');
      if (res2.ok) return await res2.json();
    } catch (e2) {}
  }
  return {
    DISRUPTION_BLAST_RADIUS: {
      name: 'Multi-Hop Disruption Blast Radius',
      description: 'Traces multi-hop dependency paths from a disrupted supplier to affected consumer products (1..5 hops)',
      cypher: `MATCH (s:Supplier {id: $supplierId})\nMATCH path = (s)-[:SUPPLIES|REQUIRES_COMPONENT|MADE_OF*1..5]->(p:Product)\nWITH s, p, path, length(path) as depth\nRETURN s.name, p.name, p.revenue, length(path) AS depth ORDER BY p.revenue DESC`
    },
    DETECT_SPOF_BOTTLENECKS: {
      name: 'Single Point of Failure (SPOF) Bottlenecks',
      description: 'Identifies suppliers critical to 2+ product lines, summing total revenue at risk',
      cypher: `MATCH (p:Product)-[:REQUIRES_COMPONENT*1..5]->(c:Component)<-[:SUPPLIES]-(s:Supplier)\nWITH s, count(DISTINCT p) AS affectedProductsCount, sum(DISTINCT p.revenue) AS totalRevenueAtRisk\nWHERE affectedProductsCount >= $minProducts\nRETURN s.name, s.tier, affectedProductsCount, totalRevenueAtRisk ORDER BY totalRevenueAtRisk DESC`
    }
  };
}
