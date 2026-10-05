import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import Organizer from "@/models/Organizer";
import { generateEventReferenceId } from "@/lib/reference";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";

const createEventSchema = z.object({
  title: z.string().min(1),
  organizerId: z.string().min(1), // Final organizer ID
  date: z.string(),
  location: z.string().optional(),
  eventType: z.enum(["statewide", "regional"]), // Event type: statewide or regional
  eventContext: z.enum(["online", "offline"]).optional(), // Event context: online or offline (defaults to online)
  district: z.string().optional(), // District name (required for regional events)
  photos: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 events per hour per IP
    const clientId = getClientIdentifier(request);
    const limit = rateLimit(clientId, 5, 60 * 60 * 1000);
    
    if (!limit.allowed) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Please try again later.",
          resetTime: limit.resetTime,
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": limit.resetTime.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const validated = createEventSchema.parse(body);

    await connectDB();

    // Verify organizer is approved
    const organizer = await Organizer.findOne({ 
      finalId: validated.organizerId,
      status: "approved" 
    });

    if (!organizer) {
      return NextResponse.json(
        { error: "Organizer not found or not approved" },
        { status: 403 }
      );
    }

    // Get next event number
    const lastEvent = await Event.findOne().sort({ eventNumber: -1 });
    const nextEventNumber = lastEvent ? lastEvent.eventNumber + 1 : 1;

    if (nextEventNumber > 100000) {
      return NextResponse.json(
        { error: "Maximum event limit reached" },
        { status: 400 }
      );
    }

    // For regional events, district is required
    if (validated.eventType === "regional" && !validated.district) {
      return NextResponse.json(
        { error: "District is required for regional events" },
        { status: 400 }
      );
    }

    // Determine event context: online (happens on website) or offline (physical event)
    const eventContext = validated.eventContext || "online"; // Default to online
    
    const referenceId = generateEventReferenceId(
      nextEventNumber, 
      validated.eventType,
      validated.district,
      eventContext // Use event context: online or offline
    );

    const event = new Event({
      referenceId,
      eventNumber: nextEventNumber,
      title: validated.title,
      organizerId: validated.organizerId,
      organizerName: organizer.fullName,
      institution: organizer.institution,
      date: new Date(validated.date),
      location: validated.location || "Karimnagar",
      eventType: validated.eventType, // Store event type: statewide or regional
      eventContext: eventContext, // Store event context: online or offline
      district: validated.district, // Store district for regional events
      approved: true, // Auto-approve events from approved organizers
      photos: validated.photos || [],
      approvedAt: new Date(),
      approvedBy: "system",
    });

    await event.save();

    return NextResponse.json({ 
      success: true, 
      eventId: event._id, 
      referenceId,
      message: "Event created. Awaiting admin approval."
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Event creation error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}








