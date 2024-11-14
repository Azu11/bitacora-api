import { Router } from 'express';
import { createUser, createUserWithSocialProfile, getUsers, getUserById, updateUser, addRolesToUser, deleteUser } from '../controllers/userController.js';

const userRouter = Router();

userRouter.post('/create', createUser);
userRouter.post('/create/:provider', createUserWithSocialProfile);
userRouter.get('/', getUsers);
userRouter.get('/:id', getUserById);
userRouter.put('/:id', updateUser);
userRouter.put('/:id/roles', addRolesToUser);
userRouter.delete('/:id', deleteUser);

export { userRouter };