import { Schema, model, models } from "mongoose";

const GovernmentReportSchema = new Schema({
  reportId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  scope: {
    type: String,
    enum: ["statewide", "district", "national"],
    default: "statewide",
    index: true,
  },
  districtCode: { type: String },
  districtName: { type: String },
  state: { type: String, default: "State Government" },
  year: { type: Number, default: 2027 },
  generatedBy: { type: String, default: "Mission Control Engine" },
  
  executiveSummary: { type: String },
  
  // Synthesized 4E Indicators
  fourEAnalysis: {
    education: {
      totalInitiatives: { type: Number, default: 0 },
      participantsReached: { type: Number, default: 0 },
      institutionsEngaged: { type: Number, default: 0 },
      highlights: [String],
    },
    engineering: {
      blackspotsIdentified: { type: Number, default: 0 },
      potholesFixed: { type: Number, default: 0 },
      rectificationsCompleted: { type: Number, default: 0 },
      highlights: [String],
    },
    enforcement: {
      complianceDrives: { type: Number, default: 0 },
      helmetCheckpoints: { type: Number, default: 0 },
      highlights: [String],
    },
    emergency: {
      firstAidTrained: { type: Number, default: 0 },
      drillsConducted: { type: Number, default: 0 },
      highlights: [String],
    },
  },
  
  // Audits
  hazardAudit: {
    reported: { type: Number, default: 0 },
    resolved: { type: Number, default: 0 },
    rectificationRate: { type: Number, default: 0 },
  },
  actionAudit: {
    committed: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    verified: { type: Number, default: 0 },
  },
  
  // Top Performing Districts in this report
  topDistricts: [{
    districtName: String,
    score: Number,
    grade: String,
    rank: Number,
  }],
  
  evidenceAnnexures: [{
    title: String,
    type: String,
    url: String,
    description: String,
  }],
  
  status: {
    type: String,
    enum: ["draft", "final", "published"],
    default: "final",
  },
  
  generatedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

GovernmentReportSchema.index({ generatedAt: -1 });

export default models.GovernmentReport || model("GovernmentReport", GovernmentReportSchema);
