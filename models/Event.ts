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
  eventType: { 
    type: String, 
    enum: ["statewide", "regional"], 
    required: true,
    default: "statewide",
    index: true 
  }, // Event type: statewide or regional
  eventContext: {
    type: String,
    enum: ["online", "offline"],
    required: true,
    default: "online",
    index: true
  }, // Event context: online (happens on website) or offline (physical event)
  district: { type: String }, // District name (required for regional events)
  approved: { type: Boolean, default: false }, // Must be approved by admin
  photos: [String], // Legacy field, kept for backward compatibility
  groupPhoto: { type: String }, // GridFS file ID for group photo (max 1MB)
  youtubeVideos: [{ type: String }], // Array of YouTube video URLs (max 5)
  createdAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  approvedBy: { type: String },
  // Government Edition fields
  fourECategory: {
    type: String,
    enum: ["education", "engineering", "enforcement", "emergency"],
    index: true,
  },
  institutionId: { type: String, index: true },
  impactMetrics: {
    attendees: { type: Number, default: 0 },
    beneficiaries: { type: Number, default: 0 },
    mediaReach: { type: Number, default: 0 },
  },
  actionIds: [{ type: String }],
});

export default models.Event || model("Event", EventSchema);








