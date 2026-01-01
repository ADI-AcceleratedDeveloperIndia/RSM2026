import { Schema, model, models } from "mongoose";

const OrganizerSchema = new Schema({
  temporaryId: { type: String, required: true, unique: true, index: true },
  finalId: { type: String, unique: true, sparse: true, index: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  institution: { type: String, required: true },
  designation: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },
  approvedBy: { type: String },
  approvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default models.Organizer || model("Organizer", OrganizerSchema);










