import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Action from "@/models/Action";
import District from "@/models/District";
import Institution from "@/models/Institution";
import { generateActionId, getDistrictCode } from "@/lib/reference";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";

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
  targetDate: z
    .string()
    .optional()
    .refine((v) => !v || !isNaN(Date.parse(v)), { message: "Invalid target date format" }),
  estimatedBeneficiaries: z
    .union([z.number(), z.string().transform((v) => parseInt(v, 10))])
    .pipe(z.number().min(1))
    .optional()
    .default(1),
  eventReferenceId: z.string().optional(),
  hazardId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // Rate limiting: 20 action commitments per hour per IP
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
    const validated = createActionSchema.parse(body);

    const districtCode = getDistrictCode(validated.district);
    const actionId = generateActionId(districtCode);

    try {
      await connectDB();

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
    } catch (dbError: any) {
      console.error("Database error while creating action:", dbError);
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
    console.error("Error creating action:", error);
    return NextResponse.json({ error: "Failed to create action commitment" }, { status: 500 });
  }
}
