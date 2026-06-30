import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/admin", dashboardController.getDashboard);

export default router;