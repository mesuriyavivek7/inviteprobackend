import mongoose from "mongoose";
import Event from "../event/event.model.js";
import EventGuest, { type GuestTag } from "./eventGuest.model.js";
import { normalizeGuestTagInput } from "./guestTag.util.js";
import Guest from "../guest/guest.model.js";
import type {
  AssignGuestItemInput,
  AssignGuestsInput,
  UpdateEventGuestStatusInput,
} from "./eventGuest.types.js";

const assertObjectId = (id: string, message: string): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(message);
  }
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
      guestTag: normalizeGuestTagInput(item.guestTag),
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

  const eventGuests = await EventGuest.find({ eventId })
    .sort({ createdAt: -1 })
    .populate("guestId", "name mobileNo")
    .populate("eventId", "eventName")
    .lean();

  return eventGuests.map((item) => ({
    _id: item._id,
    event: item.eventId,
    guestTag: item.guestTag,
    guest: {
      ...(typeof item.guestId === "object" && item.guestId !== null ? item.guestId : {}),
      isCalled: item.isCalled ?? false,
      isWatsapp: item.isWatsapp ?? false,
    },
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
};

export const updateEventGuestStatus = async (
  eventId: string,
  guestId: string,
  payload: UpdateEventGuestStatusInput
) => {
  assertObjectId(eventId, "Invalid event id");
  assertObjectId(guestId, "Invalid guest id");

  const updates: UpdateEventGuestStatusInput = {};
  if (payload.isCalled !== undefined) {
    updates.isCalled = payload.isCalled;
  }
  if (payload.isWatsapp !== undefined) {
    updates.isWatsapp = payload.isWatsapp;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("At least one status field is required");
  }

  const mapping = await EventGuest.findOneAndUpdate(
    { eventId, guestId },
    { $set: updates },
    { new: true }
  )
    .populate("guestId", "name mobileNo")
    .populate("eventId", "eventName");

  if (!mapping) {
    throw new Error("Event guest mapping not found");
  }

  return mapping;
};
