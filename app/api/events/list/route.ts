import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Only return approved events
    const events = await Event.find({ approved: true })
      .sort({ date: -1 })
      .limit(100);

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("Events list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

