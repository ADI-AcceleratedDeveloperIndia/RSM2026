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
    } else {
      // No organizer reference ID - set default online event title based on activity type
      const activityEventTitles: Record<string, string> = {
        quiz: "Online Quiz Event",
        simulation: "Online Simulation Event",
        basics: "Online Basics Event",
        guides: "Online Safety Guides Event",
        prevention: "Online Prevention Event",
        online: "Online Road Safety Event",
      };
      eventTitle = activityEventTitles[validated.activityType] || "Online Road Safety Event";
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userIpHash = hashIp(ip);

    // Generate certificate with random number (avoids race conditions)
    // Format: KRMR-RSM-2026-PDL-RHL-TYPE-XXXXX (where XXXXX is random 5-digit number)
    let certificate;
    let certificateId: string | null = null;
    let attempts = 0;
    const maxAttempts = 5; // Retry if random number collides (very rare)
    
    while (attempts < maxAttempts) {
      try {
        // Generate certificate ID with random number (no need to query database)
        certificateId = generateCertificateNumber(validated.type); // No number = random
        
        // Extract the random number from the certificateId for storage
        const certNumMatch = certificateId.match(/-(\d{5})$/);
        const certificateNumber = certNumMatch ? parseInt(certNumMatch[1]) : Math.floor(Math.random() * 90000) + 10000;
        
        certificate = new Certificate({
          certificateId,
          certificateNumber: certificateNumber,
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
        break; // Success
      } catch (saveError: any) {
        // Check if it's a duplicate key error (E11000) - very rare with random numbers
        const isDuplicateKeyError = 
          saveError.code === 11000 || 
          saveError.message?.includes('duplicate key') ||
          saveError.message?.includes('E11000');
        
        if (isDuplicateKeyError && attempts < maxAttempts - 1) {
          attempts++;
          // Small random delay before retry with new random number
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
          continue;
        }
        
        // If not a duplicate key error or max attempts reached, throw
        console.error("Certificate creation error:", {
          error: saveError.message,
          code: saveError.code,
          name: saveError.name,
          attempts,
          type: validated.type,
          stack: saveError.stack
        });
        throw saveError;
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
      downloadUrl, 
      certificateId,
      eventTitle: eventTitle || null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Certificate validation error:", error.errors);
      return NextResponse.json({ 
        error: "Invalid certificate data",
        details: error.errors 
      }, { status: 400 });
    }
    
    // Log full error details for debugging
    console.error("Certificate creation error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    
    const errorMessage = error instanceof Error ? error.message : "Failed to create certificate";
    return NextResponse.json({ 
      error: errorMessage || "Failed to create certificate. Please try again." 
    }, { status: 500 });
  }
}



