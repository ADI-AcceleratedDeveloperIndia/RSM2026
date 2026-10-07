import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Hazard from "@/models/Hazard";
import District from "@/models/District";
import { generateHazardId, getDistrictCode } from "@/lib/reference";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";

const reportHazardSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  category: z.enum([
    "pothole", "missing_sign", "broken_signal", "poor_visibility",
    "dangerous_curve", "no_footpath", "no_divider", "flooding",
    "encroachment", "other"
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  district: z.string().min(1, "District is required"),
  location: z.string().min(2, "Specific location / landmark is required"),
  latitude: z
    .union([z.number(), z.string().transform((v) => parseFloat(v))])
    .optional()
    .refine((v) => v === undefined || (!isNaN(v) && v >= -90 && v <= 90), {
      message: "Latitude must be between -90 and 90",
    }),
  longitude: z
    .union([z.number(), z.string().transform((v) => parseFloat(v))])
    .optional()
    .refine((v) => v === undefined || (!isNaN(v) && v >= -180 && v <= 180), {
      message: "Longitude must be between -180 and 180",
    }),
  reportedBy: z.string().min(2, "Reporter name is required"),
  reporterContact: z.string().optional(),
  photos: z
    .array(z.string().trim())
    .optional()
    .default([])
    .transform((list) => list.filter(Boolean).slice(0, 5)),
});

export async function POST(request: Request) {
  try {
    // Rate limiting: 20 hazard reports per hour per IP
    const clientId = getClientIdentifier(request);
    const limit = rateLimit(clientId, 20, 60 * 60 * 1000);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          resetTime: limit.resetTime,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "20",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": limit.resetTime.toString(),
          },
        }
      );
    }

    const body = await request.json();
    const validated = reportHazardSchema.parse(body);

    const districtCode = getDistrictCode(validated.district);
    const hazardId = generateHazardId(districtCode);

    try {
      await connectDB();

      const hazard = await Hazard.create({
        hazardId,
        title: validated.title,
        description: validated.description,
        category: validated.category,
        severity: validated.severity,
        status: "reported",
        district: validated.district,
        location: validated.location,
        latitude: validated.latitude,
        longitude: validated.longitude,
        reportedBy: validated.reportedBy,
        reporterContact: validated.reporterContact || "",
        photos: validated.photos,
        beforePhotos: validated.photos,
      });

      District.updateOne({ code: districtCode }, { $inc: { totalHazards: 1 } }).catch(() => {});

      return NextResponse.json({
        success: true,
        hazardId: hazard.hazardId,
        hazard,
      });
    } catch (dbError: any) {
      console.error("Database error while reporting hazard:", dbError);
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
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("Error reporting hazard:", error);
    return NextResponse.json({ error: "Failed to submit hazard report" }, { status: 500 });
  }
}
