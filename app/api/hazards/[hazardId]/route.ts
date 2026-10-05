import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Hazard from "@/models/Hazard";
import Intervention from "@/models/Intervention";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ hazardId: string }> }
) {
  try {
    const { hazardId } = await params;
    await connectDB();

    const hazard = await Hazard.findOne({ hazardId }).lean();
    if (!hazard) {
      return NextResponse.json({ error: "Hazard not found" }, { status: 404 });
    }

    const interventions = await Intervention.find({ hazardId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ hazard, interventions });
  } catch (error) {
    console.error("Error fetching hazard:", error);
    return NextResponse.json({ error: "Failed to fetch hazard" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ hazardId: string }> }
) {
  try {
    const { hazardId } = await params;
    const body = await request.json();

    await connectDB();

    const updateFields: Record<string, any> = { updatedAt: new Date() };
    if (body.severity) updateFields.severity = body.severity;
    if (body.status) updateFields.status = body.status;
    if (body.location) updateFields.location = body.location;
    if (body.description) updateFields.description = body.description;

    const updated = await Hazard.findOneAndUpdate(
      { hazardId },
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Hazard not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, hazard: updated });
  } catch (error) {
    console.error("Error updating hazard:", error);
    return NextResponse.json({ error: "Failed to update hazard" }, { status: 500 });
  }
}
