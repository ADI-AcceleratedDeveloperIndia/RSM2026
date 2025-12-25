import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DailyReport from "@/models/DailyReport";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const reports = await DailyReport.find()
      .sort({ date: -1 })
      .select("date stats createdAt")
      .lean();

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error("Daily reports list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily reports" },
      { status: 500 }
    );
  }
}

