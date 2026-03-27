import { Router } from "express";
import * as documentoController from "../controllers/documento.controller.js";
const router = Router();

// documento/getAll
router.get('/getAll', documentoController.getAll);
// documento/:docId
router.get('/:docId', documentoController.getById);
// documento/create
router.post('/create', documentoController.create);
// documento/update/:docId
router.put('/update/:docId', documentoController.putDocumento);
// patch documento/:docId/turnado
router.patch('/:docId/turnado', documentoController.patchTurnadoDocumento);
// patch documento/:docId/bitacora
router.patch('/:docId/bitacora', documentoController.patchBitacoraDocumento);
// patch documento/:docId/copia
router.patch('/:docId/copia', documentoController.patchCopiaDocumento);
// patch documento/:docId/anexo
router.patch('/:docId/anexo', documentoController.patchAnexoDocumento);
// patch documento/:docId/removerAnexo
router.patch('/:docId/removerAnexo', documentoController.patchRemoverAnexoDocumento);
// patch documento/:docId/status
router.patch('/:docId/status', documentoController.patchStatusDocumento);
// patch documento/:docId/relacionado
router.patch('/:docId/relacionado', documentoController.patchRelacionadoDocumento);
// patch documento/:docId/removerRelacionado
router.patch('/:docId/removerRelacionado', documentoController.patchRemoverRelacionadoDocumento);
// documento/delete/:docId
router.delete('/delete/:docId', documentoController.deleteDocumento);

export default router;