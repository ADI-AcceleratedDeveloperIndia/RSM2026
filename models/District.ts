import { Schema, model, models } from "mongoose";

const DistrictSchema = new Schema({
  code: { type: String, required: true, unique: true, index: true },  // e.g., "HYDR"
  name: { type: String, required: true },                              // e.g., "Hyderabad"
  state: { type: String, required: true, default: "State Government", index: true },
  stateCode: { type: String, required: true, default: "SG" },
  population: { type: Number },
  area: { type: Number },  // sq km
  headquarters: { type: String },
  districtCollector: { type: String },
  transportOfficer: { type: String },
  
  // Denormalized counters (updated periodically)
  totalInstitutions: { type: Number, default: 0 },
  totalParticipants: { type: Number, default: 0 },
  totalEvents: { type: Number, default: 0 },
  totalActions: { type: Number, default: 0 },
  totalHazards: { type: Number, default: 0 },
  
  // Latest scorecard
  scorecardData: {
    score: { type: Number, default: 0 },
    rank: { type: Number },
    grade: { type: String, default: "N/A" },  // A+, A, B, C, D
    computedAt: { type: Date }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default models.District || model("District", DistrictSchema);
