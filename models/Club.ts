import { Schema, model, models } from "mongoose";

const ClubSchema = new Schema({
  institutionName: { type: String, required: true },
  district: { type: String, required: true },
  pointOfContact: { type: String, required: true },
  organizerId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  // Government Edition fields
  institutionId: { type: String, index: true },
  status: { type: String, enum: ["active", "inactive", "verified"], default: "active", index: true },
  verifiedBy: String,
  memberCount: { type: Number, default: 0 },
});

export default models.Club || model("Club", ClubSchema);

