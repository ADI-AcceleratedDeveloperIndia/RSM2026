import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import Certificate from "@/models/Certificate";
import { getEventFromMemory } from "@/lib/organizerStore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    if (!eventId || !eventId.trim()) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const cleanId = eventId.trim();

    // 1. Check memory store fallback
    let event: any = getEventFromMemory(cleanId);
    let totalParticipants = 0;

    // 2. Query MongoDB
    try {
      await connectDB();
      const query = mongoose.Types.ObjectId.isValid(cleanId)
        ? { $or: [{ referenceId: cleanId }, { _id: cleanId }] }
        : { referenceId: cleanId };

      const dbEvent = (await Event.findOne(query)
        .select("referenceId title date location organizerName institution approved groupPhoto youtubeVideos organizerId eventType eventContext district createdAt")
        .lean()) as any;

      if (dbEvent) {
        event = dbEvent;
        // Count participants
        try {
          totalParticipants = await Certificate.countDocuments({
            eventReferenceId: dbEvent.referenceId,
          });
        } catch (cErr) {
          totalParticipants = 0;
        }
      }
    } catch (dbError: any) {
      console.warn("MongoDB unavailable during event lookup, using memory store:", dbError?.message);
    }

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      event: {
        ...event,
        totalParticipants,
      },
    });
  } catch (error: any) {
    console.error("Get event error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event details. Please try again." },
      { status: 503 }
    );
  }
}
