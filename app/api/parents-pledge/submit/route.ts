import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import ParentsPledge from "@/models/ParentsPledge";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";
import { savePledgeInMemory } from "@/lib/pledgeStore";

const pledgeSchema = z.object({
  childName: z.string().min(1),
  institutionName: z.string().min(1),
  parentName: z.string().min(1),
  district: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 15 pledges per hour per IP
    const clientId = getClientIdentifier(request);
    const limit = rateLimit(clientId, 15, 60 * 60 * 1000);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          resetTime: limit.resetTime,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "15",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": limit.resetTime.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const validated = pledgeSchema.parse(body);

    const childName = validated.childName.trim();
    const institutionName = validated.institutionName.trim();
    const parentName = validated.parentName.trim();
    const district = validated.district.trim();

    let pledgeId: string = `PLG-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Attempt to persist in MongoDB
    try {
      await connectDB();
      const pledge = await ParentsPledge.create({
        childName,
        institutionName,
        parentName,
        district,
      });
      if (pledge?._id) {
        pledgeId = pledge._id.toString();
      }
    } catch (dbError: any) {
      console.warn(
        "MongoDB unavailable for parents pledge submission, using resilient in-memory storage:",
        dbError?.message || dbError
      );
    }

    // Always cache in memory so certificate generation is instant and offline-resilient
    savePledgeInMemory({
      id: pledgeId,
      childName,
      institutionName,
      parentName,
      district,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      pledgeId,
    });
  } catch (error: any) {
    console.error("Pledge submission error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form data. Please fill all fields." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to submit pledge", details: error?.message || "Internal error" },
      { status: 500 }
    );
  }
}
