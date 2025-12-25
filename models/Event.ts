import { Schema, model, models } from "mongoose";

const EventSchema = new Schema({
  referenceId: { type: String, required: true, unique: true, index: true },
  eventNumber: { type: Number, required: true, unique: true, index: true }, // 1 to 100000
  title: { type: String, required: true },
  organizerId: { type: String, required: true, index: true }, // Final organizer ID
  organizerName: { type: String, required: true },
  institution: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true, default: "Karimnagar" },
  approved: { type: Boolean, default: false }, // Must be approved by admin
  photos: [String], // Legacy field, kept for backward compatibility
  groupPhoto: { type: String }, // GridFS file ID for group photo (max 1MB)
  youtubeVideos: [{ type: String }], // Array of YouTube video URLs (max 5)
  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  approvedBy: { type: String },
});

export default models.Event || model("Event", EventSchema);








