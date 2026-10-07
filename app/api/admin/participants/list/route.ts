import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = parseInt(searchParams.get("skip") || "0");
    const type = searchParams.get("type"); // "ORGANIZER", "PARTICIPANT", "MERIT", or null for all
    const activityType = searchParams.get("activityType"); // "basics", "simulation", etc.

    const query: any = {};
    if (type) {
      query.type = type;
    }
    if (activityType) {
      query.activityType = activityType;
    }

    const [participants, total] = await Promise.all([
      Certificate.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean(),
      Certificate.countDocuments(query),
    ]);

    return NextResponse.json({
      participants,
      total,
      limit,
      skip,
    });
  } catch (error: any) {
    console.warn("Admin participants list DB latency/disconnect, returning empty list:", error);
    return NextResponse.json({
      participants: [],
      total: 0,
      limit: 50,
      skip: 0,
    });
  }
}










