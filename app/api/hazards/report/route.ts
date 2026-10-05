import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Hazard from "@/models/Hazard";
import District from "@/models/District";
import { generateHazardId, getDistrictCode } from "@/lib/reference";

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
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  reportedBy: z.string().min(2, "Reporter name is required"),
  reporterContact: z.string().optional(),
  photos: z.array(z.string()).optional().default([]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = reportHazardSchema.parse(body);

    await connectDB();

    const districtCode = getDistrictCode(validated.district);
    const hazardId = generateHazardId(districtCode);

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
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("Error reporting hazard:", error);
    return NextResponse.json({ error: "Failed to submit hazard report" }, { status: 500 });
  }
}
