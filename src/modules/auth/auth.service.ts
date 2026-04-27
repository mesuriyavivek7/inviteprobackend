import jwt from "jsonwebtoken";
import Admin from "../admin/admin.model.js";
import LoginMapping from "../loginMapping/loginMapping.model.js";
import User from "../user/user.model.js";
import { comparePassword, hashPassword } from "../../utils/hash.js";
import type { LoginInput, SignupInput } from "./auth.types.js";

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
};

const generateAccessToken = (id: unknown, role: string): string => {
  return jwt.sign({ id, role }, getJwtSecret(), {
    expiresIn: "7d",
  });
};

const assertSignupPayload = ({ fullName, email, password }: SignupInput): void => {
  if (!fullName?.trim() || !email?.trim() || !password?.trim()) {
    throw new Error("fullName, email and password are required");
  }
};

const assertLoginPayload = ({ email, password }: LoginInput): void => {
  if (!email?.trim() || !password?.trim()) {
    throw new Error("email and password are required");
  }
};

export const signupUser = async (payload: SignupInput) => {
  assertSignupPayload(payload);

  const email = payload.email.toLowerCase().trim();
  const existing = await LoginMapping.findOne({ email });
  if (existing) throw new Error("Email already exists");

  const user = await User.create({ fullName: payload.fullName.trim() });
  const hashed = await hashPassword(payload.password);

  const login = await LoginMapping.create({
    email,
    password: hashed,
    role: "user",
    refId: user._id,
  });

  const token = generateAccessToken(login._id, login.role);

  return {
    token,
    user: {
      id: login._id,
      email: login.email,
      role: login.role,
      status: login.status,
      refId: login.refId,
      fullName: user.fullName,
    },
  };
};

export const signupAdmin = async (payload: SignupInput) => {
  assertSignupPayload(payload);

  const email = payload.email.toLowerCase().trim();
  const existing = await LoginMapping.findOne({ email });
  if (existing) throw new Error("Email already exists");

  const admin = await Admin.create({ fullName: payload.fullName.trim() });
  const hashed = await hashPassword(payload.password);

  const login = await LoginMapping.create({
    email,
    password: hashed,
    role: "admin",
    refId: admin._id,
  });

  const token = generateAccessToken(login._id, login.role);

  return {
    token,
    user: {
      id: login._id,
      email: login.email,
      role: login.role,
      status: login.status,
      refId: login.refId,
      fullName: admin.fullName,
    },
  };
};

export const login = async (payload: LoginInput) => {
  assertLoginPayload(payload);

  const email = payload.email.toLowerCase().trim();
  const user = await LoginMapping.findOne({ email });

  if (!user) throw new Error("Invalid credentials");
  if (user.status !== "Active") throw new Error("Account inactive");

  const isMatch = await comparePassword(payload.password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = generateAccessToken(user._id, user.role);

  return {
    token,
    role: user.role,
  };
};
