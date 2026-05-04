import type { GuestTag } from "./eventGuest.model.js";

export type AssignGuestItemInput = {
  guestId: string;
  guestTag: GuestTag;
};

export type AssignGuestsInput = AssignGuestItemInput | { guests: AssignGuestItemInput[] };

export type UpdateEventGuestStatusInput = {
  isCalled?: boolean;
  isWatsapp?: boolean;
};
