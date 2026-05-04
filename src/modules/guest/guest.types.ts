export type GuestInput = {
  name: string;
  mobileNo: string;
};

export type CreateGuestInput = GuestInput | { guests: GuestInput[] };

export type UpdateGuestInput = {
  name?: string;
  mobileNo?: string;
};

export type AssignGuestEventItemInput = {
  eventId: string;
  guestTag: "single" | "2_person" | "family";
};

export type AssignGuestToEventsInput =
  | AssignGuestEventItemInput
  | { events: AssignGuestEventItemInput[] };

export type UpsertGuestEventMappingItemInput = {
  eventId?: string;
  eventName?: string;
  guestTag: "single" | "2_person" | "family";
  isCalled?: boolean;
  isWatsapp?: boolean;
};

export type UpsertGuestEventMappingsInput = {
  events: UpsertGuestEventMappingItemInput[];
};
