import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const LOGIN_ROLES = ["admin", "user"] as const;
export const LOGIN_STATUS = ["Active", "Inactive"] as const;

const loginMappingSchema = new Schema(
  {
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
  },
  { timestamps: true }
);

export type LoginMappingDocument = InferSchemaType<typeof loginMappingSchema>;
export type LoginRole = (typeof LOGIN_ROLES)[number];

const LoginMapping = mongoose.model("LoginMapping", loginMappingSchema);

export default LoginMapping;
