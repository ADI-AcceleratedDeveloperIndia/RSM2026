import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Hazard from "@/models/Hazard";
import Intervention from "@/models/Intervention";
import { generateInterventionId, getDistrictCode } from "@/lib/reference";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ hazardId: string }> }
) {
  try {
    const { hazardId } = await params;
    const body = await request.json();
    const { assignedTo, department, interventionTitle, budgetEstimate } = body;

    await connectDB();

    const hazard = await Hazard.findOne({ hazardId });
    if (!hazard) {
      return NextResponse.json({ error: "Hazard not found" }, { status: 404 });
    }

    hazard.status = "assigned";
    hazard.assignedTo = assignedTo || department || "Relevant Transport Authority";
    hazard.updatedAt = new Date();

    // Optionally create an intervention record
    let intervention = null;
    if (department) {
      const dCode = getDistrictCode(hazard.district);
      const interventionId = generateInterventionId(dCode);

      intervention = await Intervention.create({
        interventionId,
        title: interventionTitle || `Rectification of ${hazard.title}`,
        description: `Government intervention to address hazard ${hazard.hazardId} in ${hazard.district}.`,
        fourECategory: "engineering",
        hazardId: hazard.hazardId,
        district: hazard.district,
        department: department,
        officerInCharge: assignedTo || "",
        budgetEstimate: budgetEstimate || 0,
        status: "in_progress",
        startDate: new Date(),
      });

      hazard.interventionId = interventionId;
    }

    await hazard.save();

    return NextResponse.json({
      success: true,
      hazard,
      intervention,
    });
  } catch (error) {
    console.error("Error assigning hazard:", error);
    return NextResponse.json({ error: "Failed to assign hazard" }, { status: 500 });
  }
}
