import mongoose, { Schema } from "mongoose";
export const LOGIN_ROLES = ["admin", "user"];
export const LOGIN_STATUS = ["Active", "Inactive"];
const loginMappingSchema = new Schema({
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: LOGIN_ROLES,
        required: true,
    },
    status: {
        type: String,
        enum: LOGIN_STATUS,
        default: "Active",
    },
    refId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "role",
    },
}, { timestamps: true });
const LoginMapping = mongoose.model("LoginMapping", loginMappingSchema);
export default LoginMapping;
//# sourceMappingURL=loginMapping.model.js.map