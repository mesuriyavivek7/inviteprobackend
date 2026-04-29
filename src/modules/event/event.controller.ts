import type { Request, Response } from "express";
import * as eventService from "./event.service.js";

type AuthRequest = Request & {
  user?: {
    id: string;
    role: string;
  };
};

const toErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Unexpected error";
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null,
      });
      return;
    }

    const data = await eventService.createEvent(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: "Event created successfully",
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

export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const searchQuery = req.query.search;
    const search = typeof searchQuery === "string" ? searchQuery : undefined;

    const data = await eventService.getAllEvents(search);
    res.status(200).json({
      success: true,
      message: "Events fetched successfully",
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

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = req.params.eventId;
    if (!eventId || Array.isArray(eventId)) {
      throw new Error("Invalid event id");
    }

    const data = await eventService.updateEvent(eventId, req.body);
    res.status(200).json({
      success: true,
      message: "Event updated successfully",
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

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = req.params.eventId;
    if (!eventId || Array.isArray(eventId)) {
      throw new Error("Invalid event id");
    }

    const data = await eventService.softDeleteEvent(eventId);
    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
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
