import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";
import Event from "@/models/Event";
import { getEventFromMemory, getCertificatesForEventFromMemory } from "@/lib/organizerStore";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventReferenceId = searchParams.get("eventReferenceId") || searchParams.get("eventId");

    if (!eventReferenceId || !eventReferenceId.trim()) {
      return NextResponse.json(
        { error: "Event reference ID is required" },
        { status: 400 }
      );
    }

    const cleanId = eventReferenceId.trim();

    let event: any = getEventFromMemory(cleanId);
    let participants: any[] = [];

    try {
      await connectDB();

      // Verify event exists
      const dbEvent = await Event.findOne({ referenceId: cleanId }).lean();
      if (dbEvent) {
        event = dbEvent;
      }

      // Get all certificates linked to this event
      const certs = await Certificate.find({
        eventReferenceId: cleanId,
      })
        .sort({ createdAt: -1 })
        .select("certificateId fullName institution score total activityType createdAt participationContext eventType district organizerReferenceId eventReferenceId type")
        .lean();

      participants = certs.map((p: any) => ({
        certificateId: p.certificateId,
        name: p.fullName,
        institution: p.institution || event?.institution || "N/A",
        type: p.type || "PARTICIPANT",
        score: p.score,
        total: p.total,
        percentage: p.total > 0 ? Math.round((p.score / p.total) * 100) : 0,
        activityType: p.activityType,
        certificateDate: p.createdAt,
        participationContext: p.participationContext,
        eventType: p.eventType,
        district: p.district,
        eventReferenceId: p.eventReferenceId,
      }));
    } catch (dbError: any) {
      console.warn("MongoDB query error in events/participants:", dbError?.message);
    }

    // Merge in-memory certificates
    const memCerts = getCertificatesForEventFromMemory(cleanId);
    if (memCerts && memCerts.length > 0) {
      const existingCertIds = new Set(participants.map((p) => p.certificateId));
      for (const mc of memCerts) {
        if (!existingCertIds.has(mc.certificateId)) {
          participants.push({
            certificateId: mc.certificateId,
            name: mc.fullName,
            institution: mc.institution || event?.institution || "N/A",
            type: mc.type || "PARTICIPANT",
            score: mc.score,
            total: mc.total,
            percentage: mc.total > 0 ? Math.round((mc.score / mc.total) * 100) : 0,
            activityType: mc.activityType,
            certificateDate: mc.createdAt,
            participationContext: mc.participationContext,
            eventType: mc.eventType,
            district: mc.district,
            eventReferenceId: mc.eventReferenceId,
          });
        }
      }
    }

    if (!event && participants.length === 0) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      event: event ? {
        referenceId: event.referenceId,
        title: event.title,
        date: event.date,
        location: event.location,
        organizerName: event.organizerName,
        institution: event.institution,
        eventType: event.eventType,
      } : null,
      participants,
      totalParticipants: participants.length,
    });
  } catch (error: any) {
    console.error("Event participants fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event participants", participants: [], totalParticipants: 0 },
      { status: 200 }
    );
  }
}
