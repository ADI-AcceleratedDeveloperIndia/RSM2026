import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";
import Event from "@/models/Event";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventReferenceId = searchParams.get("eventReferenceId");

    if (!eventReferenceId) {
      return NextResponse.json(
        { error: "Event reference ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify event exists
    const event = await Event.findOne({ referenceId: eventReferenceId });
    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Get all certificates linked to this event
    const participants = await Certificate.find({
      eventReferenceId: eventReferenceId,
    })
      .sort({ createdAt: -1 })
      .select("certificateId fullName institution score total activityType createdAt")
      .lean();

    return NextResponse.json({
      event: {
        referenceId: event.referenceId,
        title: event.title,
        date: event.date,
        location: event.location,
        organizerName: event.organizerName,
      },
      participants: participants.map((p) => ({
        certificateId: p.certificateId,
        name: p.fullName,
        institution: p.institution || "N/A",
        score: p.score,
        total: p.total,
        percentage: p.total > 0 ? Math.round((p.score / p.total) * 100) : 0,
        activityType: p.activityType,
        certificateDate: p.createdAt,
      })),
      totalParticipants: participants.length,
    });
  } catch (error: any) {
    console.error("Event participants error:", error);
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 }
    );
  }
}








