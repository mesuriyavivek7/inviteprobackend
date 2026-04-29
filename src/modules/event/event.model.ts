import mongoose, { Schema, type InferSchemaType } from "mongoose";

const eventSchema = new Schema(
  {
    eventName: { type: String, required: true, trim: true },
    added_by: {
      type: Schema.Types.ObjectId,
      ref: "LoginMapping",
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type EventDocument = InferSchemaType<typeof eventSchema>;

const Event = mongoose.model("Event", eventSchema);

export default Event;
