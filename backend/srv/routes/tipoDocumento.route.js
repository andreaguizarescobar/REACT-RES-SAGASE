import { Router } from "express";
import * as tipoDocumentoController from "../controllers/tipoDocumento.controller.js";

const router = Router();

// tipoDocumento/getAll
router.get('/', tipoDocumentoController.getTipoDocumentoList);
// tipoDocumento/getItem/:id
router.get('/:id', tipoDocumentoController.getTipoDocumentoItem);
// tipoDocumento/create
router.post('/', tipoDocumentoController.postTipoDocumentoItem);
// tipoDocumento/update/:id
router.put('/:id', tipoDocumentoController.putTipoDocumentoItem);
// tipoDocumento/delete/:id
router.delete('/:id', tipoDocumentoController.deleteTipoDocumentoItem);

export default router;