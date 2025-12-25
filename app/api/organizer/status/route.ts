import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Organizer from "@/models/Organizer";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const temporaryId = searchParams.get("temporaryId");

    if (!temporaryId) {
      return NextResponse.json(
        { error: "Temporary ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const organizer = await Organizer.findOne({ temporaryId });

    if (!organizer) {
      return NextResponse.json(
        { error: "Organizer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: organizer.status,
      finalId: organizer.finalId || null,
      fullName: organizer.fullName,
    });
  } catch (error: any) {
    console.error("Organizer status check error:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}


