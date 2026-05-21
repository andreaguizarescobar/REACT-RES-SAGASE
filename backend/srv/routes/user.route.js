import { Router } from "express";
import userController from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";
import authorizeRole from "../middlewares/role.middleware.js";
const router = Router();
// user/getAll
router.get('/getAll', verifyToken, userController.getAllUsers);
// user/getUser/:userId
router.get('/getUser/:userId', verifyToken, userController.getUser);
// user/login
router.post('/login', userController.login);
// user/register
router.post('/register',verifyToken, authorizeRole('ADMIN'), userController.register);
// user/verificar-token
router.post('/verificar-token', verifyToken, userController.verifyToken);
// user/forgot-password
router.post('/forgot-password', userController.forgot);
// user/reset-password
router.post('/reset-password', userController.reset);
// user/update/:userId
router.patch('/update/:userId', verifyToken, authorizeRole('ADMIN'), userController.patchUser);
// user/delete/:userId
router.delete('/delete/:userId', verifyToken, authorizeRole('ADMIN'), userController.deleteUser);
// user/cambiar-password/:userId
router.post('/cambiar-password/:userId', userController.cambiarPassword);
// user/tareas/:userId
router.get('/tareas/:userId', verifyToken, userController.getTareas);
// user/move-tarea/:tareaId
router.post('/move-tarea/:tareaId', verifyToken, userController.moveTarea);
// user/concluir-tarea/:tareaId
router.post('/concluir-tarea/:tareaId', verifyToken, userController.concluirTarea);

export default router;