import { Schema, model, models } from "mongoose";

const EventSchema = new Schema({
  referenceId: { type: String, required: true, unique: true, index: true },
  title: String,
  organiserName: String,
  organiserRole: String,
  institution: String,
  date: Date,
  location: String,
  regionCode: String,
  photos: [String],
  approved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.Event || model("Event", EventSchema);








