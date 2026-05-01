import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as controller from "./faq.controller.js";

const router = Router();

router.get("/", requireAuth(), controller.getAllFaqs);
router.get("/:faqId", requireAuth(), controller.getFaqById);
router.post("/", requireAuth(["admin"]), controller.createFaq);
router.patch("/:faqId", requireAuth(["admin"]), controller.updateFaq);
router.delete("/:faqId", requireAuth(["admin"]), controller.deleteFaq);

export default router;
