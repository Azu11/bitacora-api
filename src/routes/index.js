import { Router } from 'express';
import { userRouter } from './userRouter.js';
import { rolesRouter } from './RolesRouter.js';

const routes = Router();

routes.use('/user', userRouter);
routes.use('/roles', rolesRouter);

export default routes;