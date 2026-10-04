import { Router } from 'express';
import { receiveTelemetry, getTrafficMap, getBalancedNodes } from '../../controllers/iot.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requireTenant } from '../../middlewares/tenant.middleware.js';

const router = Router();

// Ingestion massive IoT via le bus Kafka (202 Accepted — sans bloquer le capteur)
router.post('/telemetry', authenticateToken, requireTenant, receiveTelemetry);

// Carte du réseau Edge mondial (lecture publique du statut des PoPs)
router.get('/network-map', getTrafficMap);

// Liste des nœuds triés par charge (pour le dashboard de load balancing)
router.get('/nodes/balanced', getBalancedNodes);

export default router;
