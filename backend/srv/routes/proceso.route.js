import { Router } from "express";
import * as procesoController from "../controllers/proceso.controller.js";
const router = Router();
// proceso/getAll
router.get('/', procesoController.getProcesoList);
// proceso/getItem/:id
router.get('/:id', procesoController.getProcesoItem);
// proceso/create
router.post('/', procesoController.postProcesoItem);
// proceso/update/:id
router.put('/:id', procesoController.putProcesoItem);
// proceso/delete/:id
router.delete('/:id', procesoController.deleteProcesoItem);

export default router;