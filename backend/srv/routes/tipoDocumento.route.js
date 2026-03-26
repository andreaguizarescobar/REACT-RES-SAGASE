import { Router } from "express";
import * as tipoDocumentoController from "../controllers/tipoDocumento.controller.js";

const router = Router();

// tipoDocumento/getAll
router.get('/getAll', tipoDocumentoController.getAll);
// tipoDocumento/:tipo
router.get('/:tipo', tipoDocumentoController.getTipoDocumento);
// tipoDocumento/create
router.post('/create', tipoDocumentoController.postTipoDocumento);
// tipoDocumento/update/:tipo
router.put('/update/:tipo', tipoDocumentoController.putTipoDocumento);
// tipoDocumento/delete/:tipo
router.delete('/delete/:tipo', tipoDocumentoController.deleteTipoDocumento);

export default router;