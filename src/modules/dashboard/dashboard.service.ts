import mongoose from "mongoose";
import Event from "../event/event.model.js";
import EventGuest from "../eventGuest/eventGuest.model.js";
import Guest from "../guest/guest.model.js";

type EventDashboardItem = {
  _id: string;
  eventName: string;
  guestCount: number;
  waSentCount: number;
  calledCount: number;
};

export const getDashboardData = async () => {
  const [totalGuestsCount, totalEventsCount, events] = await Promise.all([
    Guest.countDocuments({ isDeleted: false }),
    Event.countDocuments({ isDeleted: false }),
    Event.find({ isDeleted: false }).sort({ createdAt: -1 }).select("_id eventName"),
  ]);

  const eventIds = events.map((event) => event._id);

  const eventStats = await EventGuest.aggregate<{
    _id: mongoose.Types.ObjectId;
    guestCount: number;
    waSentCount: number;
    calledCount: number;
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
        guestCount: { $sum: 1 },
        waSentCount: {
          $sum: {
            $cond: [{ $eq: ["$isWatsapp", true] }, 1, 0],
          },
        },
        calledCount: {
          $sum: {
            $cond: [{ $eq: ["$isCalled", true] }, 1, 0],
          },
        },
      },
    },
  ]);

  const statsByEventId = new Map(eventStats.map((stat) => [stat._id.toString(), stat]));

  const eventData: EventDashboardItem[] = events.map((event) => {
    const stat = statsByEventId.get(event._id.toString());

    return {
      _id: event._id.toString(),
      eventName: event.eventName,
      guestCount: stat?.guestCount ?? 0,
      waSentCount: stat?.waSentCount ?? 0,
      calledCount: stat?.calledCount ?? 0,
    };
  });

  return {
    totalGuestsCount,
    totalEventsCount,
    events: eventData,
  };
};
