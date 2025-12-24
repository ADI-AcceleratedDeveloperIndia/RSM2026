import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";
import Event from "@/models/Event";
import QuizAttempt from "@/models/QuizAttempt";
import SimulationPlay from "@/models/SimulationPlay";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const [totalCertificates, totalAppreciations, totalEvents, totalQuizPasses, totalQuizAttempts, totalSimulationPlays] = await Promise.all([
      Certificate.countDocuments(),
      Certificate.countDocuments({ appreciationOptIn: true }),
      Event.countDocuments(),
      QuizAttempt.countDocuments({ passed: true }),
      QuizAttempt.countDocuments(),
      SimulationPlay.countDocuments(),
    ]);

    const passRate = totalQuizAttempts > 0 ? totalQuizPasses / totalQuizAttempts : 0;

    const districtAgg = await Certificate.aggregate([
      {
        $group: {
          _id: "$regionCode",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json({
      totalCertificates,
      totalAppreciations,
      totalEvents,
      totalQuizPasses,
      totalQuizAttempts,
      passRate,
      totalSimulationPlays,
      districts: districtAgg.map((d) => ({ key: d._id || "", count: d.count })),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}



