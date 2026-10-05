import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SimStat from "@/models/SimStat";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const [totalSessions, totalCompletions, categoryStats, scenarioStats, avgTime] = await Promise.all([
      SimStat.countDocuments(),
      SimStat.countDocuments({ success: true }),
      SimStat.aggregate([
        {
          $group: {
            _id: "$category",
            total: { $sum: 1 },
            successful: { $sum: { $cond: ["$success", 1, 0] } },
          },
        },
      ]),
      SimStat.aggregate([
        {
          $group: {
            _id: "$sceneId",
            total: { $sum: 1 },
            failed: { $sum: { $cond: ["$success", 0, 1] } },
          },
        },
        { $sort: { failed: -1 } },
        { $limit: 5 },
      ]),
      SimStat.aggregate([
        {
          $group: {
            _id: null,
            avgSeconds: { $avg: "$seconds" },
          },
        },
      ]),
    ]);

    const successRate = totalSessions > 0 ? totalCompletions / totalSessions : 0;
    const avgTimeSeconds = avgTime[0]?.avgSeconds || 0;

    return NextResponse.json({
      totalSessions,
      totalCompletions,
      successRate,
      categoryStats: categoryStats.map((c) => ({
        category: c._id,
        total: c.total,
        successful: c.successful,
      })),
      topFailedScenarios: scenarioStats.map((s) => ({
        sceneId: s._id,
        total: s.total,
        failed: s.failed,
      })),
      avgTimeSeconds: Math.round(avgTimeSeconds),
    });
  } catch (error) {
    console.error("Sim stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}






