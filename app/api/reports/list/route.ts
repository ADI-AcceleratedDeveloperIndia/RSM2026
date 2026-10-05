import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import GovernmentReport from "@/models/GovernmentReport";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");
    const district = searchParams.get("district");

    const query: Record<string, any> = {};
    if (scope && scope !== "all") query.scope = scope;
    if (district && district !== "all") query.districtName = district;

    const reports = await GovernmentReport.find(query).sort({ generatedAt: -1 }).lean();

    return NextResponse.json({
      reports,
      total: reports.length,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
