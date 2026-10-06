import { Schema, model, models } from "mongoose";

const InstitutionSchema = new Schema({
  institutionId: { type: String, required: true, unique: true, index: true },  // e.g., "INST-HYDR-00001"
  name: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["school", "college", "university", "ngo", "corporate", "government", "other"],
    index: true
  },
  district: { type: String, required: true, index: true },
  state: { type: String, required: true, default: "State Government" },
  address: { type: String },
  pincode: { type: String },
  contactPerson: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  organizerIds: [{ type: String }],  // linked organizer finalIds
  status: {
    type: String,
    enum: ["active", "inactive", "verified"],
    default: "active",
    index: true
  },
  verifiedBy: { type: String },
  verifiedAt: { type: Date },
  
  // Denormalized counters
  totalParticipants: { type: Number, default: 0 },
  totalEvents: { type: Number, default: 0 },
  totalActions: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default models.Institution || model("Institution", InstitutionSchema);
