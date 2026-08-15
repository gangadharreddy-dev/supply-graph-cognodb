# SupplyGraph — Supply Chain Multi-Hop Dependency & Risk Engine

> Graph-powered supply-chain intelligence application for multi-tier dependency analysis, supplier disruption simulation, bottleneck detection, and revenue-at-risk analysis.

**Wexa AI — CognoDB Take-Home Assignment**

## 🚀 Live Demo

https://supply-graph-cognodb-op7ryxair-gangadharreddy065-5671s-projects.vercel.app/

## 💻 Source Code

https://github.com/gangadharreddy-dev/supply-graph-cognodb

---

## 1. Overview

SupplyGraph models a technology supply chain as a graph containing:

- Suppliers
- Components
- Materials
- Products
- Facilities

The application answers questions such as:

> If a supplier is disrupted, which downstream products are affected, how many dependency hops are involved, and what revenue is potentially at risk?

The application uses **CognoDB Cloud**, **openCypher**, the **Bolt protocol**, and the official **`neo4j-driver`**.

---

## 2. Key Features

- Interactive supply-chain graph visualization
- Multi-hop dependency traversal
- Supplier disruption simulation
- Impacted product identification
- Dependency path and depth analysis
- Revenue-at-risk analysis
- Bottleneck / Single Point of Failure (SPOF) detection
- Interactive Cypher query inspection
- Live CognoDB backend verification
- Parameterized Cypher queries
- Automated backend verification
- Graceful mock fallback when the database is unavailable

---

## 3. Why a Graph Database?

Supply chains are naturally represented as connected dependency graphs:

```text
Supplier
   ↓ SUPPLIES
Component
   ↓ REQUIRES_COMPONENT
Sub-Component
   ↓ REQUIRES_COMPONENT / MADE_OF
Material / Component
   ↓
Product
```

Multi-hop dependency analysis can require complex joins or recursive queries in a relational database. A graph database allows these relationships to be expressed directly using variable-length graph traversal.

---

## 4. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Graph Visualization | vis-network |
| Backend | Node.js, Express |
| Database | CognoDB Cloud |
| Query Language | openCypher |
| Database Driver | official `neo4j-driver` |
| Protocol | Bolt |
| Deployment | Vercel |

---

## 5. Data Model

### Nodes

```text
:Product
:Component
:Material
:Supplier
:Facility
```

### Main Properties

**Product**

```text
id, name, sku, revenue, category, riskScore
```

**Component**

```text
id, name, code, leadTimeDays, unitCost
```

**Material**

```text
id, name, category, scarcityIndex
```

**Supplier**

```text
id, name, tier, country, reliabilityScore, status
```

**Facility**

```text
id, name, city, country, riskFactor
```

### Relationships

```text
(:Product)-[:REQUIRES_COMPONENT]->(:Component)

(:Component)-[:REQUIRES_COMPONENT]->(:Component)

(:Component)-[:MADE_OF]->(:Material)

(:Supplier)-[:SUPPLIES]->(:Component)

(:Supplier)-[:SUPPLIES]->(:Material)

(:Supplier)-[:LOCATED_AT]->(:Facility)
```

---

## 6. Multi-Hop Disruption Analysis

The application traces supplier impact across **1–5 hops**.

Example query pattern:

```cypher
MATCH (s:Supplier {id: $supplierId})
MATCH path =
  (s)-[:SUPPLIES|REQUIRES_COMPONENT|MADE_OF*1..5]->(p:Product)
WITH s, p, path, length(path) AS depth
RETURN
  s.id AS supplierId,
  s.name AS supplierName,
  p.id AS productId,
  p.name AS productName,
  p.sku AS productSku,
  p.revenue AS productRevenue,
  depth,
  [
    node IN nodes(path) |
    {
      id: node.id,
      name: coalesce(node.name, node.id),
      label: labels(node)[0]
    }
  ] AS pathNodes
ORDER BY p.revenue DESC, depth ASC
```

The supplier ID is passed as the parameter:

```text
$supplierId
```

---

## 7. Bottleneck / SPOF Analysis

SupplyGraph identifies suppliers that affect multiple downstream products.

The analysis calculates:

- Affected product count
- Revenue at risk
- Supplier tier
- Supplier country
- Reliability score
- Affected products

Example query:

```cypher
MATCH
  (p:Product)-[:REQUIRES_COMPONENT*1..5]->(c:Component)
  <-[:SUPPLIES]-(s:Supplier)

WITH
  s,
  count(DISTINCT p) AS affectedProductsCount,
  sum(DISTINCT p.revenue) AS totalRevenueAtRisk,
  collect(
    DISTINCT {
      id: p.id,
      name: p.name,
      revenue: p.revenue
    }
  ) AS products

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

## 8. Parameterized Cypher Security

All backend Cypher queries use parameters instead of string concatenation.

The application executes queries using:

```javascript
session.run(query, params)
```

Example:

```javascript
const params = {
  supplierId
};

await session.run(query, params);
```

### Verification

```text
Verifying Cypher Parameterization Security...
✅ PASS: 100% of Cypher queries use parameterized $variables
   Zero string concatenation.

