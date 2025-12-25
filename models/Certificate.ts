import { Schema, model, models } from "mongoose";

const CertificateSchema = new Schema({
  certificateId: { type: String, index: true, unique: true, required: true },
  certificateNumber: { type: Number, required: true }, // 1 to 100000 per type
  type: {
    type: String,
    enum: ["ORGANIZER", "PARTICIPANT", "MERIT"],
    required: true,
    index: true,
  },
  fullName: { type: String, required: true },
  institution: String,
  eventReferenceId: String, // KRMR-RSM-2026-PDL-RHL-EVT-00001 format
  eventTitle: String,
  organizerReferenceId: String, // Optional organizer reference
  activityType: { 
    type: String, 
    required: true 
  }, // Allow any activity type (quiz, basics, simulation, guides, prevention, essay, custom activities, etc.)
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  userEmail: String,
  userIpHash: String,
  appreciationOptIn: { type: Boolean, default: false },
  appreciationText: String,
});

// Compound unique index: certificateNumber must be unique per type
CertificateSchema.index({ type: 1, certificateNumber: 1 }, { unique: true });

export default models.Certificate || model("Certificate", CertificateSchema);










