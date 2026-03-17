import { Router } from "express";
import * as remitenteController from "../controllers/remitente.controller.js";
const router = Router();
// remitente/getAll
router.get('/', remitenteController.getRemitenteList);
// remitente/getItem/:id
router.get('/:id', remitenteController.getRemitenteItem);
// remitente/create
router.post('/', remitenteController.postRemitenteItem);
// remitente/update/:id
router.put('/:id', remitenteController.putRemitenteItem);
// remitente/delete/:id
router.delete('/:id', remitenteController.deleteRemitenteItem);

export default router;