import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as controller from "./guest.controller.js";

const router = Router();

router.post("/", requireAuth(), controller.createGuests);
router.get("/", requireAuth(), controller.getAllGuests);
router.get("/:guestId/events", requireAuth(), controller.getGuestEvents);
router.post("/:guestId/events/assign", requireAuth(), controller.assignGuestToEvents);
router.put("/:guestId/events/mappings", requireAuth(), controller.upsertGuestEventMappings);
router.patch("/:guestId", requireAuth(), controller.updateGuest);
router.delete("/:guestId", requireAuth(), controller.deleteGuest);

export default router;
