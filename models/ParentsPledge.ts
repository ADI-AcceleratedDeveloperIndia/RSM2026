import { Schema, model, models } from "mongoose";

const ParentsPledgeSchema = new Schema({
  childName: { type: String, required: true },
  institutionName: { type: String, required: true },
  parentName: { type: String, required: true },
  district: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.ParentsPledge || model("ParentsPledge", ParentsPledgeSchema);

