import { Schema, model, models } from "mongoose";

const DailyReportSchema = new Schema({
  date: { type: String, required: true, unique: true, index: true }, // Format: YYYY-MM-DD
  events: [{
    referenceId: String,
    title: String,
    organizerId: String,
    organizerName: String,
    institution: String,
    date: Date,
    location: String,
    approved: Boolean,
    createdAt: Date,
  }],
  participants: [{
    certificateId: String,
    fullName: String,
    institution: String,
    type: String,
    score: Number,
    total: Number,
    percentage: Number,
    activityType: String,
    eventReferenceId: String,
    eventTitle: String,
    createdAt: Date,
  }],
  organizers: [{
    temporaryId: String,
    finalId: String,
    fullName: String,
    email: String,
    phone: String,
    institution: String,
    designation: String,
    status: String,
    createdAt: Date,
  }],
  stats: {
    totalCertificates: Number,
    totalAppreciations: Number,
    totalEvents: Number,
    totalQuizPasses: Number,
    totalQuizAttempts: Number,
    passRate: Number,
    totalSimulationPlays: Number,
    successRate: Number,
    avgTimeSeconds: Number,
  },
  createdAt: { type: Date, default: Date.now },
});

export default models.DailyReport || model("DailyReport", DailyReportSchema);







