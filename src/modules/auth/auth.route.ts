import { Router } from "express";
import * as controller from "./auth.controller.js";

const router = Router();

router.post("/signup/user", controller.signupUser);
router.post("/signup/admin", controller.signupAdmin);
router.post("/login", controller.login);

export default router;
