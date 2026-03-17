import { Router } from "express";
import * as fondoController from "../controllers/fondo.controller.js";
const router = Router();
// fondo/getAll
router.get('/', fondoController.getFondoList);
// fondo/getItem/:id
router.get('/:id', fondoController.getFondoItem);
// fondo/create
router.post('/', fondoController.postFondoItem);
// fondo/update/:id
router.put('/:id', fondoController.putFondoItem);
// fondo/delete/:id
router.delete('/:id', fondoController.deleteFondoItem);

export default router;