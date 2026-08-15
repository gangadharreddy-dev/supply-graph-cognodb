# SupplyGraph — Supply Chain Multi-Hop Dependency & Risk Engine

> A graph-powered supply-chain intelligence application for exploring multi-tier dependencies, simulating supplier disruptions, identifying bottleneck suppliers, and estimating downstream revenue at risk.

<p align="center">
  <strong>Wexa AI — CognoDB Take-Home Assignment</strong>
</p>

---

## 🚀 Live Demo

**Production Application:**

https://supply-graph-cognodb-op7ryxair-gangadharreddy065-5671s-projects.vercel.app/

## 💻 Source Code

https://github.com/gangadharreddy-dev/supply-graph-cognodb

---

# 1. Project Overview

SupplyGraph is a graph-based supply-chain dependency and risk analysis application built for the Wexa AI CognoDB take-home assignment.

The application models a technology supply chain as a connected graph containing:

- Suppliers
- Components
- Materials
- Products
- Facilities

It allows users to:

- Explore multi-tier supply-chain dependencies
- Visualize the supply-chain graph
- Simulate supplier disruptions
- Identify affected downstream products
- Trace dependency paths across multiple hops
- Estimate revenue exposure
- Identify potential bottleneck and Single Point of Failure (SPOF) suppliers
- Inspect the underlying openCypher queries
- Verify the live CognoDB backend connection

The core business question is:

> **If a supplier experiences a disruption, which downstream products are affected, how deep is the dependency path, and what revenue is potentially at risk?**

This is naturally a graph traversal problem because the impact of a supplier can propagate through multiple components, sub-components, materials, and products.

SupplyGraph uses **CognoDB Cloud** with **openCypher** over the **Bolt protocol**, accessed through the official `neo4j-driver`.

---

# 2. Why a Graph Database?

Supply chains are naturally represented as directed dependency graphs.

A simplified dependency chain looks like:

```text
Supplier
   │
   │ SUPPLIES
   ▼
Component
   │
   │ REQUIRES_COMPONENT
   ▼
Sub-Component
   │
   │ REQUIRES_COMPONENT / MADE_OF
   ▼
Component / Material
   │
   │ REQUIRES_COMPONENT
   ▼
Product
| Architectural Dimension | Relational DB (PostgreSQL) | Graph DB (CognoDB openCypher) |
| :--- | :--- | :--- |
| **Multi-Hop Traversal (2–5 Hops)** | Requires 5–7 table `JOIN`s or complex `WITH RECURSIVE` CTEs. Execution time degrades exponentially with path depth. | Expressed in a **single Cypher pattern**: `(s:Supplier)-[:SUPPLIES\|REQUIRES_COMPONENT*1..5]->(p:Product)`. Executed in milliseconds via index-free adjacency. |
| **Bottleneck & SPOF Detection** | Grouping across recursive variable-length subtrees with distinct count aggregations requires heavy memory buffer scans and temporary tables. | Solved cleanly via pattern matching: `MATCH (p:Product)-[:REQUIRES_COMPONENT*1..5]->(c:Component)<-[:SUPPLIES]-(s:Supplier)` with aggregations over distinct product nodes. |
| **Schema Flexibility** | Adding new entity types (e.g., logistics hubs, transport routes, weather risks) requires `ALTER TABLE` DDL migrations and foreign key schema updates across multiple tables. | Graph schemas are naturally flexible. New node labels and relationship types can be added dynamically without altering existing queries. |

---

## 2. Data Model Specification

### Entity Labels & Properties
- `:Product` — `{ id, name, sku, revenue, category, riskScore }`
- `:Component` — `{ id, name, code, leadTimeDays, unitCost }`
- `:Material` — `{ id, name, category, scarcityIndex }`
- `:Supplier` — `{ id, name, tier, country, reliabilityScore, status }`
- `:Facility` — `{ id, name, city, country, riskFactor }`

### Typed Relationships
- `(:Product)-[:REQUIRES_COMPONENT {quantity}]->(:Component)`
- `(:Component)-[:REQUIRES_COMPONENT {quantity}]->(:Component)` (Sub-assemblies)
- `(:Component)-[:MADE_OF {proportion}]->(:Material)`
- `(:Supplier)-[:SUPPLIES {leadTimeDays, isPrimary}]->(:Component|Material)`
- `(:Supplier)-[:LOCATED_AT]->(:Facility)`

```mermaid
graph TD
    Fac[":Facility"]
    Sup[":Supplier"]
    Mat[":Material"]
    Cmp[":Component"]
    Prd[":Product"]

    Sup -->|":LOCATED_AT"| Fac
    Sup -->|":SUPPLIES"| Mat
    Sup -->|":SUPPLIES"| Cmp
    Cmp -->|":MADE_OF"| Mat
    Cmp -->|":REQUIRES_COMPONENT"| Cmp
    Prd -->|":REQUIRES_COMPONENT"| Cmp

    style Prd fill:#2563eb,color:#fff
    style Cmp fill:#7c3aed,color:#fff
    style Mat fill:#d97706,color:#fff
    style Sup fill:#059669,color:#fff
    style Fac fill:#e11d48,color:#fff
