import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const GUEST_TAGS = ["single", "2_person", "family"] as const;

const eventGuestSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    guestId: {
      type: Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
    },
    guestTag: {
      type: String,
      enum: GUEST_TAGS,
      required: true,
    },
  },
  { timestamps: true }
);

eventGuestSchema.index({ eventId: 1, guestId: 1 }, { unique: true });

export type EventGuestDocument = InferSchemaType<typeof eventGuestSchema>;
export type GuestTag = (typeof GUEST_TAGS)[number];

const EventGuest = mongoose.model("EventGuest", eventGuestSchema);

export default EventGuest;
