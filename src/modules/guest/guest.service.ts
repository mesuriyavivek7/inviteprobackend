import mongoose from "mongoose";
import Guest from "./guest.model.js";
import type { CreateGuestInput, GuestInput, UpdateGuestInput } from "./guest.types.js";

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
