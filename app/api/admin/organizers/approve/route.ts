import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Organizer from "@/models/Organizer";
import { generateFinalOrganizerId, getDistrictCode } from "@/lib/reference";

const approveSchema = z.object({
  temporaryId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = approveSchema.parse(body);

    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role || "district_admin";
    const userDistrict = (session?.user as any)?.district;
    const userEmail = session?.user?.email || "dto.official@stategov.in";

    await connectDB();

    const organizer = await Organizer.findOne({ temporaryId: validated.temporaryId });

    if (!organizer) {
      return NextResponse.json(
        { error: "Organizer not found" },
        { status: 404 }
      );
    }

    // Role-based authorization:
    // If user is a district_admin, ensure they only manage organizers from their district (if district is defined)
    if (userRole === "district_admin" && userDistrict && organizer.districtCode) {
      const orgDistCode = organizer.districtCode.toUpperCase();
      const userDistCode = getDistrictCode(userDistrict).toUpperCase();
      if (orgDistCode !== userDistCode && !userDistrict.toLowerCase().includes(organizer.districtCode.toLowerCase())) {
        return NextResponse.json(
          { error: `Unauthorized: DTO ${userDistrict} can only approve organizers registered in ${userDistrict}.` },
          { status: 403 }
        );
      }
    }

    if (validated.action === "approve") {
      // Get next organizer number
      const lastOrganizer = await Organizer.findOne({ status: "approved" })
        .sort({ finalId: -1 });
      
      let organizerNumber = 1;
      if (lastOrganizer && lastOrganizer.finalId) {
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

      const districtCode = organizer.districtCode || (userDistrict ? getDistrictCode(userDistrict) : "HYDR");
      const finalId = generateFinalOrganizerId(organizerNumber, districtCode);

      organizer.status = "approved";
      organizer.finalId = finalId;
      organizer.approvedAt = new Date();
      organizer.approvedBy = `${userRole}:${userEmail}`;
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
          approvedBy: organizer.approvedBy,
        },
      });
    } else {
      // Reject
      organizer.status = "rejected";
      organizer.updatedAt = new Date();
      organizer.approvedBy = `${userRole}:${userEmail}`;

      await organizer.save();

      return NextResponse.json({
        success: true,
        organizer: {
          temporaryId: organizer.temporaryId,
          fullName: organizer.fullName,
          email: organizer.email,
          status: organizer.status,
          approvedBy: organizer.approvedBy,
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
