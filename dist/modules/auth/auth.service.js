import jwt from "jsonwebtoken";
import Admin from "../admin/admin.model.js";
import LoginMapping from "../loginMapping/loginMapping.model.js";
import User from "../user/user.model.js";
import { comparePassword, hashPassword } from "../../utils/hash.js";
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    return secret;
};
const assertSignupPayload = ({ fullName, email, password }) => {
    if (!fullName?.trim() || !email?.trim() || !password?.trim()) {
        throw new Error("fullName, email and password are required");
    }
};
const assertLoginPayload = ({ email, password }) => {
    if (!email?.trim() || !password?.trim()) {
        throw new Error("email and password are required");
    }
};
export const signupUser = async (payload) => {
    assertSignupPayload(payload);
    const email = payload.email.toLowerCase().trim();
    const existing = await LoginMapping.findOne({ email });
    if (existing)
        throw new Error("Email already exists");
    const user = await User.create({ fullName: payload.fullName.trim() });
    const hashed = await hashPassword(payload.password);
    const login = await LoginMapping.create({
        email,
        password: hashed,
        role: "user",
        refId: user._id,
    });
    return {
        id: login._id,
        email: login.email,
        role: login.role,
        status: login.status,
        refId: login.refId,
    };
};
export const signupAdmin = async (payload) => {
    assertSignupPayload(payload);
    const email = payload.email.toLowerCase().trim();
    const existing = await LoginMapping.findOne({ email });
    if (existing)
        throw new Error("Email already exists");
    const admin = await Admin.create({ fullName: payload.fullName.trim() });
    const hashed = await hashPassword(payload.password);
    const login = await LoginMapping.create({
        email,
        password: hashed,
        role: "admin",
        refId: admin._id,
    });
    return {
        id: login._id,
        email: login.email,
        role: login.role,
        status: login.status,
        refId: login.refId,
    };
};
export const login = async (payload) => {
    assertLoginPayload(payload);
    const email = payload.email.toLowerCase().trim();
    const user = await LoginMapping.findOne({ email });
    if (!user)
        throw new Error("Invalid credentials");
    if (user.status !== "Active")
        throw new Error("Account inactive");
    const isMatch = await comparePassword(payload.password, user.password);
    if (!isMatch)
        throw new Error("Invalid credentials");
    const token = jwt.sign({ id: user._id, role: user.role }, getJwtSecret(), {
        expiresIn: "7d",
    });
    return {
        token,
        role: user.role,
    };
};
//# sourceMappingURL=auth.service.js.map