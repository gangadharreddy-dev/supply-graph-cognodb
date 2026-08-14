import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

let driver = null;

export function getDriver() {
  const uri = process.env.COGNODB_URI || process.env.NEO4J_URI;
  const user = process.env.COGNODB_USER || process.env.NEO4J_USER || 'cognodb';
  const password = process.env.COGNODB_PASSWORD || process.env.NEO4J_PASSWORD;

  if (!uri || !password) {
    return null;
  }

  if (!driver) {
    driver = neo4j.driver(
      uri,
      neo4j.auth.basic(user, password),
      {
        maxConnectionPoolSize: 50,
        connectionTimeout: 5000
      }
    );
  }

  return driver;
}

export async function testConnection() {
  const activeDriver = getDriver();
  if (!activeDriver) {
    return {
      connected: false,
      reason: 'Environment variables COGNODB_URI or COGNODB_PASSWORD are not configured.'
    };
  }

  const session = activeDriver.session();
  try {
    const result = await session.run('MATCH (n) RETURN count(n) AS totalNodes LIMIT 1');
    const totalNodes = result.records[0]?.get('totalNodes')?.toNumber() ?? 0;
    return {
      connected: true,
      totalNodes,
      uri: process.env.COGNODB_URI
    };
  } catch (error) {
    return {
      connected: false,
      reason: error.message
    };
  } finally {
    await session.close();
  }
}

export async function runCypher(cypher, params = {}) {
  const activeDriver = getDriver();
  if (!activeDriver) {
    throw new Error('CognoDB driver is not configured.');
  }

  const session = activeDriver.session();
  const start = Date.now();
  try {
    const result = await session.run(cypher, params);
    const durationMs = Date.now() - start;
    return { records: result.records, summary: result.summary, durationMs };
  } finally {
    await session.close();
  }
}
