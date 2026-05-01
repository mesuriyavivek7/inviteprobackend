export type UpdateMyProfileInput = {
  fullName?: string;
  email?: string;
};

export type ChangeMyPasswordInput = {
  oldPassword: string;
  newPassword: string;
};
