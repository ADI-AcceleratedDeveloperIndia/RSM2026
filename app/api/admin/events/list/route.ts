import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const includePending = searchParams.get("includePending") === "true";

    const query: any = {};
    if (!includePending) {
      query.approved = true;
    }

    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .select("referenceId title date location organizerName institution approved createdAt")
      .lean();

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("Admin events list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}


