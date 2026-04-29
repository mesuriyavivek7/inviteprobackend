import type { GuestTag } from "./eventGuest.model.js";

export type AssignGuestItemInput = {
  guestId: string;
  guestTag: GuestTag | "2 person";
};

export type AssignGuestsInput = AssignGuestItemInput | { guests: AssignGuestItemInput[] };
