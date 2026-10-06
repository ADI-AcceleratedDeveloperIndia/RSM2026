import { Schema, model, models } from "mongoose";

const DistrictScorecardSchema = new Schema({
  districtCode: { type: String, required: true, index: true },
  districtName: { type: String, required: true },
  state: { type: String, default: "State Government" },
  year: { type: Number, default: 2027 },
  month: { type: Number, default: 1 },
  
  overallScore: { type: Number, required: true, default: 0 },
  rank: { type: Number },
  grade: { type: String, default: "C" }, // A+, A, B, C, D, F
  
  // 4E Pillar Component Scores (each out of 25)
  pillarScores: {
    education: { type: Number, default: 0 },
    engineering: { type: Number, default: 0 },
    enforcement: { type: Number, default: 0 },
    emergency: { type: Number, default: 0 },
  },
  
  // Raw Indicators
  metrics: {
    participants: { type: Number, default: 0 },
    certificates: { type: Number, default: 0 },
    events: { type: Number, default: 0 },
    actionsTotal: { type: Number, default: 0 },
    actionsCompleted: { type: Number, default: 0 },
    hazardsReported: { type: Number, default: 0 },
    hazardsResolved: { type: Number, default: 0 },
    institutions: { type: Number, default: 0 },
    pledges: { type: Number, default: 0 },
  },
  
  highlights: [String],
  computedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

DistrictScorecardSchema.index({ districtCode: 1, year: 1 }, { unique: true });

export default models.DistrictScorecard || model("DistrictScorecard", DistrictScorecardSchema);
