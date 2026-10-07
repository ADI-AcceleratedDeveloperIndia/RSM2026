import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";
import Event from "@/models/Event";
import { signCertificateUrl } from "@/lib/hmac";
import { hashIp } from "@/lib/utils";
import { generateCertificateNumber, getDistrictFromEventId } from "@/lib/reference";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";
import { getEventFromMemory, saveCertificateInMemory } from "@/lib/organizerStore";

const createCertSchema = z.object({
  type: z.enum(["ORGANIZER", "PARTICIPANT", "MERIT"]),
  fullName: z.string().min(1),
  institution: z.string().optional(),
  score: z.union([z.number(), z.string().transform((v) => Number(v))]).pipe(z.number().min(0)),
  total: z.union([z.number(), z.string().transform((v) => Number(v))]).pipe(z.number().min(1)),
  activityType: z.string().min(1),
  organizerReferenceId: z.string().optional(),
  organizerId: z.string().optional(),
  userEmail: z.string().email().optional().or(z.literal("")),
  participationContext: z.enum(["online", "offline"]).optional(),
  district: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 30 certificates per hour per IP
    const clientId = getClientIdentifier(request);
    const limit = rateLimit(clientId, 30, 60 * 60 * 1000);
    
    if (!limit.allowed) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Please try again later.",
          resetTime: limit.resetTime,
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": "30",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": limit.resetTime.toString(),
          },
        }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const validated = createCertSchema.parse(body);

    let dbConnected = false;
    try {
      await connectDB();
      dbConnected = true;
    } catch (dbErr: any) {
      console.warn("MongoDB unavailable during certificate creation, using resilient in-memory storage:", dbErr?.message);
    }

    let eventReferenceId: string | undefined;
    let eventTitle: string | undefined;
    let eventType: string | undefined;
    let eventContext: string | undefined;
    let eventInstitution: string | undefined;
    let finalDistrict = validated.district;
    let eventIdUsed = false;
    
    if (validated.organizerReferenceId) {
      const cleanRef = validated.organizerReferenceId.trim();
      let event: any = null;

      if (dbConnected) {
        try {
          event = await Event.findOne({ 
            referenceId: cleanRef 
          }).lean();
        } catch (eventError: any) {
          console.warn(`Event validation query failed for ${cleanRef}:`, eventError?.message);
        }
      }

      if (!event) {
        const memEvent = getEventFromMemory(cleanRef);
        if (memEvent) {
          event = memEvent;
        }
      }

      if (event) {
        if (!validated.organizerId || event.organizerId === validated.organizerId) {
          eventReferenceId = event.referenceId;
          eventTitle = event.title;
          eventType = event.eventType;
          eventContext = event.eventContext || "online";
          if (event.institution) eventInstitution = event.institution;
          if (event.district) finalDistrict = event.district;
          eventIdUsed = true;
        } else {
          console.warn(`Organizer ID mismatch for event ${cleanRef}. Proceeding without event linkage.`);
        }
      } else {
        console.warn(`Event not found or not approved: ${cleanRef}. Proceeding without event ID.`);
      }
    }

    const participationContext: "online" | "offline" = 
      (eventContext === "online" || eventContext === "offline") ? eventContext :
      (validated.participationContext === "online" || validated.participationContext === "offline") ? validated.participationContext :
      "online";

    if (participationContext === "offline" && !eventIdUsed) {
      return NextResponse.json(
        { error: "Offline participation requires a valid Event ID" },
        { status: 400 }
      );
    }

    // Auto-extract district from event reference ID if needed
    if (!finalDistrict && eventReferenceId) {
      const distFromId = getDistrictFromEventId(eventReferenceId);
      if (distFromId) finalDistrict = distFromId;
    }
    
    if (eventType === "regional" && !finalDistrict) {
      return NextResponse.json(
        { error: "District is required for regional events" },
        { status: 400 }
      );
    }
    
    if (!eventIdUsed) {
      const activityEventTitles: Record<string, string> = {
        quiz: "Online Quiz",
        simulation: "Online Simulation",
        basics: "Online Basics",
        guides: "Online Safety Guides",
        prevention: "Online Prevention",
        online: "Online Road Safety Event",
      };
      const activityTypeLower = validated.activityType.toLowerCase();
      eventTitle = activityEventTitles[activityTypeLower] || `Online ${validated.activityType.charAt(0).toUpperCase() + validated.activityType.slice(1)}`;
      eventReferenceId = undefined;
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userIpHash = hashIp(ip);

    let certificate: any = null;
    let certificateId: string | null = null;
    let attempts = 0;
    const maxAttempts = 5;
    
    const assignedInstitution = validated.institution?.trim() || eventInstitution || undefined;

    while (attempts < maxAttempts) {
      try {
        certificateId = generateCertificateNumber(
          validated.type, 
          undefined, 
          (eventType === "statewide" || eventType === "regional" ? eventType : null) as "statewide" | "regional" | null | undefined, 
          eventReferenceId,
          finalDistrict || null,
          participationContext
        );
        
        const certNumMatch = certificateId.match(/-(ON|OF)-(\d{5})$/);
        const certificateNumber = certNumMatch ? parseInt(certNumMatch[2]) : Math.floor(Math.random() * 90000) + 10000;
        
        if (dbConnected) {
          try {
            const dbCert = new Certificate({
              certificateId,
              certificateNumber: certificateNumber,
              type: validated.type,
              fullName: validated.fullName,
              institution: assignedInstitution,
              score: validated.score,
              total: validated.total,
              activityType: validated.activityType,
              eventReferenceId: eventReferenceId,
              eventTitle: eventTitle,
              organizerReferenceId: validated.organizerReferenceId,
              participationContext: participationContext,
              eventType: eventType,
              district: finalDistrict || undefined,
              userEmail: validated.userEmail,
              userIpHash,
            });

            await dbCert.save();
          } catch (dbSaveErr: any) {
            console.warn("Database certificate save warning, relying on memory cache:", dbSaveErr?.message);
          }
        }

        // Cache in memory for instant offline availability
        saveCertificateInMemory({
          certificateId,
          type: validated.type,
          fullName: validated.fullName,
          institution: assignedInstitution,
          score: validated.score,
          total: validated.total,
          activityType: validated.activityType,
          eventReferenceId: eventReferenceId,
          eventTitle: eventTitle,
          organizerReferenceId: validated.organizerReferenceId,
          participationContext: participationContext,
          eventType: eventType,
          district: finalDistrict || undefined,
          userEmail: validated.userEmail,
          createdAt: new Date(),
        });

        certificate = { certificateId };
        break;
      } catch (saveError: any) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw saveError;
        }
      }
    }

    if (!certificate || !certificateId) {
      return NextResponse.json(
        { error: "Failed to create certificate. Please try again." },
        { status: 500 }
      );
    }

    const sig = await signCertificateUrl(certificateId);
    const downloadUrl = `/api/certificates/download?cid=${certificateId}&sig=${sig}`;

    return NextResponse.json({ 
      success: true,
      downloadUrl, 
      certificateId,
      institution: assignedInstitution,
      eventTitle: eventTitle || null,
      eventType: eventType || null,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: error.errors[0]?.message || "Invalid certificate data",
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error("Certificate creation error:", error);
    return NextResponse.json({ 
      error: error?.message || "Failed to create certificate. Please try again." 
    }, { status: 400 });
  }
}
