import { Schema, model, models } from "mongoose";

const InterventionSchema = new Schema({
  interventionId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  fourECategory: {
    type: String,
    enum: ["education", "engineering", "enforcement", "emergency"],
    default: "engineering",
    index: true,
  },
  hazardId: { type: String, index: true },
  district: { type: String, required: true, index: true },
  state: { type: String, default: "Telangana" },
  department: {
    type: String,
    enum: ["roads_and_buildings", "traffic_police", "municipal_corporation", "nhai", "transport_dept", "health_emergency", "other"],
    default: "roads_and_buildings",
    index: true,
  },
  officerInCharge: { type: String },
  budgetEstimate: { type: Number, default: 0 },
  actualSpend: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["proposed", "approved", "in_progress", "completed", "cancelled"],
    default: "proposed",
    index: true,
  },
  startDate: { type: Date },
  completionDate: { type: Date },
  beforePhotos: [{ type: String }],
  afterPhotos: [{ type: String }],
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

InterventionSchema.index({ createdAt: -1 });

export default models.Intervention || model("Intervention", InterventionSchema);
