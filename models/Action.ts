import { Schema, model, models } from "mongoose";

const EvidenceSubSchema = new Schema({
  type: { type: String, enum: ["photo", "document", "video", "link"] },
  url: { type: String },
  description: { type: String },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const ActionSchema = new Schema({
  actionId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  fourECategory: {
    type: String,
    enum: ["education", "engineering", "enforcement", "emergency"],
    required: true,
    index: true
  },
  actionType: {
    type: String,
    enum: ["individual", "institutional", "government"],
    required: true
  },
  status: {
    type: String,
    enum: ["committed", "in_progress", "completed", "verified", "rejected"],
    default: "committed",
    index: true
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium"
  },
  
  // Who
  submittedBy: { type: String },
  submittedByRole: { type: String },
  institutionId: { type: String, index: true },
  district: { type: String, required: true, index: true },
  state: { type: String, default: "Telangana" },
  
  // What
  targetDate: { type: Date },
  completedDate: { type: Date },
  evidence: [EvidenceSubSchema],
  beforePhotos: [{ type: String }],
  afterPhotos: [{ type: String }],
  
  // Verification
  verifiedBy: { type: String },
  verifiedAt: { type: Date },
  verificationNotes: { type: String },
  
  // Metrics
  estimatedBeneficiaries: { type: Number },
  actualBeneficiaries: { type: Number },
  impactScore: { type: Number, default: 0 },
  
  // Linked
  eventReferenceId: { type: String },
  hazardId: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ActionSchema.index({ createdAt: -1 });

export default models.Action || model("Action", ActionSchema);
