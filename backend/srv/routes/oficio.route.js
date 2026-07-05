import { Router } from "express";
import * as oficioController from "../controllers/oficio.controller.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const router = Router();

router.get('/', verifyToken, oficioController.getOficioList);
router.get('/:id', verifyToken, oficioController.getOficioItem);
router.post('/', verifyToken, oficioController.postOficioItem);
router.put('/:id', verifyToken, oficioController.putOficioItem);
router.patch('/:id/turnado', verifyToken, oficioController.patchOficioTurnado);
router.patch('/:id/copia', verifyToken, oficioController.patchOficioCopia);
router.patch('/:id/bitacora', verifyToken, oficioController.patchOficioBitacora);
router.patch('/:id/status', verifyToken, oficioController.patchOficioStatus);
router.patch('/:id/relacionados', verifyToken, oficioController.patchOficioRelacionados);
router.delete('/:id', verifyToken, oficioController.deleteOficioItem);

export default router;