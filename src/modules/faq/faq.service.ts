import mongoose from "mongoose";
import Faq from "./faq.model.js";
import type { CreateFaqInput, CreateFaqRequest, UpdateFaqInput } from "./faq.types.js";

const assertObjectId = (id: string, message: string): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(message);
  }
};

const normalizeText = (value: string | undefined, label: string): string => {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`${label} is required`);
  }
  return trimmed;
};

const normalizeCreateFaqItems = (payload: CreateFaqRequest): CreateFaqInput[] => {
  if (Array.isArray(payload)) {
    if (payload.length === 0) {
      throw new Error("At least one FAQ item is required");
    }
    return payload;
  }

  if (payload && typeof payload === "object" && "faqs" in payload) {
    const { faqs } = payload as { faqs: unknown };
    if (!Array.isArray(faqs) || faqs.length === 0) {
      throw new Error("faqs must be a non-empty array");
    }
    return faqs as CreateFaqInput[];
  }

  return [payload as CreateFaqInput];
};

export const createFaq = async (payload: CreateFaqRequest) => {
  const items = normalizeCreateFaqItems(payload).map((item) => ({
    question: normalizeText(item.question, "question"),
    answer: normalizeText(item.answer, "answer"),
  }));

  if (items.length === 1) {
    const first = items[0];
    if (!first) {
      throw new Error("At least one FAQ item is required");
    }
    return Faq.create(first);
  }

  return Faq.insertMany(items);
};

export const getAllFaqs = async () => {
  return Faq.find().sort({ createdAt: -1 });
};

export const getFaqById = async (faqId: string) => {
  assertObjectId(faqId, "Invalid faq id");
  const faq = await Faq.findById(faqId);
  if (!faq) {
    throw new Error("FAQ not found");
  }
  return faq;
};

export const updateFaq = async (faqId: string, payload: UpdateFaqInput) => {
  assertObjectId(faqId, "Invalid faq id");

  const updates: { question?: string; answer?: string } = {};
  if (payload.question !== undefined) {
    updates.question = normalizeText(payload.question, "question");
  }
  if (payload.answer !== undefined) {
    updates.answer = normalizeText(payload.answer, "answer");
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No valid fields provided for update");
  }

  const faq = await Faq.findByIdAndUpdate(faqId, { $set: updates }, { new: true });
  if (!faq) {
    throw new Error("FAQ not found");
  }
  return faq;
};

export const deleteFaq = async (faqId: string) => {
  assertObjectId(faqId, "Invalid faq id");
  const faq = await Faq.findByIdAndDelete(faqId);
  if (!faq) {
    throw new Error("FAQ not found");
  }
  return { id: faq._id };
};
