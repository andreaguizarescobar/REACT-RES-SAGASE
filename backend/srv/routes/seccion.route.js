import {Router} from 'express';

import * as seccionController from '../controllers/seccion.controller.js';

const router = Router();

// seccion/getAll
router.get('/getAll', seccionController.getAll);
// seccion/getItem/:seccionId
router.get('/:seccionId', seccionController.getById);
// seccion/create
router.post('/create', seccionController.createSeccion);
// seccion/update/:seccionId
router.put('/update/:seccionId', seccionController.updateSeccion);
// seccion/delete/:seccionId
router.delete('/delete/:seccionId', seccionController.deleteSeccion);
// seccion/addSerie/:seccionId
router.patch('/addSerie/:seccionId', seccionController.addSerieToSeccion);
// seccion/removeSerie/:seccionId
router.patch('/removeSerie/:seccionId', seccionController.removeSerieFromSeccion);
// seccion/addSubserie/:seccionId/:serieId
router.patch('/addSubserie/:seccionId/:serieId', seccionController.addSubserieToSerie);
// seccion/removeSubserie/:seccionId/:serieId
router.patch('/removeSubserie/:seccionId/:serieId', seccionController.removeSubserieFromSerie);

export default router;