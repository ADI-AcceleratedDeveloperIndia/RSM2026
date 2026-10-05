import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Action from "@/models/Action";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ actionId: string }> }
) {
  try {
    const { actionId } = await params;
    await connectDB();

    const action = await Action.findOne({ actionId }).lean();
    if (!action) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    return NextResponse.json({ action });
  } catch (error) {
    console.error("Error fetching action:", error);
    return NextResponse.json({ error: "Failed to fetch action" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ actionId: string }> }
) {
  try {
    const { actionId } = await params;
    const body = await request.json();

    await connectDB();

    const updateFields: Record<string, any> = { updatedAt: new Date() };

    if (body.status) updateFields.status = body.status;
    if (body.description !== undefined) updateFields.description = body.description;
    if (body.actualBeneficiaries !== undefined) updateFields.actualBeneficiaries = body.actualBeneficiaries;
    if (body.completedDate) updateFields.completedDate = new Date(body.completedDate);
    if (body.status === "completed" && !body.completedDate) updateFields.completedDate = new Date();
    
    // Add evidence item if supplied
    const updateOps: Record<string, any> = { $set: updateFields };
    if (body.evidenceItem) {
      updateOps.$push = { evidence: body.evidenceItem };
    }

    const updatedAction = await Action.findOneAndUpdate(
      { actionId },
      updateOps,
      { new: true }
    );

    if (!updatedAction) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, action: updatedAction });
  } catch (error) {
    console.error("Error updating action:", error);
    return NextResponse.json({ error: "Failed to update action" }, { status: 500 });
  }
}
