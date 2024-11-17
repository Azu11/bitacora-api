import { Router } from 'express';
import { login } from '../controllers/auhtController.js';

const auhtRouter = Router();

auhtRouter.post('/login', login);

export { auhtRouter };