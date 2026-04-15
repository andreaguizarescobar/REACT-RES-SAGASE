import { Router } from "express";
import * as procesoController from "../controllers/proceso.controller.js";
const router = Router();
// proceso/getAll
router.get('/getAll', procesoController.getProcesoList);
// proceso/getItem/:id
router.get('/:id', procesoController.getProcesoItem);
// proceso/create
router.post('/create/', procesoController.postProcesoItem);
// proceso/update/:id
router.put('/update/:id', procesoController.putProcesoItem);
// proceso/delete/:id
router.delete('/delete/:id', procesoController.deleteProcesoItem);

export default router;