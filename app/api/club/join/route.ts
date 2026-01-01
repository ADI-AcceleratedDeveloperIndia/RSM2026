import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Club from "@/models/Club";
import Organizer from "@/models/Organizer";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";

const clubSchema = z.object({
  institutionName: z.string().min(1),
  district: z.string().min(1),
  pointOfContact: z.string().min(1),
  organizerId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 club joins per hour per IP
    const clientId = getClientIdentifier(request);
    const limit = rateLimit(clientId, 3, 60 * 60 * 1000);
    
    if (!limit.allowed) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Please try again later.",
          resetTime: limit.resetTime,
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": "3",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": limit.resetTime.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const validated = clubSchema.parse(body);

    await connectDB();

    // Verify organizer ID exists and is approved
    const organizer = await Organizer.findOne({ 
      finalId: validated.organizerId.trim(),
      status: "approved" 
    });

    if (!organizer) {
      return NextResponse.json(
        { error: "Invalid or unapproved Organizer ID" },
        { status: 403 }
      );
    }

    // Check if already joined
    const existing = await Club.findOne({ 
      organizerId: validated.organizerId.trim() 
    });

    if (existing) {
      return NextResponse.json(
        { error: "This organizer has already joined the Club" },
        { status: 400 }
      );
    }

    const clubEntry = await Club.create({
      institutionName: validated.institutionName.trim(),
      district: validated.district,
      pointOfContact: validated.pointOfContact.trim(),
      organizerId: validated.organizerId.trim(),
    });

    return NextResponse.json({
      success: true,
      message: "Successfully joined the Club",
      clubId: clubEntry._id.toString(),
    });
  } catch (error: any) {
    console.error("Club join error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error?.message || "Failed to join club" },
      { status: 500 }
    );
  }
}

