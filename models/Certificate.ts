import { Schema, model, models } from "mongoose";

const CertificateSchema = new Schema({
  certificateId: { type: String, index: true, unique: true, required: true },
  certificateNumber: { type: Number, required: true, unique: true, index: true }, // 1 to 100000 per type
  type: {
    type: String,
    enum: ["ORGANIZER", "PARTICIPANT", "MERIT"],
    required: true,
  },
  fullName: { type: String, required: true },
  institution: String,
  eventReferenceId: String, // KRMR-RSM-2026-PDL-RHL-EVT-00001 format
  eventTitle: String,
  organizerReferenceId: String, // Optional organizer reference
  activityType: { 
    type: String, 
    enum: ["basics", "simulation", "quiz", "guides", "prevention", "online"],
    required: true 
  },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  userEmail: String,
  userIpHash: String,
});

export default models.Certificate || model("Certificate", CertificateSchema);










