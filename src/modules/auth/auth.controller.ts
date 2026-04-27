import type { Request, Response } from "express";
import * as authService from "./auth.service.js";
import * as forgotPasswordService from "./forgot-password.service.js";

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

export const requestForgotPasswordOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await forgotPasswordService.requestForgotPasswordOtp(req.body);
    res.status(200).json({
      success: true,
      message: data.otpSent ? "OTP sent successfully" : "Email not found",
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

export const verifyForgotPasswordOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await forgotPasswordService.verifyForgotPasswordOtp(req.body);
    res.status(200).json({
      success: data.isValid,
      message: data.isValid ? "OTP is valid" : "OTP is invalid",
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

export const resetForgottenPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await forgotPasswordService.resetForgottenPassword(req.body);
    res.status(200).json({
      success: true,
      message: "Password reset successful",
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
