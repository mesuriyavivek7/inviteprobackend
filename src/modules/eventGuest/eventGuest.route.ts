import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as controller from "./eventGuest.controller.js";

const router = Router();

router.post("/:eventId/guests/assign", requireAuth(), controller.assignGuestsToEvent);
router.get("/:eventId/guests", requireAuth(), controller.getGuestsByEvent);

export default router;
