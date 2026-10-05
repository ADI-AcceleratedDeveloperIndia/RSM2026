import { Schema, model, models } from "mongoose";

const SimulationPlaySchema = new Schema({
  type: { type: String, enum: ["bike", "car", "pedestrian"], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.SimulationPlay || model("SimulationPlay", SimulationPlaySchema);









