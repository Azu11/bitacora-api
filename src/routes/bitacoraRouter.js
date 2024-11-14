import { Router } from 'express';
import { getBitacorasList, getBitacoraById, createBitacora, updateBitacora, deleteBitacora } from '../controllers/bitacoraController.js';

const bitacoraRouter = Router();

bitacoraRouter.get('/', getBitacorasList);
bitacoraRouter.get('/:id', getBitacoraById);
bitacoraRouter.post('/', createBitacora);
bitacoraRouter.put('/:id', updateBitacora);
bitacoraRouter.delete('/:id', deleteBitacora);

export { bitacoraRouter };