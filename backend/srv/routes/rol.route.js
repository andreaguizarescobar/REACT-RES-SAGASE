import { Router } from "express";
import * as rolController from "../controllers/rol.controller.js";
const router = Router();
// rol/getAll
router.get('/', rolController.getRolList);
// rol/getItem/:id
router.get('/:id', rolController.getRolItem);
// rol/create
router.post('/', rolController.postRolItem);
// rol/update/:id
router.put('/:id', rolController.putRolItem);
// rol/delete/:id
router.delete('/:id', rolController.deleteRolItem);

export default router;