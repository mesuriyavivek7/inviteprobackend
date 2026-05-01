import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as controller from "./user.controller.js";

const router = Router();

router.get("/me", requireAuth(["user"]), controller.getMyProfile);
router.patch("/me", requireAuth(["user"]), controller.updateMyProfile);
router.patch("/me/change-password", requireAuth(["user"]), controller.changeMyPassword);

export default router;
