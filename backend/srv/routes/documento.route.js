import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middlewares.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import * as documentoController from "../controllers/documento.controller.js";
const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, `${process.env.ARCHIVOS_PATH}/anexos`);
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
  }),
});

// documento/getAll
router.get('/getAll', documentoController.getAll);
// documento/:docId
router.post('/', documentoController.getById);
// documento/create
router.post('/create', verifyToken, upload.single('archivo'), documentoController.create);
// documento/update/:docId
router.put('/update',verifyToken, documentoController.putDocumento);
// patch documento/:docId/turnado
router.patch('/turnado', verifyToken, documentoController.patchTurnadoDocumento);
// patch documento/:docId/bitacora
router.patch('/bitacora', verifyToken, documentoController.patchBitacoraDocumento);
// patch documento/:docId/copia
router.patch('/copia', verifyToken, documentoController.patchCopiaDocumento);
// patch documento/:docId/anexo
router.patch('/anexo', verifyToken, documentoController.patchAnexoDocumento);
// patch documento/:docId/anexo-file
router.post('/anexo-file', verifyToken, upload.single('archivo'), documentoController.uploadAnexoDocumento);
// patch documento/:docId/removerAnexo
router.patch('/removerAnexo', verifyToken, documentoController.patchRemoverAnexoDocumento);
// patch documento/:docId/agregarAdicional
router.patch('/agregarAdicional', verifyToken, documentoController.patchAgregarAdicionalDocumento);
// patch documento/:docId/eliminarAdicional
router.patch('/eliminarAdicional', verifyToken, documentoController.patchEliminarAdicionalDocumento);
// patch documento/:docId/status
router.patch('/status', verifyToken, documentoController.patchStatusDocumento);
// patch documento/:docId/relacionado
router.patch('/relacionado', verifyToken, documentoController.patchRelacionadoDocumento);
// patch documento/:docId/removerRelacionado
router.patch('/removerRelacionado', verifyToken, documentoController.patchRemoverRelacionadoDocumento);
// documento/delete/:docId
router.delete('/delete', verifyToken, documentoController.deleteDocumento);
// documento/reporte/acuerdos
router.post('/reporte/acuerdos', verifyToken, documentoController.reporteAcuerdos);
// documento/reporte/asuntos
router.post('/reporte/asuntos', verifyToken, documentoController.reporteAsuntos);
// documento/respuesta
router.post('/respuesta', verifyToken, upload.single('archivo'), documentoController.patchRespuestaDocumento);
// documento/search
router.post('/search', documentoController.searchDocumentos);

export default router;