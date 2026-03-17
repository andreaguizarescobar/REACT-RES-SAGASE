import { Router } from "express";
import * as catalogoController from '../controllers/catalogo.controller.js';
const router = Router();

// catalogo/getAll
router.get('/getAll', catalogoController.getAllCatalogos);
// catalogo/create
router.post('/create', catalogoController.createCatalogo);
// catalogo/update/:id
router.put('/update/:id', catalogoController.updateCatalogo);
// catalogo/delete/:id
router.delete('/delete/:id', catalogoController.deleteCatalogo);

export default router;