import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";
import Event from "@/models/Event";
import QuizAttempt from "@/models/QuizAttempt";
import SimulationPlay from "@/models/SimulationPlay";
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
    }>(CACHE_KEY);
    
    if (cached) {
      return NextResponse.json(cached);
    }

    await connectDB();

    const [totalCertificates, totalAppreciations, totalEvents, totalQuizPasses, totalQuizAttempts, totalSimulationPlays] = await Promise.all([
      Certificate.countDocuments(),
      Certificate.countDocuments({ appreciationOptIn: true }),
      Event.countDocuments(),
      QuizAttempt.countDocuments({ passed: true }),
      QuizAttempt.countDocuments(),
      SimulationPlay.countDocuments(),
    ]);

    const passRate = totalQuizAttempts > 0 ? Math.round((totalQuizPasses / totalQuizAttempts) * 100) : 0;

    const result = {
      totalCertificates,
      totalAppreciations,
      totalEvents,
      totalQuizPasses,
      totalQuizAttempts,
      passRate,
      totalSimulationPlays,
    };

    // Cache the result
    setCache(CACHE_KEY, result, CACHE_TTL);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}



