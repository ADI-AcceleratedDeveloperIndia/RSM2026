import { Schema, model, models } from "mongoose";

const SignatureMapSchema = new Schema({
  regionCode: { type: String, unique: true },
  rtaName: String,
  signatureUrl: String,
});

export default models.SignatureMap || model("SignatureMap", SignatureMapSchema);










