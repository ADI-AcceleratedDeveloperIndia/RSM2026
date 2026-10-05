import { Schema, model, models } from "mongoose";

const QuizAttemptSchema = new Schema({
  referenceId: { type: String, required: true, unique: true, index: true },
  certificateType: {
    type: String,
    enum: ["QUIZ", "PAR"],
    required: true,
  },
  fullName: String,
  institution: String,
  score: Number,
  passed: Boolean,
  createdAt: { type: Date, default: Date.now },
});

export default models.QuizAttempt || model("QuizAttempt", QuizAttemptSchema);








