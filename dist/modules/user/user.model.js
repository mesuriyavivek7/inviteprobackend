import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    fullName: { type: String, required: true, trim: true },
}, { timestamps: true });
const User = mongoose.model("User", userSchema);
export default User;
//# sourceMappingURL=user.model.js.map