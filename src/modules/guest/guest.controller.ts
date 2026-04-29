import type { Request, Response } from "express";
import * as guestService from "./guest.service.js";

const toErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Unexpected error";
};

export const createGuests = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await guestService.createGuests(req.body);
    const isBulk = Array.isArray(data);

    res.status(201).json({
      success: true,
      message: isBulk ? "Guests created successfully" : "Guest created successfully",
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

export const getAllGuests = async (req: Request, res: Response): Promise<void> => {
  try {
    const searchQuery = req.query.search;
    const search = typeof searchQuery === "string" ? searchQuery : undefined;
    const data = await guestService.getAllGuests(search);

    res.status(200).json({
      success: true,
      message: "Guests fetched successfully",
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

export const updateGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const guestId = req.params.guestId;
    if (!guestId || Array.isArray(guestId)) {
      throw new Error("Invalid guest id");
    }

    const data = await guestService.updateGuest(guestId, req.body);

    res.status(200).json({
      success: true,
      message: "Guest updated successfully",
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

export const deleteGuest = async (req: Request, res: Response): Promise<void> => {
  try {
    const guestId = req.params.guestId;
    if (!guestId || Array.isArray(guestId)) {
      throw new Error("Invalid guest id");
    }

    const data = await guestService.softDeleteGuest(guestId);

    res.status(200).json({
      success: true,
      message: "Guest deleted successfully",
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
