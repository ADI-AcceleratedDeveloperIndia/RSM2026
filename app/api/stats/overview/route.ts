import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";
import Event from "@/models/Event";
import QuizAttempt from "@/models/QuizAttempt";
import SimStat from "@/models/SimStat";
import { getCache, setCache } from "@/lib/cache";

const CACHE_KEY = "stats:overview";
const CACHE_TTL = 30 * 1000; // 30 seconds cache

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const cached = getCache<{
      totalCertificates: number;
      totalAppreciations: number;
      totalEvents: number;
      totalQuizPasses: number;
      totalQuizAttempts: number;
      passRate: number;
      totalSimulationPlays: number;
      successRate: number;
    }>(CACHE_KEY);
    
    if (cached) {
      return NextResponse.json(cached);
    }

    await connectDB();

    // Get quiz-related certificates (activityType includes "quiz")
    const quizCertificates = await Certificate.find({ 
      activityType: { $regex: /quiz/i } 
    }).lean();
    
    const totalQuizCertificates = quizCertificates.length;
    const quizParticipant = quizCertificates.filter(c => {
      if (c.type === "PARTICIPANT") return true;
      if (c.type === "MERIT" && c.score && c.total) {
        const percentage = (c.score / c.total) * 100;
        return percentage < 60;
      }
      return false;
    }).length;
    const quizMerit = quizCertificates.filter(c => {
      if (c.type === "MERIT" && c.score && c.total) {
        const percentage = (c.score / c.total) * 100;
        return percentage >= 60 && percentage < 80;
      }
      return false;
    }).length;
    const quizTopper = quizCertificates.filter(c => {
      if (c.type === "MERIT" && c.score && c.total) {
        const percentage = (c.score / c.total) * 100;
        return percentage >= 80;
      }
      return false;
    }).length;

    const [totalCertificates, totalAppreciations, totalEvents, totalQuizAttempts, totalSimulationPlays, simulationCompletions] = await Promise.all([
      Certificate.countDocuments(),
      Certificate.countDocuments({ appreciationOptIn: true, appreciationText: { $exists: true, $ne: "" } }),
      Event.countDocuments(),
      QuizAttempt.countDocuments(), // Keep for reference but don't use for pass rate
      SimStat.countDocuments(),
      SimStat.countDocuments({ success: true }),
    ]);

    // Calculate percentages based on certificate types
    const quizParticipantRate = totalQuizCertificates > 0 ? Math.round((quizParticipant / totalQuizCertificates) * 100) : 0;
    const quizMeritRate = totalQuizCertificates > 0 ? Math.round((quizMerit / totalQuizCertificates) * 100) : 0;
    const quizTopperRate = totalQuizCertificates > 0 ? Math.round((quizTopper / totalQuizCertificates) * 100) : 0;
    const successRate = totalSimulationPlays > 0 ? Math.round((simulationCompletions / totalSimulationPlays) * 100) : 0;

    const result = {
      totalCertificates,
      totalAppreciations,
      totalEvents,
      totalQuizCertificates,
      quizParticipant,
      quizMerit,
      quizTopper,
      quizParticipantRate,
      quizMeritRate,
      quizTopperRate,
      totalQuizAttempts, // Keep for reference
      totalSimulationPlays,
      successRate,
    };

    // Cache the result
    setCache(CACHE_KEY, result, CACHE_TTL);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}



