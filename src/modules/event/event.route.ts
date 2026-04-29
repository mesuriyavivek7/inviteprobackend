import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as controller from "./event.controller.js";

const router = Router();

router.post("/", requireAuth(), controller.createEvent);
router.get("/", requireAuth(), controller.getAllEvents);
router.patch("/:eventId", requireAuth(), controller.updateEvent);
router.delete("/:eventId", requireAuth(), controller.deleteEvent);

export default router;
