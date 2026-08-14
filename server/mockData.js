/**
 * Realistic Mock Supply Chain Graph Dataset
 * Used for fallback mode when CognoDB Cloud is unreachable or credentials are not yet supplied.
 */

export const MOCK_GRAPH = {
  nodes: [
    // Products (End Products)
    { id: 'PRD-101', label: 'Product', name: 'AeroX Quantum Laptop', sku: 'LAP-QX-9', revenue: 14500000, category: 'Computing', riskScore: 82 },
    { id: 'PRD-102', label: 'Product', name: 'VisionPro AR Headset', sku: 'AR-VP-2026', revenue: 22800000, category: 'Wearables', riskScore: 94 },
    { id: 'PRD-103', label: 'Product', name: 'SolarMax Smart Inverter', sku: 'SLR-INV-5K', revenue: 9800000, category: 'Clean Energy', riskScore: 65 },
    { id: 'PRD-104', label: 'Product', name: 'PulseEV Battery Control Module', sku: 'EV-BCM-800V', revenue: 31000000, category: 'Automotive', riskScore: 88 },

    // Tier 1 / Sub-assembly Components
    { id: 'CMP-201', label: 'Component', name: 'Neural Processing Unit (NPU)', code: 'NPU-M3-4NM', leadTimeDays: 45, unitCost: 320 },
    { id: 'CMP-202', label: 'Component', name: 'MicroOLED 4K Display Panel', code: 'DSP-OLED-4K', leadTimeDays: 60, unitCost: 450 },
    { id: 'CMP-203', label: 'Component', name: '800V SiC Power Management IC', code: 'PMIC-SIC-800', leadTimeDays: 30, unitCost: 180 },
    { id: 'CMP-204', label: 'Component', name: 'Lithium Solid-State Cell Pack', code: 'BAT-LSS-90K', leadTimeDays: 50, unitCost: 1200 },
    { id: 'CMP-205', label: 'Component', name: 'High-Precision LiDAR Module', code: 'SNS-LID-V3', leadTimeDays: 40, unitCost: 280 },
    { id: 'CMP-206', label: 'Component', name: 'Titanium Aerospace Enclosure', code: 'ENC-TI-AERO', leadTimeDays: 25, unitCost: 140 },

    // Raw Materials
    { id: 'MAT-301', label: 'Material', name: 'Monocrystalline Silicon Wafers', category: 'Semiconductor', scarcityIndex: 9.2 },
    { id: 'MAT-302', label: 'Material', name: 'Neodymium Rare Earth Magnets', category: 'Rare Earth', scarcityIndex: 8.7 },
    { id: 'MAT-303', label: 'Material', name: 'Battery-Grade Lithium Hydroxide', category: 'Chemical', scarcityIndex: 7.9 },
    { id: 'MAT-304', label: 'Material', name: 'Optical Grade Sapphire Substrate', category: 'Crystal', scarcityIndex: 6.8 },

    // Suppliers (Tier 1 - Tier 4)
    { id: 'SUP-401', label: 'Supplier', name: 'Taiwan Tech Foundry Corp', tier: 'Tier-3', country: 'Taiwan', reliabilityScore: 96, status: 'ACTIVE' },
    { id: 'SUP-402', label: 'Supplier', name: 'Nordic Lithium Refining AB', tier: 'Tier-2', country: 'Sweden', reliabilityScore: 91, status: 'ACTIVE' },
    { id: 'SUP-403', label: 'Supplier', name: 'Kyoto Precision Optics Co', tier: 'Tier-2', country: 'Japan', reliabilityScore: 94, status: 'ACTIVE' },
    { id: 'SUP-404', label: 'Supplier', name: 'Shenzhen Electronics Assembly', tier: 'Tier-1', country: 'China', reliabilityScore: 88, status: 'ACTIVE' },
    { id: 'SUP-405', label: 'Supplier', name: 'Stuttgart AutoSystems GmbH', tier: 'Tier-1', country: 'Germany', reliabilityScore: 95, status: 'ACTIVE' },
    { id: 'SUP-406', label: 'Supplier', name: 'Apex Rare Earth Mining Ltd', tier: 'Tier-4', country: 'Australia', reliabilityScore: 89, status: 'ACTIVE' },

    // Facilities
    { id: 'FAC-501', label: 'Facility', name: 'Hsinchu Semiconductor Fab 14', city: 'Hsinchu', country: 'Taiwan', riskFactor: 'Typhoon Zone / Seismic' },
    { id: 'FAC-502', label: 'Facility', name: 'Kiruna Chemical Refinery', city: 'Kiruna', country: 'Sweden', riskFactor: 'Sub-Zero Logistics' },
    { id: 'FAC-503', label: 'Facility', name: 'Kyoto Optics Plant', city: 'Kyoto', country: 'Japan', riskFactor: 'Seismic' }
  ],

  relationships: [
    // Products require Components
    { from: 'PRD-101', to: 'CMP-201', type: 'REQUIRES_COMPONENT', quantity: 1 },
    { from: 'PRD-101', to: 'CMP-203', type: 'REQUIRES_COMPONENT', quantity: 2 },
    { from: 'PRD-101', to: 'CMP-206', type: 'REQUIRES_COMPONENT', quantity: 1 },

    { from: 'PRD-102', to: 'CMP-201', type: 'REQUIRES_COMPONENT', quantity: 2 },
    { from: 'PRD-102', to: 'CMP-202', type: 'REQUIRES_COMPONENT', quantity: 2 },
    { from: 'PRD-102', to: 'CMP-205', type: 'REQUIRES_COMPONENT', quantity: 4 },
    { from: 'PRD-102', to: 'CMP-206', type: 'REQUIRES_COMPONENT', quantity: 1 },

    { from: 'PRD-103', to: 'CMP-203', type: 'REQUIRES_COMPONENT', quantity: 4 },
    { from: 'PRD-103', to: 'CMP-205', type: 'REQUIRES_COMPONENT', quantity: 1 },

    { from: 'PRD-104', to: 'CMP-203', type: 'REQUIRES_COMPONENT', quantity: 8 },
    { from: 'PRD-104', to: 'CMP-204', type: 'REQUIRES_COMPONENT', quantity: 1 },

    // Components made of Materials
    { from: 'CMP-201', to: 'MAT-301', type: 'MADE_OF', proportion: 0.85 },
    { from: 'CMP-202', to: 'MAT-304', type: 'MADE_OF', proportion: 0.60 },
    { from: 'CMP-203', to: 'MAT-301', type: 'MADE_OF', proportion: 0.70 },
    { from: 'CMP-204', to: 'MAT-303', type: 'MADE_OF', proportion: 0.90 },
    { from: 'CMP-205', to: 'MAT-302', type: 'MADE_OF', proportion: 0.40 },

    // Suppliers supply Components or Materials
    { from: 'SUP-401', to: 'CMP-201', type: 'SUPPLIES', leadTimeDays: 45, isPrimary: true },
    { from: 'SUP-401', to: 'MAT-301', type: 'SUPPLIES', leadTimeDays: 30, isPrimary: true },
    { from: 'SUP-402', to: 'MAT-303', type: 'SUPPLIES', leadTimeDays: 50, isPrimary: true },
    { from: 'SUP-403', to: 'CMP-202', type: 'SUPPLIES', leadTimeDays: 60, isPrimary: true },
    { from: 'SUP-403', to: 'MAT-304', type: 'SUPPLIES', leadTimeDays: 40, isPrimary: true },
    { from: 'SUP-404', to: 'CMP-205', type: 'SUPPLIES', leadTimeDays: 35, isPrimary: true },
    { from: 'SUP-405', to: 'CMP-203', type: 'SUPPLIES', leadTimeDays: 25, isPrimary: true },
    { from: 'SUP-406', to: 'MAT-302', type: 'SUPPLIES', leadTimeDays: 70, isPrimary: true },

    // Suppliers operate in Facilities
    { from: 'SUP-401', to: 'FAC-501', type: 'LOCATED_AT' },
    { from: 'SUP-402', to: 'FAC-502', type: 'LOCATED_AT' },
    { from: 'SUP-403', to: 'FAC-503', type: 'LOCATED_AT' }
  ]
};