```

---

## 3. Parameterized openCypher Queries

### Query 1: Disruption Blast Radius (Multi-Hop 1..5 Hops)
```cypher
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
```

### Query 2: Bottleneck SPOF Supplier Detection (Awkward in SQL)
```cypher
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
```

---

## 4. Engineering Architecture & Project Structure

```
supplychain-graph-app/
├── package.json
├── .env.example
├── README.md
├── server/
│   ├── index.js                  # Express app entry point
│   ├── verify.js                 # Automated backend verification test suite (npm run test:verify)
│   ├── config/
│   │   └── db.js                 # Neo4j/CognoDB driver connection pool & fallback status
│   ├── controllers/
│   │   └── graphController.js    # API controller handling graph, simulation & bottleneck queries
│   ├── services/
│   │   └── cypherService.js     # openCypher query catalog
│   ├── routes/
│   │   └── api.js                # Express REST router
│   └── seed/
│       ├── seedData.json         # Real-world seed dataset (TSMC, ASML, Apple, Tesla)
│       └── seed.js               # Database seeder script
└── client/
    ├── vite.config.js
    └── src/
        ├── App.jsx
        └── components/
            ├── Header.jsx        # Navigation bar & DB status pill
            ├── BackendVerificationModal.jsx # Proof Matrix & Live Driver Test Runner
            ├── GraphView.jsx     # vis-network canvas visualization
            ├── DisruptionSimulator.jsx # Multi-hop path tracer
            ├── BottleneckAnalysis.jsx  # SPOF analysis dashboard
            └── QueryInspector.jsx      # openCypher terminal console
```

---

## 5. Local Setup & Execution Guide

### Step 1: Install Dependencies
```bash
npm install
cd client && npm install && cd ..
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your CognoDB Cloud credentials:
```env
COGNODB_URI=bolt+s://your-instance-id.databases.cognodb.cloud
COGNODB_USER=cognodb
COGNODB_PASSWORD=your-generated-password
PORT=3001
```

### Step 3: Run Automated Verification Suite
```bash
npm run test:verify
```

### Step 4: Run Database Seeder
```bash
npm run seed
```

### Step 5: Launch Application
```bash
npm run dev
```
Open ** [Live Demo : ](https://supply-graph-cognodb-op7ryxair-gangadharreddy065-5671s-projects.vercel.app/) in your browser.

# 3. Key Features

## 3.1 Interactive Graph Topology

SupplyGraph provides an interactive supply-chain graph visualization using `vis-network`.

The graph represents:

- Suppliers
- Components
- Materials
- Products
- Facilities
- Supply relationships
- Dependency relationships

Users can visually explore how suppliers, components, materials, and products are connected across the supply chain.

---

## 3.2 Disruption Pathfinder

The Disruption Pathfinder simulates a supplier disruption and traces its downstream impact.

For a selected supplier, the application identifies:

- Supplier information
- Impacted products
- Dependency paths
- Path depth
- Product information
- Product revenue
- Downstream revenue exposure

The traversal supports up to **5 relationship hops**, allowing the application to detect both direct and indirect dependencies.

---

## 3.3 Multi-Hop Dependency Analysis

SupplyGraph supports variable-length graph traversal across the supply chain.

The application can trace dependencies across:
```text
Supplier
   ↓
Component
   ↓
Sub-Component
   ↓
Component / Material
   ↓
Product
```



## 3.4 Revenue-at-Risk Analysis

SupplyGraph connects graph traversal results to business impact.

For impacted products, the application displays product revenue and uses downstream product exposure to help estimate the potential revenue associated with a supplier disruption.

This allows the system to move from:

Graph Dependency
       ↓
Impacted Product
       ↓
Revenue Exposure
## 3.5 Bottleneck / Single Point of Failure Analysis

SupplyGraph identifies suppliers that represent potential bottlenecks or Single Points of Failure (SPOFs).

The analysis considers:

- Number of affected products
- Revenue associated with affected products
- Supplier tier
- Supplier country
- Supplier reliability score
- Affected product details

This helps identify suppliers whose disruption could have a significant downstream business impact.

---

## 3.6 Interactive Cypher Inspector

The application provides an interactive interface for inspecting the openCypher queries used by the backend.

This allows evaluators and developers to understand how the graph database is queried for:

- Multi-hop disruption analysis
- Product dependency traversal
- Bottleneck detection
- Revenue aggregation

The application uses parameterized Cypher queries rather than concatenating user input into query strings.

---

## 3.7 Backend Verification

SupplyGraph includes a backend verification interface that demonstrates the application's database and query implementation.

The verification covers:

- CognoDB connectivity
- Official `neo4j-driver`
- Driver session execution
- Parameterized Cypher
- Multi-hop traversal
- Backend health
- Automated verification results

The verification interface provides a direct way for an evaluator to confirm that the application is connected to the graph database and executing the expected backend logic.

Verified production state:

```text
Mode = LIVE_COGNODB
Connected = true
```
# 4. Technology Stack

## Frontend

- **React** — Component-based user interface
- **Vite** — Frontend development and build tooling
- **Tailwind CSS** — Responsive UI styling
- **vis-network** — Interactive graph visualization

## Backend

- **Node.js** — Backend runtime
- **Express.js** — REST API server

## Database

- **CognoDB Cloud** — Graph database
- **openCypher** — Graph query language
- **Bolt Protocol** — Database communication protocol

## Database Driver

- **Official `neo4j-driver`** — Used to establish the CognoDB connection and execute Cypher queries

## Deployment

- **Vercel** — Production deployment

---

## Architecture Overview

```text
┌─────────────────────────────────────────────┐
│                 React Client                │
│                                             │
│  Graph View │ Disruption │ SPOF │ Queries  │
└──────────────────────┬──────────────────────┘
                       │
                       │ REST API
                       ▼
┌─────────────────────────────────────────────┐
│              Node.js / Express              │
│                                             │
│ Controllers │ Services │ Routes │ Verify   │
└──────────────────────┬──────────────────────┘
                       │
                       │ neo4j-driver
                       │ Bolt Protocol
                       ▼
┌─────────────────────────────────────────────┐
│                CognoDB Cloud                │
│                                             │
│              openCypher Graph               │
│                                             │
│ Supplier → Component → Material → Product  │
└─────────────────────────────────────────────┘
