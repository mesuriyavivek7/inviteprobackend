import type { Request, Response } from "express";
import * as faqService from "./faq.service.js";

const toErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Unexpected error";
};

export const createFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await faqService.createFaq(req.body);
    const isBulk = Array.isArray(data);
    res.status(201).json({
      success: true,
      message: isBulk ? "FAQs created successfully" : "FAQ created successfully",
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

export const getAllFaqs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await faqService.getAllFaqs();
    res.status(200).json({
      success: true,
      message: "FAQs fetched successfully",
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

export const getFaqById = async (req: Request, res: Response): Promise<void> => {
  try {
    const faqId = req.params.faqId;
    if (!faqId || Array.isArray(faqId)) {
      throw new Error("Invalid faq id");
    }
    const data = await faqService.getFaqById(faqId);
    res.status(200).json({
      success: true,
      message: "FAQ fetched successfully",
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

export const updateFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const faqId = req.params.faqId;
    if (!faqId || Array.isArray(faqId)) {
      throw new Error("Invalid faq id");
    }
    const data = await faqService.updateFaq(faqId, req.body);
    res.status(200).json({
      success: true,
      message: "FAQ updated successfully",
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

export const deleteFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const faqId = req.params.faqId;
    if (!faqId || Array.isArray(faqId)) {
      throw new Error("Invalid faq id");
    }
    const data = await faqService.deleteFaq(faqId);
    res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
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
