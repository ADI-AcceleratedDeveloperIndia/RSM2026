import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const inputId = searchParams.get("organizerId");

    if (!inputId) {
      return NextResponse.json(
        { error: "Organizer ID or Event ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    
    let organizerId = inputId;
    
    // Check if input is an Event Reference ID (contains EVT)
    // If so, find the organizer ID from that event
    if (inputId.includes("EVT-")) {
      const event = await Event.findOne({ referenceId: inputId })
        .select("organizerId")
        .lean();
      
      if (!event) {
        return NextResponse.json(
          { error: "Event not found with the provided Event ID" },
          { status: 404 }
        );
      }
      
      organizerId = event.organizerId;
    }
    
    // Now find all events for this organizer
    const events = await Event.find({ organizerId })
      .sort({ createdAt: -1 })
      .select("referenceId title date location approved createdAt")
      .lean();

    return NextResponse.json({ 
      events,
      organizerId, // Return the actual organizer ID used
      searchedBy: inputId.includes("EVT-") ? "eventId" : "organizerId"
    });
  } catch (error: any) {
    console.error("Organizer events list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

