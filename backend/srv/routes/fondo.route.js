import { Router } from "express";
import * as fondoController from "../controllers/fondo.controller.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";
import authorizeRole from "../middlewares/role.middleware.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, `${process.env.ARCHIVOS_PATH}/fondo`);
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
  }),
});

// fondo/getAll
router.get('/', verifyToken, fondoController.getFondoList);
// fondo/getItem/:id
router.get('/:id', verifyToken, fondoController.getFondoById);
// fondo/create
router.post('/', verifyToken, upload.fields([{ name: 'encabezado', maxCount: 1 },
{ name: 'pie', maxCount: 1 },
{ name: 'fondo', maxCount: 1 }
]), fondoController.postFondoItem);
// fondo/update/:id
router.put('/:id', verifyToken, authorizeRole('ADMIN'), upload.fields([{ name: 'encabezado', maxCount: 1 },
{ name: 'pie', maxCount: 1 },
{ name: 'fondo', maxCount: 1 }
]), fondoController.putFondoItem);
// fondo/delete/:id
router.delete('/:id', verifyToken, authorizeRole('ADMIN'), fondoController.deleteFondoItem);

export default router;