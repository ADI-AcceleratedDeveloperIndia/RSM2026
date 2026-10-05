import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Hazard from "@/models/Hazard";
import Intervention from "@/models/Intervention";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ hazardId: string }> }
) {
  try {
    const { hazardId } = await params;
    const body = await request.json();
    const { resolvedBy, resolutionNotes, afterPhotos } = body;

    await connectDB();

    const hazard = await Hazard.findOne({ hazardId });
    if (!hazard) {
      return NextResponse.json({ error: "Hazard not found" }, { status: 404 });
    }

    hazard.status = "resolved";
    hazard.resolvedBy = resolvedBy || "Transport Department Officer";
    hazard.resolvedAt = new Date();
    hazard.resolutionNotes = resolutionNotes || "Hazard rectified.";
    if (afterPhotos && afterPhotos.length > 0) {
      hazard.afterPhotos = afterPhotos;
    }
    hazard.updatedAt = new Date();

    await hazard.save();

    // Mark linked intervention as completed if any
    if (hazard.interventionId) {
      await Intervention.updateOne(
        { interventionId: hazard.interventionId },
        {
          $set: {
            status: "completed",
            completionDate: new Date(),
            afterPhotos: afterPhotos || [],
            notes: resolutionNotes || "",
          }
        }
      );
    }

    return NextResponse.json({
      success: true,
      hazard,
    });
  } catch (error) {
    console.error("Error resolving hazard:", error);
    return NextResponse.json({ error: "Failed to resolve hazard" }, { status: 500 });
  }
}
