import { Router } from "express";
import * as remitenteController from "../controllers/remitente.controller.js";
const router = Router();
// remitente/getAll
router.get('/getAll', remitenteController.getAll);
// remitente/getItem/:remId
router.get('/:remId', remitenteController.getRemitente);
// remitente/create
router.post('/create', remitenteController.postRemitente);
// remitente/update/:remId
router.put('/update/:remId', remitenteController.putRemitente);
// remitente/delete/:remId
router.delete('/delete/:remId', remitenteController.deleteRemitente);

export default router;