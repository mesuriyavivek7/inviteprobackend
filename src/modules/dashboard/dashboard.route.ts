import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as controller from "./dashboard.controller.js";

const router = Router();

router.get("/", requireAuth(), controller.getDashboardData);

export default router;
