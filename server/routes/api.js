import { Router } from 'express';
import { 
  getHealthStatus, 
  getGraphTopology, 
  simulateDisruption, 
  getBottleneckAnalysis, 
  getAlternativeSuppliers, 
  getCypherCatalog 
} from '../controllers/graphController.js';
import { seedDatabase } from '../seed/seed.js';

const router = Router();

router.get('/health', getHealthStatus);
router.get('/graph', getGraphTopology);
router.get('/simulate-disruption', simulateDisruption);
router.get('/bottlenecks', getBottleneckAnalysis);
router.get('/alternative-suppliers', getAlternativeSuppliers);
router.get('/cypher-catalog', getCypherCatalog);

router.post('/seed', async (req, res) => {
  const result = await seedDatabase();
  res.json(result);
});

export default router;
