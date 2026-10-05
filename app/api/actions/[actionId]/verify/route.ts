import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Action from "@/models/Action";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ actionId: string }> }
) {
  try {
    const { actionId } = await params;
    const body = await request.json();
    const { action: decision, verificationNotes, verifiedBy } = body;

    if (!decision || !["verify", "reject"].includes(decision)) {
      return NextResponse.json({ error: "Decision must be 'verify' or 'reject'" }, { status: 400 });
    }

    await connectDB();

    const existing = await Action.findOne({ actionId });
    if (!existing) {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    const isVerified = decision === "verify";
    const status = isVerified ? "verified" : "rejected";
    
    // Calculate simple impact score
    let impactScore = existing.impactScore || 0;
    if (isVerified) {
      const beneficiaries = existing.actualBeneficiaries || existing.estimatedBeneficiaries || 10;
      const priorityMultiplier = existing.priority === "critical" ? 1.5 : existing.priority === "high" ? 1.25 : 1.0;
      impactScore = Math.min(100, Math.round(Math.log10(beneficiaries + 1) * 25 * priorityMultiplier));
    }

    existing.status = status;
    existing.verifiedBy = verifiedBy || "Government Verifier";
    existing.verifiedAt = new Date();
    existing.verificationNotes = verificationNotes || "";
    existing.impactScore = impactScore;
    existing.updatedAt = new Date();

    await existing.save();

    return NextResponse.json({
      success: true,
      status,
      action: existing,
    });
  } catch (error) {
    console.error("Error verifying action:", error);
    return NextResponse.json({ error: "Failed to verify action" }, { status: 500 });
  }
}
