import mongoose from "mongoose";
import Event from "./event.model.js";
import EventGuest from "../eventGuest/eventGuest.model.js";
import type { CreateEventInput, UpdateEventInput } from "./event.types.js";

const assertEventName = (eventName: string | undefined): string => {
  const normalized = eventName?.trim();
  if (!normalized) {
    throw new Error("eventName is required");
  }
  return normalized;
};

const assertObjectId = (id: string, message: string): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(message);
  }
};

export const createEvent = async (payload: CreateEventInput, addedBy: string) => {
  const eventName = assertEventName(payload.eventName);

  const event = await Event.create({
    eventName,
    added_by: addedBy,
  });

  return event;
};

export const getAllEvents = async (search?: string) => {
  const normalizedSearch = search?.trim();
  const query: { isDeleted: boolean; eventName?: { $regex: string; $options: string } } = {
    isDeleted: false,
  };

  if (normalizedSearch) {
    query.eventName = { $regex: normalizedSearch, $options: "i" };
  }

  const events = await Event.find(query)
    .sort({ createdAt: -1 })
    .populate("added_by", "email role status");

  const eventIds = events.map((event) => event._id);

  const eventGuestStats = await EventGuest.aggregate<{
    _id: mongoose.Types.ObjectId;
    totalGuestCount: number;
    calledGuestCount: number;
  }>([
    {
      $match: {
        eventId: { $in: eventIds },
      },
    },
    {
      $lookup: {
        from: "guests",
        localField: "guestId",
        foreignField: "_id",
        as: "guest",
      },
    },
    { $unwind: "$guest" },
    {
      $match: {
        "guest.isDeleted": false,
      },
    },
    {
      $group: {
        _id: "$eventId",
        totalGuestCount: { $sum: 1 },
        calledGuestCount: {
          $sum: {
            $cond: [{ $eq: ["$guest.isCalled", true] }, 1, 0],
          },
        },
      },
    },
  ]);

  const statsByEventId = new Map(
    eventGuestStats.map((stat) => [stat._id.toString(), stat])
  );

  return events.map((event) => {
    const stat = statsByEventId.get(event._id.toString());
    const totalGuestCount = stat?.totalGuestCount ?? 0;
    const calledGuestCount = stat?.calledGuestCount ?? 0;
    const notCalledGuestCount = totalGuestCount - calledGuestCount;

    return {
      ...event.toObject(),
      totalGuestCount,
      calledGuestCount,
      notCalledGuestCount,
    };
  });
};

export const updateEvent = async (eventId: string, payload: UpdateEventInput) => {
  assertObjectId(eventId, "Invalid event id");

  const updates: { eventName?: string } = {};
  if (payload.eventName !== undefined) {
    updates.eventName = assertEventName(payload.eventName);
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No valid fields provided for update");
  }

  const event = await Event.findOneAndUpdate(
    { _id: eventId, isDeleted: false },
    { $set: updates },
    { new: true }
  ).populate("added_by", "email role status");

  if (!event) {
    throw new Error("Event not found");
  }

  return event;
};

export const softDeleteEvent = async (eventId: string) => {
  assertObjectId(eventId, "Invalid event id");

  const event = await Event.findOneAndUpdate(
    { _id: eventId, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true }
  );

  if (!event) {
    throw new Error("Event not found");
  }

  return { id: event._id, isDeleted: event.isDeleted, deletedAt: event.deletedAt };
};
