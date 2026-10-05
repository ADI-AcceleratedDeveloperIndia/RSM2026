import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Hazard from "@/models/Hazard";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district");

    const matchFilter: Record<string, any> = {};
    if (district && district !== "all") {
      matchFilter.district = district;
    }

    const [statusStats, categoryStats, severityStats, totalCount] = await Promise.all([
      Hazard.aggregate([
        { $match: matchFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Hazard.aggregate([
        { $match: matchFilter },
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]),
      Hazard.aggregate([
        { $match: matchFilter },
        { $group: { _id: "$severity", count: { $sum: 1 } } }
      ]),
      Hazard.countDocuments(matchFilter),
    ]);

    const statusCounts: Record<string, number> = {
      reported: 0,
      verified: 0,
      assigned: 0,
      in_progress: 0,
      resolved: 0,
      rejected: 0,
    };
    statusStats.forEach((s: { _id: string; count: number }) => {
      if (s._id) statusCounts[s._id] = s.count;
    });

    const categoryCounts: Record<string, number> = {};
    categoryStats.forEach((c: { _id: string; count: number }) => {
      if (c._id) categoryCounts[c._id] = c.count;
    });

    const severityCounts: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    severityStats.forEach((sv: { _id: string; count: number }) => {
      if (sv._id) severityCounts[sv._id] = sv.count;
    });

    const resolvedCount = statusCounts.resolved || 0;
    const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

    return NextResponse.json({
      total: totalCount,
      resolvedCount,
      resolutionRate,
      statusCounts,
      categoryCounts,
      severityCounts,
    });
  } catch (error) {
    console.error("Error fetching hazard stats:", error);
    return NextResponse.json({ error: "Failed to fetch hazard statistics" }, { status: 500 });
  }
}
