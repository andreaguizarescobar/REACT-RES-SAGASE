import { Router } from "express";
import * as temaPrincipalController from "../controllers/temaPrincipal.controller.js";
const router = Router();
// temaPrincipal/getAll
router.get('/getAll', temaPrincipalController.getAll);
// temaPrincipal/getItem/:id
router.get('/:id', temaPrincipalController.getTemaPrincipal);
// temaPrincipal/create
router.post('/create', temaPrincipalController.postTemaPrincipal);
// temaPrincipal/update/:id
router.put('/update/:id', temaPrincipalController.putTemaPrincipal);
// temaPrincipal/delete/:id
router.delete('/delete/:id', temaPrincipalController.deleteTemaPrincipal);

export default router;