import { Router } from "express";
import userController from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";
import authorizeRole from "../middlewares/role.middleware.js";
const router = Router();
// user/getAll
router.get('/getAll', verifyToken, authorizeRole('ADMIN'), userController.getAllUsers);
// user/getUser/:id
router.get('/getUser/:userId', verifyToken, userController.getUser);
// user/getItem/:id
router.post('/login', userController.login);
// user/create
router.post('/register',verifyToken, authorizeRole('ADMIN'), userController.register);
// user/forgot-password
router.post('/forgot-password', userController.forgot);
// user/reset-password
router.post('/reset-password', userController.reset);
// user/update/:id
router.patch('/:userId', verifyToken, userController.patchUser);
// user/delete/:id
router.delete('/:userId', verifyToken, authorizeRole('ADMIN'), userController.deleteUser);

export default router;