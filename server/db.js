import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

let driver = null;
let isConnected = false;
let connectionError = null;

export function getDriver() {
  const uri = process.env.COGNODB_URI || process.env.NEO4J_URI;
  const user = process.env.COGNODB_USER || process.env.NEO4J_USER || 'cognodb';
  const password = process.env.COGNODB_PASSWORD || process.env.NEO4J_PASSWORD;

  if (!uri || !password) {
    connectionError = 'Missing COGNODB_URI or COGNODB_PASSWORD in environment variables.';
    isConnected = false;
    return null;
  }

  if (!driver) {
    try {
      driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
        maxConnectionLifetime: 3 * 60 * 1000,
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 5000
      });
    } catch (err) {
      connectionError = err.message;
      isConnected = false;
      return null;
    }
  }

  return driver;
}

export async function checkConnection() {
  const activeDriver = getDriver();
  if (!activeDriver) {
    return {
      connected: false,
      error: connectionError || 'CognoDB driver not initialized. Running in Mock Fallback mode.'
    };
  }

  const session = activeDriver.session();
  try {
    const result = await session.run('MATCH (n) RETURN count(n) AS nodeCount LIMIT 1');
    const nodeCount = result.records[0]?.get('nodeCount')?.toNumber() ?? 0;
    isConnected = true;
    connectionError = null;
    return {
      connected: true,
      nodeCount,
      uri: process.env.COGNODB_URI || process.env.NEO4J_URI
    };
  } catch (err) {
    isConnected = false;
    connectionError = err.message;
    return {
      connected: false,
      error: `Failed to connect to CognoDB Cloud: ${err.message}`
    };
  } finally {
    await session.close();
  }
}

export async function executeQuery(cypher, params = {}) {
  const activeDriver = getDriver();
  if (!activeDriver) {
    throw new Error('CognoDB driver is offline or missing credentials.');
  }

  const session = activeDriver.session();
  const startTime = Date.now();
  try {
    const result = await session.run(cypher, params);
    const executionTimeMs = Date.now() - startTime;
    return {
      records: result.records,
      summary: result.summary,
      executionTimeMs
    };
  } finally {
    await session.close();
  }
}

export function getConnectionStatus() {
  return {
    isConnected,
    connectionError,
    uri: process.env.COGNODB_URI || process.env.NEO4J_URI || 'Not configured'
  };
}
