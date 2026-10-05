import { Schema, model, models } from "mongoose";

const SimStatSchema = new Schema({
  referenceId: { type: String, required: true, unique: true, index: true },
  sceneId: { type: String, required: true, index: true },
  category: {
    type: String,
    enum: ["bike", "car", "pedestrian", "other"],
    required: true,
    index: true,
  },
  success: { type: Boolean, required: true },
  attempts: { type: Number, required: true },
  seconds: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

export default models.SimStat || model("SimStat", SimStatSchema);




