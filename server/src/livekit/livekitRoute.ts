import { Router } from 'express';
import { createConnection } from './livekitController';


const livekitRouter = Router();

livekitRouter.get('/connection-details',createConnection );


export default livekitRouter;
