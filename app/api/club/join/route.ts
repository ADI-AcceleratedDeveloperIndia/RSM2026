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

    const organizerIdClean = validated.organizerId.trim();

    try {
      await connectDB();

      // Check if organizer ID exists (case-insensitive check for finalId or temporaryId)
      const anyOrganizer = await Organizer.findOne({
        $or: [
          { finalId: { $regex: new RegExp(`^${organizerIdClean}$`, "i") } },
          { temporaryId: { $regex: new RegExp(`^${organizerIdClean}$`, "i") } },
        ],
      });

      if (!anyOrganizer) {
        return NextResponse.json(
          { error: "Organizer ID not found. Please verify your ID or register as an organizer." },
          { status: 404 }
        );
      }

      if (anyOrganizer.status !== "approved") {
        return NextResponse.json(
          { error: "Organizer registration is still pending approval. Please wait for approval before joining the Club." },
          { status: 403 }
        );
      }

      // Check if already joined
      const existing = await Club.findOne({ 
        $or: [
          { organizerId: organizerIdClean },
          ...(anyOrganizer.finalId ? [{ organizerId: anyOrganizer.finalId }] : []),
          ...(anyOrganizer.temporaryId ? [{ organizerId: anyOrganizer.temporaryId }] : []),
        ]
      });

      if (existing) {
        return NextResponse.json(
          { error: "This institution/organizer has already joined the Road Safety Club." },
          { status: 400 }
        );
      }

      const clubEntry = await Club.create({
        institutionName: validated.institutionName.trim(),
        district: validated.district,
        pointOfContact: validated.pointOfContact.trim(),
        organizerId: anyOrganizer.finalId || organizerIdClean,
      });

      return NextResponse.json({
        success: true,
        message: "Successfully joined the Road Safety Club",
        clubId: clubEntry._id.toString(),
      });
    } catch (dbError: any) {
      console.error("Database error while joining club:", dbError);
      return NextResponse.json(
        {
          error: "Database service is temporarily unavailable. Please try again shortly.",
          details: dbError?.message || "DB connection error",
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form data. Please check all required fields." },
        { status: 400 }
      );
    }
    console.error("Club join error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to join club" },
      { status: 500 }
    );
  }
}

