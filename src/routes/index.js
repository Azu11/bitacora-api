import { Router } from 'express';
import { userRouter } from './userRouter.js';
import { rolesRouter } from './RolesRouter.js';
import { bitacoraRouter } from './bitacoraRouter.js';
import { auhtRouter } from './authRouter.js';

const routes = Router();

routes.use('/user', userRouter);
routes.use('/auth', auhtRouter);
routes.use('/roles', rolesRouter);
routes.use('/bitacora', bitacoraRouter);

export default routes;