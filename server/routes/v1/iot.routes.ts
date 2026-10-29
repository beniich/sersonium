import { Router } from 'express';
import { 
  receiveTelemetry, 
  getTrafficMap, 
  getBalancedNodes, 
  getTelemetrySnapshot, 
  getNodesList, 
  getTelemetryHistory 
} from '../../controllers/iot.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requireTenant } from '../../middlewares/tenant.middleware.js';

const router = Router();

// Ingestion massive IoT via le bus Kafka (202 Accepted — sans bloquer le capteur)
router.post('/telemetry', authenticateToken, requireTenant, receiveTelemetry);

// Télémétrie instantanée unifiée (aligné strictement sous /api/v1/iot/snapshot)
router.get('/snapshot', getTelemetrySnapshot);

// Carte du réseau Edge mondial (lecture publique du statut des PoPs)
router.get('/network-map', getTrafficMap);

// Liste des nœuds triés par charge
router.get('/nodes/balanced', getBalancedNodes);

// Liste paginée complète des nœuds Edge (Axe 1 - Couverture fonctionnelle)
router.get('/nodes', getNodesList);

// Historique télémétrique séries temporelles (Axe 1 - Couverture fonctionnelle)
router.get('/history', getTelemetryHistory);

export default router;
