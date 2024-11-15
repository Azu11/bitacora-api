import { Router } from 'express';
import { userRouter } from './userRouter.js';
import { rolesRouter } from './RolesRouter.js';
import { bitacoraRouter } from './bitacoraRouter.js';

const routes = Router();

routes.use('/user', userRouter);
routes.use('/roles', rolesRouter);
routes.use('/bitacora', bitacoraRouter);

export default routes;