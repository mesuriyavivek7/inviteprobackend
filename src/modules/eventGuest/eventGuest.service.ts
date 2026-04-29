import mongoose from "mongoose";
import Event from "../event/event.model.js";
import EventGuest, { GUEST_TAGS, type GuestTag } from "./eventGuest.model.js";
import Guest from "../guest/guest.model.js";
import type { AssignGuestItemInput, AssignGuestsInput } from "./eventGuest.types.js";

const assertObjectId = (id: string, message: string): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(message);
  }
};

const normalizeGuestTag = (tag: AssignGuestItemInput["guestTag"]): GuestTag => {
  const normalized = tag.trim().toLowerCase().replace(/\s+/g, "_");
  if ((GUEST_TAGS as readonly string[]).includes(normalized)) {
    return normalized as GuestTag;
  }
  throw new Error("guestTag must be one of: single, 2 person, family");
};

const normalizeAssignments = (payload: AssignGuestsInput): Array<{ guestId: string; guestTag: GuestTag }> => {
  const items = "guests" in payload ? payload.guests : [payload];
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("guests must be a non-empty array");
  }

  return items.map((item) => {
    assertObjectId(item.guestId, "Invalid guest id");
    return {
      guestId: item.guestId,
      guestTag: normalizeGuestTag(item.guestTag),
    };
  });
};

export const assignGuestsToEvent = async (eventId: string, payload: AssignGuestsInput) => {
  assertObjectId(eventId, "Invalid event id");
  const assignments = normalizeAssignments(payload);

  const event = await Event.findOne({ _id: eventId, isDeleted: false });
  if (!event) throw new Error("Event not found");

  const guestIds = assignments.map((item) => item.guestId);
  const guests = await Guest.find({ _id: { $in: guestIds }, isDeleted: false }).select("_id");
  if (guests.length !== new Set(guestIds).size) {
    throw new Error("One or more guests not found");
  }

  const bulkOps = assignments.map((item) => ({
    updateOne: {
      filter: { eventId, guestId: item.guestId },
      update: {
        $set: {
          guestTag: item.guestTag,
        },
      },
      upsert: true,
    },
  }));

  await EventGuest.bulkWrite(bulkOps);

  return EventGuest.find({ eventId })
    .populate("guestId", "name mobileNo")
    .populate("eventId", "eventName");
};

export const getGuestsByEvent = async (eventId: string) => {
  assertObjectId(eventId, "Invalid event id");

  const event = await Event.findOne({ _id: eventId, isDeleted: false });
  if (!event) throw new Error("Event not found");

  return EventGuest.find({ eventId })
    .sort({ createdAt: -1 })
    .populate("guestId", "name mobileNo")
    .populate("eventId", "eventName");
};
