export type GuestInput = {
  name: string;
  mobileNo: string;
};

export type CreateGuestInput = GuestInput | { guests: GuestInput[] };

export type UpdateGuestInput = {
  name?: string;
  mobileNo?: string;
  isCalled?: boolean;
  isWatsapp?: boolean;
};

export type AssignGuestEventItemInput = {
  eventId: string;
  guestTag: "single" | "2_person" | "family" | "Single" | "Two" | "Family";
};

export type AssignGuestToEventsInput =
  | AssignGuestEventItemInput
  | { events: AssignGuestEventItemInput[] };
