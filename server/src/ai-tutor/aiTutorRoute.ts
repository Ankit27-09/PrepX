import { Router } from 'express';
import { getAITutorConnectionDetails } from './aiTutorController';

const aiTutorRouter = Router();

// No authentication required - public endpoint
aiTutorRouter.get('/connection-details', getAITutorConnectionDetails);

export default aiTutorRouter;
