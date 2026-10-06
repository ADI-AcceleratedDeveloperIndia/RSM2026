import { Schema, model, models } from "mongoose";

const SystemConfigSchema = new Schema({
  key: { type: String, required: true, unique: true, default: "platform_config" },
  stateName: { type: String, required: true, default: "State Government" },
  stateCode: { type: String, required: true, default: "SG" },
  year: { type: Number, default: 2027 },
  updatedBy: { type: String, default: "Superadmin" },
  updatedAt: { type: Date, default: Date.now }
});

export default models.SystemConfig || model("SystemConfig", SystemConfigSchema);
