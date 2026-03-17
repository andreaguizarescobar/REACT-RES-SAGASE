import { Router } from 'express';
import * as adicionalController from '../controllers/adicional.controller.js';
const router = Router();

// adicional/getAll
router.get('/getAll', adicionalController.getAllAdicionales);
// adicional/create
router.post('/create', adicionalController.createAdicional);
// adicional/update/:id
router.put('/update/:id', adicionalController.updateAdicional);
// adicional/delete/:id
router.delete('/delete/:id', adicionalController.deleteAdicional);

export default router;