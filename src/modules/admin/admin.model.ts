import mongoose, { Schema, type InferSchemaType } from "mongoose";

const adminSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export type AdminDocument = InferSchemaType<typeof adminSchema>;

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
