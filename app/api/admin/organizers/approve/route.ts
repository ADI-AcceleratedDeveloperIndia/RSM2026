import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Organizer from "@/models/Organizer";
import { generateFinalOrganizerId } from "@/lib/reference";

const approveSchema = z.object({
  temporaryId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = approveSchema.parse(body);

    await connectDB();

    const organizer = await Organizer.findOne({ temporaryId: validated.temporaryId });

    if (!organizer) {
      return NextResponse.json(
        { error: "Organizer not found" },
        { status: 404 }
      );
    }

    if (validated.action === "approve") {
      // Get next organizer number
      const lastOrganizer = await Organizer.findOne({ status: "approved" })
        .sort({ finalId: -1 });
      
      let organizerNumber = 1;
      if (lastOrganizer && lastOrganizer.finalId) {
        // Extract number from finalId: KRMR-RSM-2026-PDL-RHL-ORGANIZER-00001
        const match = lastOrganizer.finalId.match(/ORGANIZER-(\d+)$/);
        if (match) {
          organizerNumber = parseInt(match[1], 10) + 1;
        }
      }

      if (organizerNumber > 100000) {
        return NextResponse.json(
          { error: "Maximum organizer limit reached" },
          { status: 400 }
        );
      }

      const finalId = generateFinalOrganizerId(organizerNumber);

      organizer.status = "approved";
      organizer.finalId = finalId;
      organizer.approvedAt = new Date();
      organizer.approvedBy = "admin"; // TODO: Get from session
      organizer.updatedAt = new Date();

      await organizer.save();

      return NextResponse.json({
        success: true,
        finalId: organizer.finalId,
        organizer: {
          temporaryId: organizer.temporaryId,
          finalId: organizer.finalId,
          fullName: organizer.fullName,
          email: organizer.email,
          institution: organizer.institution,
          status: organizer.status,
        },
      });
    } else {
      // Reject
      organizer.status = "rejected";
      organizer.updatedAt = new Date();

      await organizer.save();

      return NextResponse.json({
        success: true,
        organizer: {
          temporaryId: organizer.temporaryId,
          fullName: organizer.fullName,
          email: organizer.email,
          status: organizer.status,
        },
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Organizer approval error:", error);
    return NextResponse.json(
      { error: "Failed to process organizer approval" },
      { status: 500 }
    );
  }
}


