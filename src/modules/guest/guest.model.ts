import mongoose, { Schema, type InferSchemaType } from "mongoose";

const guestSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    mobileNo: { type: String, required: true, trim: true },
    isCalled: { type: Boolean, default: false },
    isWatsapp: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

guestSchema.index({ mobileNo: 1 }, { unique: true });

export type GuestDocument = InferSchemaType<typeof guestSchema>;

const Guest = mongoose.model("Guest", guestSchema);

export default Guest;
