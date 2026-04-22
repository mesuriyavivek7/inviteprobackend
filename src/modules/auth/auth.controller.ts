import type { Request, Response } from "express";
import * as authService from "./auth.service.js";

const toErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Unexpected error";
};

export const signupUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await authService.signupUser(req.body);
    res.status(201).json({
      success: true,
      message: "User signup successful",
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

export const signupAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await authService.signupAdmin(req.body);
    res.status(201).json({
      success: true,
      message: "Admin signup successful",
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

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await authService.login(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: toErrorMessage(error),
      data: null,
    });
  }
};
