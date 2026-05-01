import mongoose, { Schema, type InferSchemaType } from "mongoose";

const faqSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export type FaqDocument = InferSchemaType<typeof faqSchema>;

const Faq = mongoose.model("Faq", faqSchema);

export default Faq;
