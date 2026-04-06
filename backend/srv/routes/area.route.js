import { Router } from "express";
import * as areaController from '../controllers/area.controller.js';
const router = Router();

// area/getAll
router.get('/getAll', areaController.getAll);
// area/create
router.post('/create', areaController.createArea);
// area/update/:id
router.put('/update/:id', areaController.updateArea);
// area/delete/:id
router.delete('/delete/:id', areaController.deleteArea);

export default router;