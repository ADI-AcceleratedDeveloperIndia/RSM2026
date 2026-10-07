import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Organizer from "@/models/Organizer";
import { getOrganizerFromMemory } from "@/lib/organizerStore";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const temporaryId = searchParams.get("temporaryId");

    if (!temporaryId || !temporaryId.trim()) {
      return NextResponse.json(
        { error: "Temporary ID is required" },
        { status: 400 }
      );
    }

    const cleanId = temporaryId.trim();

    // 1. Check in-memory store first
    let organizer: any = getOrganizerFromMemory(cleanId);

    // 2. Query MongoDB
    try {
      await connectDB();
      const dbOrg = await Organizer.findOne({
        $or: [
          { temporaryId: cleanId },
          { finalId: cleanId },
          { email: cleanId.toLowerCase() },
        ],
      }).lean();

      if (dbOrg) {
        organizer = dbOrg;
      }
    } catch (dbError: any) {
      console.warn("MongoDB unavailable during organizer status lookup, using memory store:", dbError?.message);
    }

    if (!organizer) {
      return NextResponse.json(
        { error: "Organizer not found. Please verify your reference ID." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: organizer.status || "pending",
      finalId: organizer.finalId || null,
      temporaryId: organizer.temporaryId || cleanId,
      fullName: organizer.fullName,
      institution: organizer.institution,
      district: organizer.district,
    });
  } catch (error: any) {
    console.error("Organizer status check error:", error);
    return NextResponse.json(
      { error: "Failed to check status. Please try again." },
      { status: 503 }
    );
  }
}
