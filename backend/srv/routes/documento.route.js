import { Router } from "express";
import * as documentoController from "../controllers/documento.controller.js";
const router = Router();

// documento/getAll
router.get('/', documentoController.getDocumentoList);
// documento/getItem/:id
router.get('/:id', documentoController.getDocumentoItem);
// documento/create
router.post('/', documentoController.postDocumentoItem);
// documento/update/:id
router.put('/:id', documentoController.putDocumentoItem);
// patch documento/:id/turnado
router.patch('/:id/turnado', documentoController.patchTurnadoDocumentoItem);
// patch documento/:id/bitacora
router.patch('/:id/bitacora', documentoController.patchBitacoraDocumentoItem);
// patch documento/:id/copia
router.patch('/:id/copia', documentoController.patchCopiaDocumentoItem);
// patch documento/:id/anexo
router.patch('/:id/anexo', documentoController.patchAnexoDocumentoItem);
// patch documento/:id/status
router.patch('/:id/status', documentoController.patchStatusDocumentoItem);
// patch documento/:id/relacionado
router.patch('/:id/relacionado', documentoController.patchRelacionadoDocumentoItem);
// documento/delete/:id
router.delete('/:id', documentoController.deleteDocumentoItem);

export default router;