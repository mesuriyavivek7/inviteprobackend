import LoginMapping from "../loginMapping/loginMapping.model.js";
import User from "./user.model.js";
import { comparePassword, hashPassword } from "../../utils/hash.js";
import type { ChangeMyPasswordInput, UpdateMyProfileInput } from "./user.types.js";

const normalizeEmail = (email?: string): string | undefined => {
  const value = email?.trim().toLowerCase();
  return value || undefined;
};

const normalizeFullName = (fullName?: string): string | undefined => {
  const value = fullName?.trim();
  return value || undefined;
};

const getUserLogin = async (loginId: string) => {
  const login = await LoginMapping.findById(loginId);
  if (!login || login.role !== "user") {
    throw new Error("User not found");
  }
  return login;
};

export const getMyProfile = async (loginId: string) => {
  const login = await getUserLogin(loginId);
  const user = await User.findById(login.refId).select("_id fullName");
  if (!user) {
    throw new Error("User profile not found");
  }

  return {
    id: login._id,
    userId: user._id,
    fullName: user.fullName,
    email: login.email,
    role: login.role,
    status: login.status,
  };
};

export const updateMyProfile = async (loginId: string, payload: UpdateMyProfileInput) => {
  const login = await getUserLogin(loginId);

  const fullName = normalizeFullName(payload.fullName);
  const email = normalizeEmail(payload.email);

  if (!fullName && !email) {
    throw new Error("At least one of fullName or email is required");
  }

  if (email) {
    const existing = await LoginMapping.findOne({
      _id: { $ne: login._id },
      email,
    }).select("_id");

    if (existing) {
      throw new Error("Email already exists");
    }
  }

  if (fullName) {
    const user = await User.findByIdAndUpdate(login.refId, { $set: { fullName } }, { new: true });
    if (!user) {
      throw new Error("User profile not found");
    }
  }

  if (email) {
    login.email = email;
    await login.save();
  }

  return getMyProfile(loginId);
};

export const changeMyPassword = async (loginId: string, payload: ChangeMyPasswordInput) => {
  const oldPassword = payload.oldPassword?.trim();
  const newPassword = payload.newPassword?.trim();

  if (!oldPassword || !newPassword) {
    throw new Error("oldPassword and newPassword are required");
  }

  if (oldPassword === newPassword) {
    throw new Error("newPassword must be different from oldPassword");
  }

  const login = await getUserLogin(loginId);
  const isMatch = await comparePassword(oldPassword, login.password);
  if (!isMatch) {
    throw new Error("Old password is incorrect");
  }

  login.password = await hashPassword(newPassword);
  await login.save();

  return {
    updated: true,
  };
};
