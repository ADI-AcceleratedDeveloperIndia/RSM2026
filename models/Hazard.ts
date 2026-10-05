import { Schema, model, models } from "mongoose";

const HazardSchema = new Schema({
  hazardId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ["pothole", "missing_sign", "broken_signal", "poor_visibility",
           "dangerous_curve", "no_footpath", "no_divider", "flooding",
           "encroachment", "other"],
    index: true
  },
  severity: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
    index: true
  },
  status: {
    type: String,
    enum: ["reported", "verified", "assigned", "in_progress", "resolved", "rejected"],
    default: "reported",
    index: true
  },
  
  // Location
  district: { type: String, required: true, index: true },
  state: { type: String, default: "Telangana" },
  location: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  
  // Reporter
  reportedBy: { type: String },
  reporterContact: { type: String },
  reporterIpHash: { type: String },
  
  // Evidence
  photos: [{ type: String }],
  beforePhotos: [{ type: String }],
  afterPhotos: [{ type: String }],
  
  // Verification & Resolution
  verifiedBy: { type: String },
  verifiedAt: { type: Date },
  assignedTo: { type: String },
  resolvedBy: { type: String },
  resolvedAt: { type: Date },
  resolutionNotes: { type: String },
  
  // Linked
  interventionId: { type: String },
  actionId: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

HazardSchema.index({ createdAt: -1 });

export default models.Hazard || model("Hazard", HazardSchema);
