import type { Request, Response } from "express";
import * as eventGuestService from "./eventGuest.service.js";

const toErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Unexpected error";
};

export const assignGuestsToEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = req.params.eventId;
    if (!eventId || Array.isArray(eventId)) {
      throw new Error("Invalid event id");
    }

    const data = await eventGuestService.assignGuestsToEvent(eventId, req.body);
    res.status(200).json({
      success: true,
      message: "Guests assigned to event successfully",
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: toErrorMessage(error),
      data: null,
    });
  }
};

export const getGuestsByEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = req.params.eventId;
    if (!eventId || Array.isArray(eventId)) {
      throw new Error("Invalid event id");
    }

    const data = await eventGuestService.getGuestsByEvent(eventId);
    res.status(200).json({
      success: true,
      message: "Event guests fetched successfully",
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: toErrorMessage(error),
      data: null,
    });
  }
};
