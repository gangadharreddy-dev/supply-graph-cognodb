import { testConnection, runCypher } from '../config/db.js';
import { QUERIES } from '../services/cypherService.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rawMockData = readFileSync(join(__dirname, '../seed/seedData.json'), 'utf-8');
const SEED_TOPOLOGY = JSON.parse(rawMockData);

// 1. Health check
export async function getHealthStatus(req, res) {
  const status = await testConnection();
  res.json({
    timestamp: new Date().toISOString(),
    ...status,
    mode: status.connected ? 'LIVE_COGNODB' : 'MOCK_FALLBACK'
  });
}

// 2. Fetch full graph topology
export async function getGraphTopology(req, res) {
  const status = await testConnection();
  if (status.connected) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const result = await runCypher(QUERIES.GET_FULL_TOPOLOGY.cypher, { limit });

      const nodesMap = new Map();
      const relsMap = new Map();

      result.records.forEach(rec => {
        const n = rec.get('n');
        const r = rec.get('r');
        const m = rec.get('m');

        if (n) {
          nodesMap.set(n.properties.id, {
            id: n.properties.id,
            label: n.labels[0],
            ...n.properties
          });
        }

        if (m) {
          nodesMap.set(m.properties.id, {
            id: m.properties.id,
            label: m.labels[0],
            ...m.properties
          });
        }

        if (r && n && m) {
          const key = `${n.properties.id}->${m.properties.id}:${r.type}`;
          relsMap.set(key, {
            id: key,
            from: n.properties.id,
            to: m.properties.id,
            type: r.type,
            ...r.properties
          });
        }
      });

      return res.json({
        mode: 'LIVE_COGNODB',
        nodes: Array.from(nodesMap.values()),
        relationships: Array.from(relsMap.values()),
        durationMs: result.durationMs
      });
    } catch (err) {
      console.warn('⚠️ Falling back to local topology cache:', err.message);
    }
  }

  return res.json({
    mode: 'MOCK_FALLBACK',
    nodes: SEED_TOPOLOGY.nodes,
    relationships: SEED_TOPOLOGY.relationships,
    durationMs: 4
  });
}

