import { Router } from "express";
import * as temaPrincipalController from "../controllers/temaPrincipal.controller.js";
const router = Router();
// temaPrincipal/getAll
router.get('/', temaPrincipalController.getTemaPrincipalList);
// temaPrincipal/getItem/:id
router.get('/:id', temaPrincipalController.getTemaPrincipalItem);
// temaPrincipal/create
router.post('/', temaPrincipalController.postTemaPrincipalItem);
// temaPrincipal/update/:id
router.put('/:id', temaPrincipalController.putTemaPrincipalItem);
// temaPrincipal/delete/:id
router.delete('/:id', temaPrincipalController.deleteTemaPrincipalItem);

export default router;