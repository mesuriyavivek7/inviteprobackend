import type { Request, Response } from "express";
import * as dashboardService from "./dashboard.service.js";

const toErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Unexpected error";
};

export const getDashboardData = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await dashboardService.getDashboardData();

    res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
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