// 3. Multi-hop disruption blast radius simulation
export async function simulateDisruption(req, res) {
  const { supplierId } = req.query;
  if (!supplierId) {
    return res.status(400).json({ error: 'supplierId parameter is required' });
  }

  const status = await testConnection();
  if (status.connected) {
    try {
      const result = await runCypher(QUERIES.DISRUPTION_BLAST_RADIUS.cypher, { supplierId });
      
      let supplierName = '';
      let supplierTier = '';
      const affectedProductsMap = new Map();
      const paths = [];

      result.records.forEach(rec => {
        supplierName = rec.get('supplierName');
        supplierTier = rec.get('supplierTier');
        const productId = rec.get('productId');
        const productName = rec.get('productName');
        const productSku = rec.get('productSku');
        const productRevenue = rec.get('productRevenue')?.toNumber ? rec.get('productRevenue').toNumber() : rec.get('productRevenue');
        const depth = rec.get('depth')?.toNumber ? rec.get('depth').toNumber() : rec.get('depth');
        const pathNodes = rec.get('pathNodes');

        if (!affectedProductsMap.has(productId)) {
          affectedProductsMap.set(productId, {
            id: productId,
            name: productName,
            sku: productSku,
            revenue: productRevenue
          });
        }

        paths.push({ depth, pathNodes });
      });

      const affectedProducts = Array.from(affectedProductsMap.values());
      const totalRevenueAtRisk = affectedProducts.reduce((acc, p) => acc + (p.revenue || 0), 0);

      return res.json({
        mode: 'LIVE_COGNODB',
        supplierId,
        supplierName: supplierName || supplierId,
        supplierTier,
        affectedProductsCount: affectedProducts.length,
        totalRevenueAtRisk,
        affectedProducts,
        paths,
        durationMs: result.durationMs,
        cypher: QUERIES.DISRUPTION_BLAST_RADIUS.cypher,
        params: { supplierId }
      });
    } catch (err) {
      console.warn('⚠️ Simulation error, using mock engine:', err.message);
    }
  }

  // Fallback simulation
  const supplier = SEED_TOPOLOGY.nodes.find(n => n.id === supplierId);
  const suppliedComponents = SEED_TOPOLOGY.relationships
    .filter(r => r.from === supplierId)
    .map(r => r.to);

  const affectedProductsMap = new Map();
  const paths = [];

  suppliedComponents.forEach(cmpId => {
    const componentNode = SEED_TOPOLOGY.nodes.find(n => n.id === cmpId);
    
    // Find products requiring component directly or via subcomponents
    const productRels = SEED_TOPOLOGY.relationships.filter(r => r.to === cmpId && r.type === 'REQUIRES_COMPONENT');
    productRels.forEach(pRel => {
      const prod = SEED_TOPOLOGY.nodes.find(n => n.id === pRel.from);
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

    // Materials -> Components -> Products
    const matRels = SEED_TOPOLOGY.relationships.filter(r => r.to === cmpId && r.type === 'MADE_OF');
    matRels.forEach(mRel => {
      const compTarget = SEED_TOPOLOGY.nodes.find(n => n.id === mRel.from);
      if (compTarget) {
        const prodRels2 = SEED_TOPOLOGY.relationships.filter(r => r.to === compTarget.id);
        prodRels2.forEach(pr2 => {
          const prod2 = SEED_TOPOLOGY.nodes.find(n => n.id === pr2.from);
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

  return res.json({
    mode: 'MOCK_FALLBACK',
    supplierId,
    supplierName: supplier?.name || supplierId,
    supplierTier: supplier?.tier || 'Tier-3',
    affectedProductsCount: affectedProducts.length,
    totalRevenueAtRisk,
    affectedProducts,
    paths,
    durationMs: 5,
    cypher: QUERIES.DISRUPTION_BLAST_RADIUS.cypher,
    params: { supplierId }
  });
}

// 4. Bottlenecks & SPOF analysis
export async function getBottleneckAnalysis(req, res) {
  const minProducts = parseInt(req.query.minProducts) || 2;
  const status = await testConnection();

  if (status.connected) {
    try {
      const result = await runCypher(QUERIES.DETECT_SPOF_BOTTLENECKS.cypher, { minProducts });
      const bottlenecks = result.records.map(rec => {
        const affectedProductsCount = rec.get('affectedProductsCount')?.toNumber ? rec.get('affectedProductsCount').toNumber() : rec.get('affectedProductsCount');
        const totalRevenueAtRisk = rec.get('totalRevenueAtRisk')?.toNumber ? rec.get('totalRevenueAtRisk').toNumber() : rec.get('totalRevenueAtRisk');
        const reliabilityScore = rec.get('reliabilityScore')?.toNumber ? rec.get('reliabilityScore').toNumber() : rec.get('reliabilityScore');

        return {
          supplierId: rec.get('supplierId'),
          supplierName: rec.get('supplierName'),
          supplierTier: rec.get('supplierTier'),
          country: rec.get('country'),
          reliabilityScore,
          affectedProductsCount,
          totalRevenueAtRisk,
          products: rec.get('products')
        };
      });

      return res.json({
        mode: 'LIVE_COGNODB',
        bottlenecks,
        durationMs: result.durationMs,
        cypher: QUERIES.DETECT_SPOF_BOTTLENECKS.cypher,
        params: { minProducts }
      });
    } catch (err) {
      console.warn('⚠️ Bottlenecks error, using fallback:', err.message);
    }
  }

  // Fallback mock bottlenecks
  const suppliers = SEED_TOPOLOGY.nodes.filter(n => n.label === 'Supplier');
  const bottlenecks = suppliers.map(sup => {
    // calculate impact
    const suppliedRels = SEED_TOPOLOGY.relationships.filter(r => r.from === sup.id);
    const affectedProdsMap = new Map();

    suppliedRels.forEach(sRel => {
      const target = SEED_TOPOLOGY.nodes.find(n => n.id === sRel.to);
      if (target) {
        SEED_TOPOLOGY.relationships.filter(r => r.to === target.id).forEach(pRel => {
          const prod = SEED_TOPOLOGY.nodes.find(n => n.id === pRel.from);
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

  return res.json({
    mode: 'MOCK_FALLBACK',
    bottlenecks,
    durationMs: 4,
    cypher: QUERIES.DETECT_SPOF_BOTTLENECKS.cypher,
    params: { minProducts }
  });
}

// 5. Alternate supplier routing
export async function getAlternativeSuppliers(req, res) {
  const { productId, disruptedSupplierId } = req.query;
  const status = await testConnection();

  if (status.connected && productId) {
    try {
      const result = await runCypher(QUERIES.FIND_ALTERNATIVE_SUPPLIERS.cypher, {
        productId: productId || '',
        disruptedSupplierId: disruptedSupplierId || ''
      });

      const alternatives = result.records.map(rec => ({
        componentId: rec.get('componentId'),
        componentName: rec.get('componentName'),
        altSupplierId: rec.get('altSupplierId'),
        altSupplierName: rec.get('altSupplierName'),
        altSupplierTier: rec.get('altSupplierTier'),
        country: rec.get('country'),
        score: rec.get('score')?.toNumber ? rec.get('score').toNumber() : rec.get('score'),
        leadTimeDays: rec.get('leadTimeDays')?.toNumber ? rec.get('leadTimeDays').toNumber() : rec.get('leadTimeDays')
      }));

      return res.json({
        mode: 'LIVE_COGNODB',
        alternatives,
        durationMs: result.durationMs
      });
    } catch (err) {
      console.warn('⚠️ Alternative query error:', err.message);
    }
  }

  // Fallback
  return res.json({
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
  });
}

// 6. Cypher Catalog
export function getCypherCatalog(req, res) {
  res.json(QUERIES);
}