export function simulateMockDisruption(supplierId) {
  const supplier = MOCK_GRAPH.nodes.find(n => n.id === supplierId);
  if (!supplier) return { supplierId, affectedProducts: [], totalRevenueAtRisk: 0, paths: [] };

  // Find all direct & indirect paths from supplier to products
  const paths = [];
  const affectedProductsMap = new Map();

  // Find elements directly supplied
  const suppliedRels = MOCK_GRAPH.relationships.filter(r => r.from === supplierId && (r.type === 'SUPPLIES'));
  
  suppliedRels.forEach(rel1 => {
    const target1 = MOCK_GRAPH.nodes.find(n => n.id === rel1.to);
    if (!target1) return;

    if (target1.label === 'Product') {
      affectedProductsMap.set(target1.id, target1);
      paths.push({
        depth: 1,
        nodesOnPath: [supplier, target1]
      });
    }

    // Level 2 (e.g. Supplier -> Material/Component -> Product)
    const rels2 = MOCK_GRAPH.relationships.filter(r => r.from === target1.id);
    rels2.forEach(rel2 => {
      const target2 = MOCK_GRAPH.nodes.find(n => n.id === rel2.to);
      if (!target2) return;

      if (target2.label === 'Product') {
        affectedProductsMap.set(target2.id, target2);
        paths.push({
          depth: 2,
          nodesOnPath: [supplier, target1, target2]
        });
      }

      // Level 3 (e.g. Supplier -> Material -> Component -> Product)
      const rels3 = MOCK_GRAPH.relationships.filter(r => r.from === target2.id);
      rels3.forEach(rel3 => {
        const target3 = MOCK_GRAPH.nodes.find(n => n.id === rel3.to);
        if (!target3) return;

        if (target3.label === 'Product') {
          affectedProductsMap.set(target3.id, target3);
          paths.push({
            depth: 3,
            nodesOnPath: [supplier, target1, target2, target3]
          });
        }
      });
    });
  });

  const affectedProducts = Array.from(affectedProductsMap.values());
  const totalRevenueAtRisk = affectedProducts.reduce((sum, p) => sum + (p.revenue || 0), 0);

  return {
    supplierId,
    supplierName: supplier.name,
    supplierTier: supplier.tier,
    affectedProductsCount: affectedProducts.length,
    totalRevenueAtRisk,
    affectedProducts,
    paths
  };
}

export function detectMockBottlenecks(minProducts = 2) {
  const supplierImpacts = MOCK_GRAPH.nodes
    .filter(n => n.label === 'Supplier')
    .map(sup => {
      const sim = simulateMockDisruption(sup.id);
      return {
        supplierId: sup.id,
        supplierName: sup.name,
        supplierTier: sup.tier,
        country: sup.country,
        reliabilityScore: sup.reliabilityScore,
        affectedProductsCount: sim.affectedProductsCount,
        totalRevenueAtRisk: sim.totalRevenueAtRisk,
        products: sim.affectedProducts
      };
    })
    .filter(res => res.affectedProductsCount >= minProducts)
    .sort((a, b) => b.totalRevenueAtRisk - a.totalRevenueAtRisk);

  return supplierImpacts;
}
