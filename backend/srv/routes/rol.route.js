import { Router } from "express";
import * as rolController from "../controllers/rol.controller.js";
const router = Router();
// rol/getAll
router.get('/getAll', rolController.getAll);
// rol/getItem/:roleId
router.get('/:roleId', rolController.getById);
// rol/create
router.post('/create', rolController.createRol);
// rol/update/:roleId
router.put('/update/:roleId', rolController.updateRol);
// rol/delete/:roleId
router.delete('/delete/:roleId', rolController.deleteRol);
// rol/addProcess/:roleId
router.patch('/addProcess/:roleId', rolController.addProcessToRol);
// rol/removeProcess/:roleId
router.patch('/removeProcess/:roleId', rolController.removeProcessFromRol);

export default router;