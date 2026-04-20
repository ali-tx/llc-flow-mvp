import { Router } from 'express';
import { 
  startFormation, 
  handleMessage, 
  generateDocument 
} from '../controllers/formationController';

const router = Router();

router.post('/start', startFormation);
router.post('/:sessionId/message', handleMessage);
router.post('/:sessionId/generate', generateDocument);

export default router;
