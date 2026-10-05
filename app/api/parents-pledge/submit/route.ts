import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import ParentsPledge from "@/models/ParentsPledge";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";

const pledgeSchema = z.object({
  childName: z.string().min(1),
  institutionName: z.string().min(1),
  parentName: z.string().min(1),
  district: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 pledges per hour per IP
    const clientId = getClientIdentifier(request);
    const limit = rateLimit(clientId, 5, 60 * 60 * 1000);
    
    if (!limit.allowed) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Please try again later.",
          resetTime: limit.resetTime,
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": limit.resetTime.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const validated = pledgeSchema.parse(body);

    await connectDB();

    const pledge = await ParentsPledge.create({
      childName: validated.childName.trim(),
      institutionName: validated.institutionName.trim(),
      parentName: validated.parentName.trim(),
      district: validated.district,
    });

    return NextResponse.json({
      success: true,
      pledgeId: pledge._id.toString(),
    });
  } catch (error: any) {
    console.error("Pledge submission error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to submit pledge" },
      { status: 500 }
    );
  }
}

