import { Router } from "express";
import * as instruccionController from '../controllers/instruccion.controller.js';

const router = Router();

router.get('/getAll', instruccionController.getAllInstrucciones);
router.post('/create', instruccionController.createInstruccion);

export default router;
