import { Router } from "express";
import * as controller from "./auth.controller.js";

const router = Router();

router.post("/signup/user", controller.signupUser);
router.post("/signup/admin", controller.signupAdmin);
router.post("/login", controller.login);
router.post("/forgot-password/request-otp", controller.requestForgotPasswordOtp);
router.post("/forgot-password/verify-otp", controller.verifyForgotPasswordOtp);
router.post("/forgot-password/reset", controller.resetForgottenPassword);

export default router;
