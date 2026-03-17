import { Router } from "express";
import * as oficioController from "../controllers/oficio.controller.js";
const router = Router();
// oficio/getAll
router.get('/', oficioController.getOficioList);
// oficio/getItem/:id
router.get('/:id', oficioController.getOficioItem);
// oficio/create
router.post('/', oficioController.postOficioItem);
// oficio/update/:id
router.put('/:id', oficioController.putOficioItem);
// patch oficio/:id/turnado
router.patch('/:id/turnado', oficioController.patchOficioTurnado);
// patch oficio/:id/copia
router.patch('/:id/copia', oficioController.patchOficioCopia);
// patch oficio/:id/bitacora
router.patch('/:id/bitacora', oficioController.patchOficioBitacora);
// patch oficio/:id/status
router.patch('/:id/status', oficioController.patchOficioStatus);
// patch oficio/:id/relacionados
router.patch('/:id/relacionados', oficioController.patchOficioRelacionados);
// oficio/delete/:id
router.delete('/:id', oficioController.deleteOficioItem);

export default router;