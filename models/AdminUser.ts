import { Schema, model, models } from "mongoose";

const AdminUserSchema = new Schema({
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, default: "admin" },
  fullName: { type: String },
  district: { type: String },
  state: { type: String },
  permissions: [{ type: String }],
});

export default models.AdminUser || model("AdminUser", AdminUserSchema);
