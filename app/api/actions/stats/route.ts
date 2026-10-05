import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Action from "@/models/Action";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district");

    const matchFilter: Record<string, any> = {};
    if (district && district !== "all") {
      matchFilter.district = district;
    }

    const [statusStats, fourEStats, totals] = await Promise.all([
      Action.aggregate([
        { $match: matchFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Action.aggregate([
        { $match: matchFilter },
        { $group: { _id: "$fourECategory", count: { $sum: 1 } } }
      ]),
      Action.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            totalBeneficiaries: { $sum: "$actualBeneficiaries" },
            estimatedBeneficiaries: { $sum: "$estimatedBeneficiaries" },
          }
        }
      ]),
    ]);

    const statusCounts: Record<string, number> = {
      committed: 0,
      in_progress: 0,
      completed: 0,
      verified: 0,
      rejected: 0,
    };
    statusStats.forEach((s: { _id: string; count: number }) => {
      if (s._id) statusCounts[s._id] = s.count;
    });

    const fourECounts: Record<string, number> = {
      education: 0,
      engineering: 0,
      enforcement: 0,
      emergency: 0,
    };
    fourEStats.forEach((f: { _id: string; count: number }) => {
      if (f._id) fourECounts[f._id] = f.count;
    });

    const totalCount = totals[0]?.total || 0;
    const completedCount = statusCounts.completed + statusCounts.verified;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return NextResponse.json({
      total: totalCount,
      completedCount,
      completionRate,
      statusCounts,
      fourECounts,
      beneficiaries: {
        actual: totals[0]?.totalBeneficiaries || 0,
        estimated: totals[0]?.estimatedBeneficiaries || 0,
      }
    });
  } catch (error) {
    console.error("Error fetching action stats:", error);
    return NextResponse.json({ error: "Failed to fetch action statistics" }, { status: 500 });
  }
}
