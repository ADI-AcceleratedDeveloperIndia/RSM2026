import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";
import Event from "@/models/Event";
import { signCertificateUrl } from "@/lib/hmac";
import { hashIp } from "@/lib/utils";
import { generateCertificateNumber } from "@/lib/reference";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";

const createCertSchema = z.object({
  type: z.enum(["ORGANIZER", "PARTICIPANT", "MERIT"]),
  fullName: z.string().min(1),
  institution: z.string().optional(),
  score: z.number().min(0),
  total: z.number().min(1),
  activityType: z.enum(["basics", "simulation", "quiz", "guides", "prevention", "online"]),
  organizerReferenceId: z.string().optional(), // Optional organizer reference ID
  userEmail: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 certificates per hour per IP
    const clientId = getClientIdentifier(request);
    const limit = rateLimit(clientId, 10, 60 * 60 * 1000);
    
    if (!limit.allowed) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Please try again later.",
          resetTime: limit.resetTime,
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": limit.resetTime.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const validated = createCertSchema.parse(body);

    await connectDB();

    // If organizer reference ID is provided, validate it and get event details
    let eventReferenceId: string | undefined;
    let eventTitle: string | undefined;
    
    if (validated.organizerReferenceId) {
      // Validate organizer reference ID format (should be event reference ID)
      const event = await Event.findOne({ 
        referenceId: validated.organizerReferenceId,
        approved: true 
      });
      
      if (event) {
        eventReferenceId = event.referenceId;
        eventTitle = event.title;
      } else {
        return NextResponse.json(
          { error: "Invalid or unapproved organizer reference ID" },
          { status: 400 }
        );
      }
    }

    // Get next certificate number for this type
    const lastCert = await Certificate.findOne({ type: validated.type })
      .sort({ certificateNumber: -1 });
    const nextCertNumber = lastCert ? lastCert.certificateNumber + 1 : 1;

    if (nextCertNumber > 100000) {
      return NextResponse.json(
        { error: "Maximum certificate limit reached for this type" },
        { status: 400 }
      );
    }

    const certificateId = generateCertificateNumber(validated.type, nextCertNumber);
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userIpHash = hashIp(ip);

    const certificate = new Certificate({
      certificateId,
      certificateNumber: nextCertNumber,
      type: validated.type,
      fullName: validated.fullName,
      institution: validated.institution,
      score: validated.score,
      total: validated.total,
      activityType: validated.activityType,
      eventReferenceId: eventReferenceId,
      eventTitle: eventTitle,
      organizerReferenceId: validated.organizerReferenceId,
      userEmail: validated.userEmail,
      userIpHash,
    });

    await certificate.save();

    const sig = await signCertificateUrl(certificateId);
    const downloadUrl = `/api/certificates/download?cid=${certificateId}&sig=${sig}`;

    return NextResponse.json({ 
      downloadUrl, 
      certificateId,
      eventTitle: eventTitle || null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Certificate creation error:", error);
    return NextResponse.json({ error: "Failed to create certificate" }, { status: 500 });
  }
}



