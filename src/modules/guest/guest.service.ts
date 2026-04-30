import mongoose from "mongoose";
import Guest from "./guest.model.js";
import Event from "../event/event.model.js";
import EventGuest from "../eventGuest/eventGuest.model.js";
import type {
  AssignGuestToEventsInput,
  CreateGuestInput,
  GuestInput,
  UpdateGuestInput,
} from "./guest.types.js";

const assertObjectId = (id: string, message: string): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(message);
  }
};

const normalizeName = (name?: string): string => {
  const value = name?.trim();
  if (!value) throw new Error("name is required");
  return value;
};

const normalizeMobileNo = (mobileNo?: string): string => {
  const value = mobileNo?.trim();
  if (!value) throw new Error("mobileNo is required");
  return value;
};

const normalizeGuestsPayload = (payload: CreateGuestInput): GuestInput[] => {
  if ("guests" in payload) {
    if (!Array.isArray(payload.guests) || payload.guests.length === 0) {
      throw new Error("guests must be a non-empty array");
    }
    return payload.guests;
  }

  return [payload];
};

const normalizeGuestTag = (tag: string): "single" | "2_person" | "family" => {
  const normalized = tag.trim().toLowerCase().replace(/\s+/g, "_");

  if (normalized === "single") return "single";
  if (normalized === "two" || normalized === "2_person") return "2_person";
  if (normalized === "family") return "family";

  throw new Error("guestTag must be one of: Single, Two, Family");
};

const normalizeEventAssignments = (
  payload: AssignGuestToEventsInput
): Array<{ eventId: string; guestTag: "single" | "2_person" | "family" }> => {
  const items = "events" in payload ? payload.events : [payload];

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("events must be a non-empty array");
  }

  return items.map((item) => {
    assertObjectId(item.eventId, "Invalid event id");

    return {
      eventId: item.eventId,
      guestTag: normalizeGuestTag(item.guestTag),
    };
  });
};

export const createGuests = async (payload: CreateGuestInput) => {
  const guests = normalizeGuestsPayload(payload).map((guest) => ({
    name: normalizeName(guest.name),
    mobileNo: normalizeMobileNo(guest.mobileNo),
  }));

  const mobileNos = guests.map((guest) => guest.mobileNo);
  const existing = await Guest.find({ mobileNo: { $in: mobileNos } }).select("mobileNo");
  if (existing.length > 0) {
    const existingNumbers = existing.map((guest) => guest.mobileNo).join(", ");
    throw new Error(`Guest already exists with mobileNo: ${existingNumbers}`);
  }

  if (guests.length === 1) {
    const firstGuest = guests[0];
    if (!firstGuest) {
      throw new Error("At least one guest is required");
    }
    return Guest.create(firstGuest);
  }

  return Guest.insertMany(guests);
};

export const getAllGuests = async (search?: string) => {
  const normalizedSearch = search?.trim();
  const query: {
    isDeleted: boolean;
    $or?: Array<{ name?: { $regex: string; $options: string }; mobileNo?: { $regex: string; $options: string } }>;
  } = {
    isDeleted: false,
  };

  if (normalizedSearch) {
    query.$or = [
      { name: { $regex: normalizedSearch, $options: "i" } },
      { mobileNo: { $regex: normalizedSearch, $options: "i" } },
    ];
  }

  return Guest.find(query).sort({ createdAt: -1 });
};

export const updateGuest = async (guestId: string, payload: UpdateGuestInput) => {
  assertObjectId(guestId, "Invalid guest id");

  const updates: UpdateGuestInput = {};
  if (payload.name !== undefined) {
    updates.name = normalizeName(payload.name);
  }

  if (payload.mobileNo !== undefined) {
    updates.mobileNo = normalizeMobileNo(payload.mobileNo);
  }

  if (payload.isCalled !== undefined) {
    updates.isCalled = payload.isCalled;
  }

  if (payload.isWatsapp !== undefined) {
    updates.isWatsapp = payload.isWatsapp;
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No valid fields provided for update");
  }

  if (updates.mobileNo) {
    const exists = await Guest.findOne({
      _id: { $ne: guestId },
      mobileNo: updates.mobileNo,
    });

    if (exists) {
      throw new Error("Guest already exists with this mobileNo");
    }
  }

  const guest = await Guest.findOneAndUpdate(
    { _id: guestId, isDeleted: false },
    { $set: updates },
    { new: true }
  );

  if (!guest) {
    throw new Error("Guest not found");
  }

  return guest;
};

export const softDeleteGuest = async (guestId: string) => {
  assertObjectId(guestId, "Invalid guest id");

  const guest = await Guest.findOneAndUpdate(
    { _id: guestId, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true }
  );

  if (!guest) {
    throw new Error("Guest not found");
  }

  return { id: guest._id, isDeleted: guest.isDeleted, deletedAt: guest.deletedAt };
};

export const assignGuestToEvents = async (guestId: string, payload: AssignGuestToEventsInput) => {
  assertObjectId(guestId, "Invalid guest id");
  const assignments = normalizeEventAssignments(payload);

  const guest = await Guest.findOne({ _id: guestId, isDeleted: false }).select("_id");
  if (!guest) {
    throw new Error("Guest not found");
  }

  const eventIds = assignments.map((item) => item.eventId);
  const uniqueEventIds = [...new Set(eventIds)];
  const events = await Event.find({ _id: { $in: uniqueEventIds }, isDeleted: false }).select("_id");
  if (events.length !== uniqueEventIds.length) {
    throw new Error("One or more events not found");
  }

  const bulkOps = assignments.map((item) => ({
    updateOne: {
      filter: { eventId: item.eventId, guestId },
      update: {
        $set: {
          guestTag: item.guestTag,
        },
      },
      upsert: true,
    },
  }));

  await EventGuest.bulkWrite(bulkOps);

  return EventGuest.find({ guestId })
    .sort({ createdAt: -1 })
    .populate("guestId", "name mobileNo")
    .populate("eventId", "eventName");
};

export const markGuestCallDone = async (guestId: string) => {
  assertObjectId(guestId, "Invalid guest id");

  const guest = await Guest.findOneAndUpdate(
    { _id: guestId, isDeleted: false },
    { $set: { isCalled: true } },
    { new: true }
  );

  if (!guest) {
    throw new Error("Guest not found");
  }

  return guest;
};
