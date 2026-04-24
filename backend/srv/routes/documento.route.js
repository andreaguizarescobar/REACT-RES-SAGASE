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
const uploadDir = path.join(__dirname, '../uploads/anexos');
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
router.get('/:docId', documentoController.getById);
// documento/create
router.post('/create', verifyToken, documentoController.create);
// documento/update/:docId
router.put('/update/:docId',verifyToken, documentoController.putDocumento);
// patch documento/:docId/turnado
router.patch('/:docId/turnado', verifyToken, documentoController.patchTurnadoDocumento);
// patch documento/:docId/bitacora
router.patch('/:docId/bitacora', verifyToken, documentoController.patchBitacoraDocumento);
// patch documento/:docId/copia
router.patch('/:docId/copia', verifyToken, documentoController.patchCopiaDocumento);
// patch documento/:docId/anexo
router.patch('/:docId/anexo', verifyToken, documentoController.patchAnexoDocumento);
// patch documento/:docId/anexo-file
router.post('/:docId/anexo-file', verifyToken, upload.single('archivo'), documentoController.uploadAnexoDocumento);
// patch documento/:docId/removerAnexo
router.patch('/:docId/removerAnexo', verifyToken, documentoController.patchRemoverAnexoDocumento);
// patch documento/:docId/status
router.patch('/:docId/status', verifyToken, documentoController.patchStatusDocumento);
// patch documento/:docId/relacionado
router.patch('/:docId/relacionado', verifyToken, documentoController.patchRelacionadoDocumento);
// patch documento/:docId/removerRelacionado
router.patch('/:docId/removerRelacionado', verifyToken, documentoController.patchRemoverRelacionadoDocumento);
// documento/delete/:docId
router.delete('/delete/:docId', verifyToken, documentoController.deleteDocumento);

export default router;