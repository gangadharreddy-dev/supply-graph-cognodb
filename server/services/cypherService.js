/**
 * Parameterized openCypher Query Registry
 * Strict parameterization ($supplierId, $minProducts, etc.) prevents Cypher injection.
 */

export const QUERIES = {
  // 1. Fetch entire graph topology for visual rendering
  GET_FULL_TOPOLOGY: {
    name: 'Full Network Topology',
    description: 'Fetches node labeled entities and directed relationships up to limit',
    cypher: `
      MATCH (n)
      OPTIONAL MATCH (n)-[r]->(m)
      RETURN n, r, m
      LIMIT $limit
    `
  },

  // 2. Multi-hop disruption blast radius calculation (2-5 hops)
  DISRUPTION_BLAST_RADIUS: {
    name: 'Multi-Hop Disruption Blast Radius',
    description: 'Traces multi-hop dependency paths from a disrupted supplier to affected consumer products (1..5 hops)',
    cypher: `
      MATCH (s:Supplier {id: $supplierId})
      MATCH path = (s)-[:SUPPLIES|REQUIRES_COMPONENT|MADE_OF*1..5]->(p:Product)
      WITH s, p, path, length(path) as depth
      RETURN 
        s.id AS supplierId,
        s.name AS supplierName,
        s.tier AS supplierTier,
        p.id AS productId,
        p.name AS productName,
        p.sku AS productSku,
        p.revenue AS productRevenue,
        depth,
        [node IN nodes(path) | {
          id: node.id,
          name: coalesce(node.name, node.id),
          label: labels(node)[0]
        }] AS pathNodes
      ORDER BY p.revenue DESC, depth ASC
    `
  },

  // 3. Bottleneck and Single Point of Failure (SPOF) supplier detection
  DETECT_SPOF_BOTTLENECKS: {
    name: 'Single Point of Failure (SPOF) Bottlenecks',
    description: 'Identifies suppliers critical to 2+ product lines, summing total revenue at risk',
    cypher: `
      MATCH (p:Product)-[:REQUIRES_COMPONENT*1..5]->(c:Component)<-[:SUPPLIES]-(s:Supplier)
      WITH s, count(DISTINCT p) AS affectedProductsCount, sum(DISTINCT p.revenue) AS totalRevenueAtRisk, collect(DISTINCT {id: p.id, name: p.name, revenue: p.revenue}) AS products
      WHERE affectedProductsCount >= $minProducts
      RETURN 
        s.id AS supplierId,
        s.name AS supplierName,
        s.tier AS supplierTier,
        s.country AS country,
        s.reliabilityScore AS reliabilityScore,
        affectedProductsCount,
        totalRevenueAtRisk,
        products
      ORDER BY affectedProductsCount DESC, totalRevenueAtRisk DESC
    `
  },

  // 4. Alternative supplier pathfinder
  FIND_ALTERNATIVE_SUPPLIERS: {
    name: 'Alternate Supplier Pathfinder',
    description: 'Locates active secondary suppliers capable of supplying components for impacted products',
    cypher: `
      MATCH (p:Product {id: $productId})-[:REQUIRES_COMPONENT*1..5]->(c:Component)
      MATCH (c)<-[r:SUPPLIES]-(alt:Supplier)
      WHERE alt.status = 'ACTIVE' AND alt.id <> $disruptedSupplierId
      RETURN 
        c.id AS componentId,
        c.name AS componentName,
        alt.id AS altSupplierId,
        alt.name AS altSupplierName,
        alt.tier AS altSupplierTier,
        alt.country AS country,
        alt.reliabilityScore AS score,
        r.leadTimeDays AS leadTimeDays
      ORDER BY alt.reliabilityScore DESC
    `
  }
};
