import { getDriver, testConnection } from '../config/db.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function seedDatabase() {
  console.log('⚡ Starting CognoDB openCypher Graph Seeder...');
  
  const status = await testConnection();
  if (!status.connected) {
    console.error('❌ Database connection unavailable:', status.reason);
    return { success: false, error: status.reason };
  }

  const rawData = readFileSync(join(__dirname, 'seedData.json'), 'utf-8');
  const seedData = JSON.parse(rawData);

  const driver = getDriver();
  const session = driver.session();

  try {
    console.log('🧹 Purging existing graph topology (MATCH (n) DETACH DELETE n)...');
    await session.run('MATCH (n) DETACH DELETE n');

    console.log(`📦 Inserting ${seedData.nodes.length} Nodes...`);
    for (const node of seedData.nodes) {
      if (node.label === 'Product') {
        await session.run(`
          CREATE (p:Product {
            id: $id, name: $name, sku: $sku, revenue: $revenue, category: $category, riskScore: $riskScore
          })
        `, { ...node, revenue: Math.floor(node.revenue), riskScore: Math.floor(node.riskScore) });
      } else if (node.label === 'Component') {
        await session.run(`
          CREATE (c:Component {
            id: $id, name: $name, code: $code, leadTimeDays: $leadTimeDays, unitCost: $unitCost
          })
        `, { ...node, leadTimeDays: Math.floor(node.leadTimeDays), unitCost: Math.floor(node.unitCost) });
      } else if (node.label === 'Material') {
        await session.run(`
          CREATE (m:Material {
            id: $id, name: $name, category: $category, scarcityIndex: $scarcityIndex
          })
        `, node);
      } else if (node.label === 'Supplier') {
        await session.run(`
          CREATE (s:Supplier {
            id: $id, name: $name, tier: $tier, country: $country, reliabilityScore: $reliabilityScore, status: $status
          })
        `, { ...node, reliabilityScore: Math.floor(node.reliabilityScore) });
      } else if (node.label === 'Facility') {
        await session.run(`
          CREATE (f:Facility {
            id: $id, name: $name, city: $city, country: $country, riskFactor: $riskFactor
          })
        `, node);
      }
    }

    console.log(`🔗 Inserting ${seedData.relationships.length} Directed Relationships...`);
    for (const rel of seedData.relationships) {
      await session.run(`
        MATCH (a {id: $fromId}), (b {id: $toId})
        CREATE (a)-[r:${rel.type}]->(b)
      `, { fromId: rel.from, toId: rel.to });
    }

    const nRes = await session.run('MATCH (n) RETURN count(n) AS nodeCount');
    const rRes = await session.run('MATCH ()-[r]->() RETURN count(r) AS relCount');

    const nodeCount = nRes.records[0].get('nodeCount').toNumber();
    const relCount = rRes.records[0].get('relCount').toNumber();

    console.log(`✅ CognoDB Seeder Succeeded! Populated ${nodeCount} nodes and ${relCount} relationships.`);
    return { success: true, nodeCount, relCount };
  } catch (err) {
    console.error('❌ Seeder Error:', err);
    return { success: false, error: err.message };
  } finally {
    await session.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0));
}