🎉 VERIFICATION RESULT: 4 Passed, 0 Failed
```

---

## 9. CognoDB Configuration

The application connects to CognoDB Cloud using:

```env
COGNODB_URI=bolt+s://db-42473a80.databases.cognodb.com
COGNODB_USER=cognodb
COGNODB_PASSWORD=your-generated-password
PORT=3001
```

**Important:** The real database password must never be committed to this README or GitHub. Configure it through `.env` locally or Vercel Environment Variables in production.

---

## 10. Database Seeder

The project includes a seed dataset and database seeder.

Run:

```bash
npm run seed
```

The seeder creates the required graph nodes and relationships for the application.

---

## 11. Backend Verification

Run the automated verification suite:

```bash
npm run test:verify
```

Verified production state:

```text
Mode = LIVE_COGNODB
Connected = true

✅ neo4j-driver session execution verified!
```

Automated verification:

```text
🎉 VERIFICATION RESULT: 4 Passed, 0 Failed
```

---

## 12. Graceful Database Failure

The backend detects database connectivity problems and can fall back to mock topology data instead of crashing the application.

The application exposes the backend state:

```text
LIVE_COGNODB
```

or:

```text
MOCK_FALLBACK
```

This makes database availability visible to the user.

---

## 13. Project Structure

```text
supplychain-graph-app/
├── package.json
├── .env.example
├── README.md
├── .gitignore
│
├── server/
│   ├── index.js
│   ├── verify.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── graphController.js
│   ├── services/
│   │   └── cypherService.js
│   ├── routes/
│   │   └── api.js
│   └── seed/
│       ├── seedData.json
│       └── seed.js
│
└── client/
    ├── vite.config.js
    └── src/
        ├── App.jsx
        └── components/
            ├── Header.jsx
            ├── BackendVerificationModal.jsx
            ├── GraphView.jsx
            ├── DisruptionSimulator.jsx
            ├── BottleneckAnalysis.jsx
            └── QueryInspector.jsx
```

---

## 14. Local Setup

### Clone

```bash
git clone https://github.com/gangadharreddy-dev/supply-graph-cognodb.git
cd supply-graph-cognodb
```

### Install dependencies

```bash
npm install

cd client
npm install
cd ..
```

### Configure environment

```bash
cp .env.example .env
```

Add:

```env
COGNODB_URI=bolt+s://db-42473a80.databases.cognodb.com
COGNODB_USER=cognodb
COGNODB_PASSWORD=your-generated-password
PORT=3001
```

### Verify backend

```bash
npm run test:verify
```

### Seed database

```bash
npm run seed
```

### Start application

```bash
npm run dev
```

---

## 15. Evaluator Verification Matrix

| Requirement | Implementation |
|---|---|
| Official `neo4j-driver` | `server/config/db.js` |
| Parameterized Cypher | `server/services/cypherService.js` |
| Automated verification | `server/verify.js` |
| Database seeder | `server/seed/seed.js` |
| Multi-hop traversal | `server/controllers/graphController.js` |
| SPOF analysis | `server/controllers/graphController.js` |
| Environment secrets | `.env`, `.env.example`, `.gitignore` |
| Graceful database failure | `server/config/db.js` |
| Graph visualization | `GraphView.jsx` |
| Disruption simulation | `DisruptionSimulator.jsx` |
| Bottleneck analysis | `BottleneckAnalysis.jsx` |
| Cypher inspection | `QueryInspector.jsx` |
| Backend verification UI | `BackendVerificationModal.jsx` |

---

## 16. Verification Summary

```text
CognoDB Connection
        ✅ LIVE_COGNODB
        ✅ Connected = true

neo4j-driver
        ✅ Session execution verified

Cypher Security
        ✅ 100% parameterized
        ✅ Zero string concatenation

Automated Verification
        ✅ 4 Passed
        ❌ 0 Failed

Multi-Hop Traversal
        ✅ 1..5 hops

Database Seeder
        ✅ Available

Graceful Fallback
        ✅ Implemented
```

---

## 17. Demo Flow

Recommended evaluator flow:

```text
Open Live Demo
      ↓
Explore Graph
      ↓
Select Supplier
      ↓
Run Disruption Analysis
      ↓
View Multi-Hop Impact Paths
      ↓
Review Impacted Products
      ↓
Review Revenue Exposure
      ↓
Run Bottleneck / SPOF Analysis
      ↓
Inspect Cypher Query
      ↓
Open Backend Verification
      ↓
Confirm LIVE_COGNODB
```

---

## 18. Security

- Database credentials are stored in environment variables.
- `.env` is excluded from Git tracking.
- `.env.example` contains placeholders only.
- Cypher queries use parameterized `$variables`.
- No user-provided values are concatenated directly into Cypher queries.
- The real CognoDB password should never be stored in this README.

If a real database password is ever exposed publicly, rotate it immediately.

---

## 19. Links

**Live Demo:**  
https://supply-graph-cognodb-op7ryxair-gangadharreddy065-5671s-projects.vercel.app/

**GitHub Repository:**  
https://github.com/gangadharreddy-dev/supply-graph-cognodb

---

## Author

**Candidate Take-Home Submission**

**Assignment:** Wexa AI — CognoDB Graph Database Application

**Project:** SupplyGraph
