import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import { generateReferenceId } from "@/lib/reference";

const createEventSchema = z.object({
  title: z.string().min(1),
  organiserName: z.string().min(1),
  organiserRole: z.string().optional(),
  institution: z.string().optional(),
  date: z.string(),
  location: z.string().optional(),
  regionCode: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createEventSchema.parse(body);

    await connectDB();

    const referenceId = generateReferenceId("EVENT");

    const event = new Event({
      referenceId,
      ...validated,
      date: new Date(validated.date),
      approved: true,
    });

    await event.save();

    return NextResponse.json({ success: true, eventId: event._id, referenceId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Event creation error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}








