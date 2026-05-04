import mongoose from "mongoose";
import Guest from "./guest.model.js";
import Event from "../event/event.model.js";
import EventGuest from "../eventGuest/eventGuest.model.js";
import { normalizeGuestTagInput } from "../eventGuest/guestTag.util.js";
import type {
  AssignGuestToEventsInput,
  CreateGuestInput,
  GuestInput,
  UpsertGuestEventMappingsInput,
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
      guestTag: normalizeGuestTagInput(item.guestTag),
    };
  });
};

const normalizeGuestEventMappingsPayload = (payload: UpsertGuestEventMappingsInput) => {
  if (!Array.isArray(payload.events) || payload.events.length === 0) {
    throw new Error("events must be a non-empty array");
  }

  return payload.events.map((item) => {
    const eventId = item.eventId?.trim();
    const eventName = item.eventName?.trim();

    if (!eventId && !eventName) {
      throw new Error("Each item must include eventId or eventName");
    }

    if (eventId) {
      assertObjectId(eventId, "Invalid event id");
    }

    return {
      eventId,
      eventName,
      guestTag: normalizeGuestTagInput(item.guestTag),
      isCalled: item.isCalled ?? false,
      isWatsapp: item.isWatsapp ?? false,
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

export const getGuestEvents = async (guestId: string) => {
  assertObjectId(guestId, "Invalid guest id");

  const guest = await Guest.findOne({ _id: guestId, isDeleted: false }).select("_id name mobileNo").lean();
  if (!guest) {
    throw new Error("Guest not found");
  }

  const events = await Event.find({ isDeleted: false }).sort({ createdAt: -1 }).select("_id eventName").lean();
  const eventIds = events.map((event) => event._id);

  const mappings = await EventGuest.find({ guestId, eventId: { $in: eventIds } })
    .select("eventId guestTag isCalled isWatsapp")
    .lean();

  const mappingByEventId = new Map(mappings.map((item) => [item.eventId.toString(), item]));

  const eventList = events.map((event) => {
    const mapping = mappingByEventId.get(event._id.toString());
    return {
      _id: event._id,
      eventName: event.eventName,
      isAssigned: Boolean(mapping),
      guestTag: mapping?.guestTag ?? null,
      isCalled: mapping?.isCalled ?? false,
      isWatsapp: mapping?.isWatsapp ?? false,
    };
  });

  return {
    guest,
    totalEvents: eventList.length,
    assignedEventsCount: mappings.length,
    data: eventList,
  };
};

export const upsertGuestEventMappings = async (guestId: string, payload: UpsertGuestEventMappingsInput) => {
  assertObjectId(guestId, "Invalid guest id");
  const items = normalizeGuestEventMappingsPayload(payload);

  const guest = await Guest.findOne({ _id: guestId, isDeleted: false }).select("_id");
  if (!guest) {
    throw new Error("Guest not found");
  }

  const eventIdsFromPayload = items
    .map((item) => item.eventId)
    .filter((id): id is string => Boolean(id));
  const eventNamesFromPayload = items
    .map((item) => item.eventName)
    .filter((name): name is string => Boolean(name));

  const events = await Event.find({
    isDeleted: false,
    $or: [{ _id: { $in: eventIdsFromPayload } }, { eventName: { $in: eventNamesFromPayload } }],
  })
    .select("_id eventName")
    .lean();

  const eventById = new Map(events.map((event) => [event._id.toString(), event]));
  const eventByName = new Map(events.map((event) => [event.eventName.toLowerCase(), event]));

  const resolvedMappings = items.map((item) => {
    const event =
      (item.eventId ? eventById.get(item.eventId) : undefined) ??
      (item.eventName ? eventByName.get(item.eventName.toLowerCase()) : undefined);

    if (!event) {
      throw new Error(`Event not found for item: ${item.eventId ?? item.eventName}`);
    }

    return {
      eventId: event._id.toString(),
      guestTag: item.guestTag,
      isCalled: item.isCalled,
      isWatsapp: item.isWatsapp,
    };
  });

  const bulkOps = resolvedMappings.map((item) => ({
    updateOne: {
      filter: { eventId: item.eventId, guestId },
      update: {
        $set: {
          guestTag: item.guestTag,
          isCalled: item.isCalled,
          isWatsapp: item.isWatsapp,
        },
      },
      upsert: true,
    },
  }));

  await EventGuest.bulkWrite(bulkOps);

  return EventGuest.find({ guestId })
    .sort({ createdAt: -1 })
    .populate("guestId", "name mobileNo")
    .populate("eventId", "eventName")
    .lean();
};
