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
    console.warn("Daily reports list DB latency/disconnect, returning empty list:", error);
    return NextResponse.json({ reports: [] });
  }
}









