import {Router} from "express";
import * as contadorService from "../services/contador.service.js";

const router = Router();

router.get("/getAll", contadorService.getAll);
router.post("/create", contadorService.create);
router.put("/update/:id", contadorService.update);
router.delete("/delete/:id", contadorService.deleteContador);

export default router;