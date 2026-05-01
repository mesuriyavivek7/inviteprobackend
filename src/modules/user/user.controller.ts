import type { Request, Response } from "express";
import * as userService from "./user.service.js";

type AuthRequest = Request & {
  user?: {
    id: string;
    role: "admin" | "user";
  };
};

const toErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Unexpected error";
};

const getAuthUserId = (req: AuthRequest): string => {
  const userId = req.user?.id;
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
};

export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await userService.getMyProfile(getAuthUserId(req));
    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
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

export const updateMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await userService.updateMyProfile(getAuthUserId(req), req.body);
    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
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

export const changeMyPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await userService.changeMyPassword(getAuthUserId(req), req.body);
    res.status(200).json({
      success: true,
      message: "Password changed successfully",
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
