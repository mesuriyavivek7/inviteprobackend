import { createHash, randomInt } from "node:crypto";
import { getRedisClient } from "../../config/redis.js";
import LoginMapping from "../loginMapping/loginMapping.model.js";
import { hashPassword } from "../../utils/hash.js";
import { sendOtpEmail } from "../../utils/mailer.js";
import type {
  ForgotPasswordRequestInput,
  ResetPasswordInput,
  VerifyOtpInput,
} from "./auth.types.js";

const OTP_LENGTH = 6;
const OTP_TTL_SECONDS = 10 * 60;
const VERIFIED_TTL_SECONDS = 15 * 60;
const MAX_VERIFY_ATTEMPTS = 5;

const getOtpKey = (email: string): string => `auth:forgot-password:otp:${email}`;
const getVerifiedKey = (email: string): string => `auth:forgot-password:verified:${email}`;

const normalizeEmail = (email: string): string => email.toLowerCase().trim();

const assertEmail = (email: string): void => {
  if (!email?.trim()) {
    throw new Error("email is required");
  }
};

const assertOtp = (otp: string): void => {
  if (!otp?.trim()) {
    throw new Error("otp is required");
  }
};

const assertNewPassword = (password: string): void => {
  if (!password?.trim()) {
    throw new Error("newPassword is required");
  }
  if (password.length < 6) {
    throw new Error("newPassword must be at least 6 characters");
  }
};

const generateOtp = (): string => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH;
  return String(randomInt(min, max));
};

const hashOtp = (otp: string): string => {
  return createHash("sha256").update(otp).digest("hex");
};

export const requestForgotPasswordOtp = async (payload: ForgotPasswordRequestInput) => {
  assertEmail(payload.email);
  const email = normalizeEmail(payload.email);

  const account = await LoginMapping.findOne({ email });
  if (!account) {
    return { available: false, otpSent: false };
  }

  const otp = generateOtp();
  const redis = await getRedisClient();

  await redis.set(
    getOtpKey(email),
    JSON.stringify({
      otpHash: hashOtp(otp),
      attempts: 0,
      createdAt: Date.now(),
    }),
    { EX: OTP_TTL_SECONDS }
  );

  await sendOtpEmail(email, otp);

  return {
    available: true,
    otpSent: true,
    expiresInSeconds: OTP_TTL_SECONDS,
  };
};

export const verifyForgotPasswordOtp = async (payload: VerifyOtpInput) => {
  assertEmail(payload.email);
  assertOtp(payload.otp);

  const email = normalizeEmail(payload.email);
  const redis = await getRedisClient();
  const otpKey = getOtpKey(email);

  const raw = await redis.get(otpKey);
  if (!raw) {
    return { isValid: false };
  }

  const parsed = JSON.parse(raw) as { otpHash: string; attempts: number };
  const attempts = parsed.attempts ?? 0;

  if (attempts >= MAX_VERIFY_ATTEMPTS) {
    await redis.del(otpKey);
    return { isValid: false };
  }

  const incomingHash = hashOtp(payload.otp.trim());
  if (incomingHash !== parsed.otpHash) {
    const ttl = await redis.ttl(otpKey);
    const nextTtl = ttl > 0 ? ttl : OTP_TTL_SECONDS;
    await redis.set(
      otpKey,
      JSON.stringify({
        ...parsed,
        attempts: attempts + 1,
      }),
      { EX: nextTtl }
    );
    return { isValid: false };
  }

  await redis.set(getVerifiedKey(email), "1", { EX: VERIFIED_TTL_SECONDS });
  await redis.del(otpKey);

  return { isValid: true };
};

export const resetForgottenPassword = async (payload: ResetPasswordInput) => {
  assertEmail(payload.email);
  assertNewPassword(payload.newPassword);

  const email = normalizeEmail(payload.email);
  const redis = await getRedisClient();
  const verified = await redis.get(getVerifiedKey(email));

  if (!verified) {
    throw new Error("OTP verification required");
  }

  const account = await LoginMapping.findOne({ email });
  if (!account) {
    throw new Error("Account not found");
  }

  account.password = await hashPassword(payload.newPassword.trim());
  await account.save();

  await redis.del(getVerifiedKey(email));

  return { passwordReset: true };
};
