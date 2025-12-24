import { Schema, model, models } from "mongoose";

const CertificateSchema = new Schema({
  certificateId: { type: String, index: true, unique: true },
  type: {
    type: String,
    enum: ["organiser", "participant", "merit"],
    required: true,
  },
  fullName: { type: String, required: true },
  institution: String,
  eventTitle: String,
  eventDate: Date,
  regionCode: String,
  score: Number,
  createdAt: { type: Date, default: Date.now },
  verificationUrl: String,
  appreciationOptIn: { type: Boolean, default: false },
  appreciationText: String,
  appreciationTo: {
    type: String,
    default: "To Sri Ponnam Prabhakar Garu, Hon'ble Cabinet Minister of Government of Telangana",
  },
  userEmail: String,
  userIpHash: String,
});

export default models.Certificate || model("Certificate", CertificateSchema);










