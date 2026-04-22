import mongoose, { Schema } from "mongoose";
const adminSchema = new Schema({
    fullName: { type: String, required: true, trim: true },
}, { timestamps: true });
const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
//# sourceMappingURL=admin.model.js.map