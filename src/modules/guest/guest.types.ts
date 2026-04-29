export type GuestInput = {
  name: string;
  mobileNo: string;
};

export type CreateGuestInput = GuestInput | { guests: GuestInput[] };

export type UpdateGuestInput = {
  name?: string;
  mobileNo?: string;
};
