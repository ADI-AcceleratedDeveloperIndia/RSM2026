import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DistrictScorecard from "@/models/DistrictScorecard";

export async function GET() {
  try {
    await connectDB();

    const scorecards = await DistrictScorecard.find().sort({ rank: 1, overallScore: -1 }).lean();

    const totalDistricts = scorecards.length;
    const avgScore = totalDistricts > 0 
      ? Math.round(scorecards.reduce((sum, s) => sum + s.overallScore, 0) / totalDistricts)
      : 72;

    return NextResponse.json({
      scorecards,
      summary: {
        totalDistricts,
        avgScore,
        topDistrict: scorecards[0]?.districtName || "Hyderabad",
        lowestDistrict: scorecards[scorecards.length - 1]?.districtName || "Adilabad",
      }
    });
  } catch (error) {
    console.error("Error fetching scorecards:", error);
    return NextResponse.json({ error: "Failed to fetch scorecards" }, { status: 500 });
  }
}
