import { Router } from "express";
import * as correspondenciaController from "../controllers/correspondencia.controller.js";
const router = Router();
// correspondencia/getAll
router.get('/', correspondenciaController.getCorrespondenciaList);
// correspondencia/getItem/:id
router.get('/:id', correspondenciaController.getCorrespondenciaItem);
// correspondencia/create
router.post('/', correspondenciaController.postCorrespondenciaItem);
// correspondencia/update/:id
router.put('/:id', correspondenciaController.putCorrespondenciaItem);
// correspondencia/delete/:id
router.delete('/:id', correspondenciaController.deleteCorrespondenciaItem);

export default router;