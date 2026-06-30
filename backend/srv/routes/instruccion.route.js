import { Router } from "express";
import * as instruccionController from '../controllers/instruccion.controller.js';

const router = Router();

router.get('/getAll', instruccionController.getAllInstrucciones);
router.post('/create', instruccionController.createInstruccion);
router.put('/update/:id', instruccionController.updateInstruccion);
router.delete('/delete/:id', instruccionController.deleteInstruccion);

export default router;
