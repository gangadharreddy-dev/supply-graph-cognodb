/**
 * Parameterized openCypher Query Catalog for SupplyPulse
 * Strictly uses parameters ($param) to prevent Cypher injection vulnerabilities.
 */

export const CYPHER_QUERIES = {

  // 1. Fetch Full Graph (with node & edge limits)
  FETCH_FULL_GRAPH: {
    description: "Fetch nodes and relationships for interactive visual graph rendering",
    cypher: `
      MATCH (n)
      OPTIONAL MATCH (n)-[r]->(m)
      RETURN n, r, m
      LIMIT $limit
    `
  },

  // 2. Multi-Hop Traversal: Disruption Blast Radius (2-5 Hops)
  SIMULATE_SUPPLIER_DISRUPTION: {
    description: "Trace multi-hop impact from a disrupted supplier through components/materials to affected end-products (2+ hops)",
    cypher: `
      MATCH (s:Supplier {id: $supplierId})
      MATCH path = (s)-[:SUPPLIES|REQUIRES_COMPONENT|MADE_OF*1..5]->(p:Product)
      WITH s, p, path, length(path) AS depth
      RETURN 
        s.id AS supplierId,
        s.name AS supplierName,
        s.tier AS supplierTier,
        p.id AS productId,
        p.name AS productName,
        p.sku AS productSku,
        p.revenue AS productRevenue,
        p.riskScore AS productRiskScore,
        depth,
        [node IN nodes(path) | {
          id: node.id,
          name: coalesce(node.name, node.id),
          label: labels(node)[0]
        }] AS pathNodes
      ORDER BY p.revenue DESC, depth ASC
    `
  },

  // 3. Bottleneck & Single Point of Failure (SPOF) Analysis (Awkward in SQL)
  DETECT_BOTTLENECKS: {
    description: "Identify multi-product bottleneck suppliers whose failure impacts the highest total revenue (Multi-table RDBMS bottleneck query)",
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

  // 4. Alternative Resilience Routing
  FIND_ALTERNATIVE_SUPPLIERS: {
    description: "Find alternate active suppliers for components in affected products to mitigate disruption",
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
  },

  // 5. Node Details & Neighborhood Inspection
  GET_NODE_DETAILS: {
    description: "Fetch comprehensive properties and immediate 1-hop connections for any node",
    cypher: `
      MATCH (n {id: $nodeId})
      OPTIONAL MATCH (n)-[r]->(out)
      OPTIONAL MATCH (in)-[r2]->(n)
      RETURN n, 
             labels(n)[0] AS label,
             collect(DISTINCT {type: type(r), dir: 'OUTGOING', node: {id: out.id, name: coalesce(out.name, out.id), label: labels(out)[0]}}) AS outgoing,
             collect(DISTINCT {type: type(r2), dir: 'INCOMING', node: {id: in.id, name: coalesce(in.name, in.id), label: labels(in)[0]}}) AS incoming
    `
  }
};
