import { Schema, model, models } from "mongoose";

const ClubSchema = new Schema({
  institutionName: { type: String, required: true },
  district: { type: String, required: true },
  pointOfContact: { type: String, required: true },
  organizerId: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.Club || model("Club", ClubSchema);

