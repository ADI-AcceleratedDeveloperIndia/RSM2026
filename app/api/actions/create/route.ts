import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Action from "@/models/Action";
import District from "@/models/District";
import Institution from "@/models/Institution";
import { generateActionId, getDistrictCode } from "@/lib/reference";

const createActionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  fourECategory: z.enum(["education", "engineering", "enforcement", "emergency"]),
  actionType: z.enum(["individual", "institutional", "government"]).default("individual"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  submittedBy: z.string().min(2, "Name is required"),
  submittedByRole: z.string().default("citizen"),
  institutionId: z.string().optional(),
  district: z.string().min(1, "District is required"),
  targetDate: z.string().optional(),
  estimatedBeneficiaries: z.number().optional().default(1),
  eventReferenceId: z.string().optional(),
  hazardId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createActionSchema.parse(body);

    await connectDB();

    const districtCode = getDistrictCode(validated.district);
    const actionId = generateActionId(districtCode);

    const action = await Action.create({
      actionId,
      title: validated.title,
      description: validated.description || "",
      fourECategory: validated.fourECategory,
      actionType: validated.actionType,
      priority: validated.priority,
      status: "committed",
      submittedBy: validated.submittedBy,
      submittedByRole: validated.submittedByRole,
      institutionId: validated.institutionId || undefined,
      district: validated.district,
      targetDate: validated.targetDate ? new Date(validated.targetDate) : undefined,
      estimatedBeneficiaries: validated.estimatedBeneficiaries || 1,
      eventReferenceId: validated.eventReferenceId || undefined,
      hazardId: validated.hazardId || undefined,
    });

    // Update denormalized counters asynchronously
    District.updateOne({ code: districtCode }, { $inc: { totalActions: 1 } }).catch(() => {});
    if (validated.institutionId) {
      Institution.updateOne({ institutionId: validated.institutionId }, { $inc: { totalActions: 1 } }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      actionId: action.actionId,
      action,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("Error creating action:", error);
    return NextResponse.json({ error: "Failed to create action commitment" }, { status: 500 });
  }
}
