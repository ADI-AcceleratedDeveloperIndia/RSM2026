import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizerId = searchParams.get("organizerId");

    if (!organizerId) {
      return NextResponse.json(
        { error: "Organizer ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Find all events for this organizer
    const events = await Event.find({ organizerId })
      .sort({ createdAt: -1 })
      .select("referenceId title date location approved createdAt")
      .lean();

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("Organizer events list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

