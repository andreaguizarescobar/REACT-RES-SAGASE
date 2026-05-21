import { Router } from "express";
import * as correspondenciaController from "../controllers/correspondencia.controller.js";
const router = Router();
// correspondencia/getAll
router.get('/', correspondenciaController.getCorrespondenciaList);
// correspondencia/getItem/:id
router.get('/:id', correspondenciaController.getCorrespondenciaItem);
// correspondencia/create
router.post('/create', correspondenciaController.postCorrespondenciaItem);
// correspondencia/update/:id
router.put('/update/:id', correspondenciaController.putCorrespondenciaItem);
// correspondencia/delete/:id
router.delete('/delete/:id', correspondenciaController.deleteCorrespondenciaItem);

export default router;