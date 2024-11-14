import { Router } from 'express';
import { getRolesList, getRoleById, updateRole, deleteRole } from '../controllers/rolesController.js';

const rolesRouter = Router();

rolesRouter.get('/', getRolesList);
rolesRouter.get('/:id', getRoleById);
rolesRouter.put('/:id', updateRole);
rolesRouter.delete('/:id', deleteRole);

export { rolesRouter };