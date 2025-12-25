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

    const [totalCertificates, totalAppreciations, totalEvents, totalQuizPasses, totalQuizAttempts, totalSimulationPlays, simulationCompletions] = await Promise.all([
      Certificate.countDocuments(),
      Certificate.countDocuments({ appreciationOptIn: true, appreciationText: { $exists: true, $ne: "" } }),
      Event.countDocuments(),
      QuizAttempt.countDocuments({ passed: true }),
      QuizAttempt.countDocuments(),
      SimStat.countDocuments(),
      SimStat.countDocuments({ success: true }),
    ]);

    const passRate = totalQuizAttempts > 0 ? Math.round((totalQuizPasses / totalQuizAttempts) * 100) : 0;
    const successRate = totalSimulationPlays > 0 ? Math.round((simulationCompletions / totalSimulationPlays) * 100) : 0;

    const result = {
      totalCertificates,
      totalAppreciations,
      totalEvents,
      totalQuizPasses,
      totalQuizAttempts,
      passRate,
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



