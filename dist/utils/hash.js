import bcrypt from "bcrypt";
const SALT_ROUNDS = 10;
export const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUNDS);
};
export const comparePassword = async (password, hashed) => {
    return bcrypt.compare(password, hashed);
};
//# sourceMappingURL=hash.js.map