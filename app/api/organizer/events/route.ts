import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import Organizer from "@/models/Organizer";
import { getEventsForOrganizerFromMemory } from "@/lib/organizerStore";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizerId = searchParams.get("organizerId");

    if (!organizerId || !organizerId.trim()) {
      return NextResponse.json(
        { error: "Organizer ID is required" },
        { status: 400 }
      );
    }

    const cleanId = organizerId.trim();
    const queryIds = [cleanId];

    // Check memory store events first
    const memoryEvents = getEventsForOrganizerFromMemory(cleanId);

    try {
      await connectDB();

      // Look up organizer to expand query IDs (both finalId and temporaryId)
      const organizer = (await Organizer.findOne({
        $or: [
          { finalId: cleanId },
          { temporaryId: cleanId },
          { email: cleanId.toLowerCase() },
        ],
      }).lean()) as any;

      if (organizer) {
        if (organizer.finalId && !queryIds.includes(organizer.finalId)) queryIds.push(organizer.finalId);
        if (organizer.temporaryId && !queryIds.includes(organizer.temporaryId)) queryIds.push(organizer.temporaryId);
      }

      // Find all events for any of this organizer's IDs
      const dbEvents = await Event.find({ organizerId: { $in: queryIds } })
        .sort({ createdAt: -1 })
        .select("referenceId title date location approved createdAt eventType eventContext district institution")
        .lean();

      // Merge memory and db events without duplicates
      const seen = new Set<string>();
      const combined: any[] = [];

      for (const e of dbEvents) {
        seen.add(e.referenceId);
        combined.push(e);
      }
      for (const e of memoryEvents) {
        if (!seen.has(e.referenceId)) {
          seen.add(e.referenceId);
          combined.push(e);
        }
      }

      return NextResponse.json({ events: combined });
    } catch (dbError: any) {
      console.warn("MongoDB unavailable during organizer events fetch, returning in-memory events:", dbError?.message);
      return NextResponse.json({ events: memoryEvents });
    }
  } catch (error: any) {
    console.error("Organizer events list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events", events: [] },
      { status: 200 }
    );
  }
}
