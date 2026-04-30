import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as controller from "./guest.controller.js";

const router = Router();

router.post("/", requireAuth(), controller.createGuests);
router.get("/", requireAuth(), controller.getAllGuests);
router.post("/:guestId/events/assign", requireAuth(), controller.assignGuestToEvents);
router.post("/:guestId/call-done", requireAuth(), controller.markGuestCallDone);
router.patch("/:guestId", requireAuth(), controller.updateGuest);
router.delete("/:guestId", requireAuth(), controller.deleteGuest);

export default router;
