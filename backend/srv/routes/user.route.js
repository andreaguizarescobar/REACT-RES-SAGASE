import { Router } from "express";
import userController from "../controllers/user.controller.js";
const router = Router();
// user/getAll
//router.get('/', userController.register);
// user/getItem/:id
router.post('/login', userController.login);
// user/create
router.post('/register', userController.register);
// user/forgot-password
router.post('/forgot-password', userController.forgot);
// user/reset-password
router.post('/reset-password', userController.reset);
// user/update/:id
//router.put('/:id', userController.putUserItem);
// user/delete/:id
//router.delete('/:id', userController.deleteUserItem);

export default router;