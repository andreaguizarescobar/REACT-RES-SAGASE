import {Router} from "express";
import * as contadorService from "../services/contador.service.js";
import { verifyToken } from "../middlewares/auth.middlewares.js";

const router = Router();

router.get("/getAll", contadorService.getAll);
router.post("/create", contadorService.create);
router.post("/generar-numero-salida", verifyToken, contadorService.generarNumeroSalidaCorrespondencia);
router.post("/generar-numero-oficio", verifyToken, contadorService.generarNumeroOficio);
router.put("/update/:id", contadorService.update);
router.delete("/delete/:id", contadorService.deleteContador);

export default router;