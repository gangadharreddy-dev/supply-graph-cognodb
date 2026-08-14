import { getDriver, checkConnection } from './db.js';
import { MOCK_GRAPH } from './mockData.js';
import dotenv from 'dotenv';

dotenv.config();

export async function seedGraphDatabase() {
  console.log('--- CognoDB openCypher Graph Seeder ---');
  
  const conn = await checkConnection();
  if (!conn.connected) {
    console.error('❌ Cannot seed database:', conn.error);
    console.log('💡 Please check your .env credentials (COGNODB_URI, COGNODB_USER, COGNODB_PASSWORD).');
    return { success: false, error: conn.error };
  }

  console.log(`✅ Connected to CognoDB Cloud at ${conn.uri}`);
  const driver = getDriver();
  const session = driver.session();

  try {
    console.log('🧹 Clearing existing graph data (MATCH (n) DETACH DELETE n)...');
    await session.run('MATCH (n) DETACH DELETE n');

    console.log('📦 Seeding Node Labels (Product, Component, Material, Supplier, Facility)...');
    
    // Seed Products
    for (const node of MOCK_GRAPH.nodes) {
      if (node.label === 'Product') {
        await session.run(`
          CREATE (p:Product {
            id: $id,
            name: $name,
            sku: $sku,
            revenue: $revenue,
            category: $category,
            riskScore: $riskScore
          })
        `, {
          id: node.id,
          name: node.name,
          sku: node.sku,
          revenue: neo4jInt(node.revenue),
          category: node.category,
          riskScore: neo4jInt(node.riskScore)
        });
      } else if (node.label === 'Component') {
        await session.run(`
          CREATE (c:Component {
            id: $id,
            name: $name,
            code: $code,
            leadTimeDays: $leadTimeDays,
            unitCost: $unitCost
          })
        `, {
          id: node.id,
          name: node.name,
          code: node.code,
          leadTimeDays: neo4jInt(node.leadTimeDays),
          unitCost: neo4jInt(node.unitCost)
        });
      } else if (node.label === 'Material') {
        await session.run(`
          CREATE (m:Material {
            id: $id,
            name: $name,
            category: $category,
            scarcityIndex: $scarcityIndex
          })
        `, {
          id: node.id,
          name: node.name,
          category: node.category,
          scarcityIndex: node.scarcityIndex
        });
      } else if (node.label === 'Supplier') {
        await session.run(`
          CREATE (s:Supplier {
            id: $id,
            name: $name,
            tier: $tier,
            country: $country,
            reliabilityScore: $reliabilityScore,
            status: $status
          })
        `, {
          id: node.id,
          name: node.name,
          tier: node.tier,
          country: node.country,
          reliabilityScore: neo4jInt(node.reliabilityScore),
          status: node.status
        });
      } else if (node.label === 'Facility') {
        await session.run(`
          CREATE (f:Facility {
            id: $id,
            name: $name,
            city: $city,
            country: $country,
            riskFactor: $riskFactor
          })
        `, {
          id: node.id,
          name: node.name,
          city: node.city,
          country: node.country,
          riskFactor: node.riskFactor
        });
      }
    }

    console.log('🔗 Seeding Typed Relationships (REQUIRES_COMPONENT, MADE_OF, SUPPLIES, LOCATED_AT)...');
    
    for (const rel of MOCK_GRAPH.relationships) {
      if (rel.type === 'REQUIRES_COMPONENT') {
        await session.run(`
          MATCH (source {id: $fromId}), (target {id: $toId})
          CREATE (source)-[r:REQUIRES_COMPONENT {quantity: $quantity}]->(target)
        `, { fromId: rel.from, toId: rel.to, quantity: neo4jInt(rel.quantity || 1) });
      } else if (rel.type === 'MADE_OF') {
        await session.run(`
          MATCH (source {id: $fromId}), (target {id: $toId})
          CREATE (source)-[r:MADE_OF {proportion: $proportion}]->(target)
        `, { fromId: rel.from, toId: rel.to, proportion: rel.proportion || 1.0 });
      } else if (rel.type === 'SUPPLIES') {
        await session.run(`
          MATCH (source {id: $fromId}), (target {id: $toId})
          CREATE (source)-[r:SUPPLIES {leadTimeDays: $leadTimeDays, isPrimary: $isPrimary}]->(target)
        `, {
          fromId: rel.from,
          toId: rel.to,
          leadTimeDays: neo4jInt(rel.leadTimeDays || 30),
          isPrimary: rel.isPrimary ?? true
        });
      } else if (rel.type === 'LOCATED_AT') {
        await session.run(`
          MATCH (source {id: $fromId}), (target {id: $toId})
          CREATE (source)-[r:LOCATED_AT]->(target)
        `, { fromId: rel.from, toId: rel.to });
      }
    }

    const countRes = await session.run('MATCH (n) RETURN count(n) AS nodeCount');
    const nodeCount = countRes.records[0].get('nodeCount').toNumber();

    const relRes = await session.run('MATCH ()-[r]->() RETURN count(r) AS relCount');
    const relCount = relRes.records[0].get('relCount').toNumber();

    console.log(`🎉 Seeding Complete! Inserted ${nodeCount} nodes and ${relCount} relationships into CognoDB Cloud.`);
    return { success: true, nodeCount, relCount };
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    return { success: false, error: err.message };
  } finally {
    await session.close();
  }
}

function neo4jInt(val) {
  return typeof val === 'number' ? Math.floor(val) : 0;
}

// If run directly via command line (node server/seed.js)
if (process.argv[1].endsWith('seed.js')) {
  seedGraphDatabase().then(() => process.exit(0));
}
