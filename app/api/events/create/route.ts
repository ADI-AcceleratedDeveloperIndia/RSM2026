import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import Organizer from "@/models/Organizer";
import { generateEventReferenceId } from "@/lib/reference";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";
import { saveEventInMemory, getOrganizerFromMemory } from "@/lib/organizerStore";

const createEventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  organizerId: z.string().min(1, "Organizer ID is required"),
  date: z.string().min(1, "Event date is required"),
  location: z.string().optional(),
  eventType: z.enum(["statewide", "regional"]),
  eventContext: z.enum(["online", "offline"]).optional(),
  district: z.string().optional(),
  photos: z.array(z.string()).optional(),
  institution: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 20 events per hour per IP
    const clientId = getClientIdentifier(request);
    const limit = rateLimit(clientId, 20, 60 * 60 * 1000);
    
    if (!limit.allowed) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Please try again later.",
          resetTime: limit.resetTime,
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": "20",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": limit.resetTime.toString(),
          },
        }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const validated = createEventSchema.parse(body);

    const cleanOrgId = validated.organizerId.trim();

    // Check organizer in memory or in DB
    let organizer: any = getOrganizerFromMemory(cleanOrgId);
    let dbConnected = false;

    try {
      await connectDB();
      dbConnected = true;

      const dbOrg = await Organizer.findOne({
        $or: [
          { finalId: cleanOrgId },
          { temporaryId: cleanOrgId },
          { email: cleanOrgId.toLowerCase() },
        ],
      }).lean();

      if (dbOrg) {
        organizer = dbOrg;
      }
    } catch (dbError: any) {
      console.warn("MongoDB unavailable during event creation organizer check:", dbError?.message);
    }

    if (!organizer) {
      return NextResponse.json(
        { error: "Organizer not found. Please register as an organizer or verify your Organizer ID." },
        { status: 403 }
      );
    }

    if (organizer.status === "rejected") {
      return NextResponse.json(
        { error: "Organizer registration was not approved. Cannot create events." },
        { status: 403 }
      );
    }

    // Determine district (use event input, or fallback to organizer's district)
    const effectiveDistrict = validated.district?.trim() || organizer.district || "Karimnagar";

    if (validated.eventType === "regional" && !effectiveDistrict) {
      return NextResponse.json(
        { error: "District is required for regional events" },
        { status: 400 }
      );
    }

    const eventContext = validated.eventContext || "offline";
    const isApproved = organizer.status === "approved";

    // Get next event number
    let nextEventNumber = 1;
    if (dbConnected) {
      try {
        const lastEvent = await Event.findOne().sort({ eventNumber: -1 });
        nextEventNumber = lastEvent ? lastEvent.eventNumber + 1 : 1;
      } catch (e) {
        nextEventNumber = Math.floor(Math.random() * 90000) + 10000;
      }
    } else {
      nextEventNumber = Math.floor(Math.random() * 90000) + 10000;
    }

    const referenceId = generateEventReferenceId(
      nextEventNumber,
      validated.eventType,
      effectiveDistrict,
      eventContext
    );

    const institutionName = validated.institution?.trim() || organizer.institution || "Road Safety Club";
    const locationName = validated.location?.trim() || effectiveDistrict || "Karimnagar";

    let savedId = referenceId;

    if (dbConnected) {
      try {
        const event = new Event({
          referenceId,
          eventNumber: nextEventNumber,
          title: validated.title.trim(),
          organizerId: organizer.finalId || organizer.temporaryId || cleanOrgId,
          organizerName: organizer.fullName,
          institution: institutionName,
          date: new Date(validated.date),
          location: locationName,
          eventType: validated.eventType,
          eventContext: eventContext,
          district: effectiveDistrict,
          approved: isApproved,
          photos: validated.photos || [],
          approvedAt: isApproved ? new Date() : undefined,
          approvedBy: isApproved ? "system" : undefined,
        });

        await event.save();
        savedId = event._id.toString();
      } catch (saveError: any) {
        console.warn("Database event save error, saving to memory fallback:", saveError?.message);
      }
    }

    // Always save to memory store for instant offline availability
    saveEventInMemory({
      referenceId,
      title: validated.title.trim(),
      date: validated.date,
      location: locationName,
      organizerId: organizer.finalId || organizer.temporaryId || cleanOrgId,
      organizerName: organizer.fullName,
      institution: institutionName,
      approved: isApproved,
      district: effectiveDistrict,
      eventType: validated.eventType,
      eventContext: eventContext,
      createdAt: new Date(),
      photos: validated.photos || [],
    });

    return NextResponse.json({
      success: true,
      eventId: savedId,
      referenceId,
      institution: institutionName,
      approved: isApproved,
      message: isApproved
        ? "Event created and officially published."
        : "Event created. Awaiting administrative review.",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation error" }, { status: 400 });
    }
    console.error("Event creation error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 400 });
  }
}
