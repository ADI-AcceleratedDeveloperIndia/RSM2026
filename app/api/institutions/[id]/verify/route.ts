import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Institution from "@/models/Institution";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { verifiedBy } = body;

    await connectDB();

    const institution = await Institution.findOneAndUpdate(
      { $or: [{ institutionId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      {
        $set: {
          status: "verified",
          verifiedBy: verifiedBy || "Government Administrator",
          verifiedAt: new Date(),
          updatedAt: new Date(),
        }
      },
      { new: true }
    );

    if (!institution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, institution });
  } catch (error) {
    console.error("Error verifying institution:", error);
    return NextResponse.json({ error: "Failed to verify institution" }, { status: 500 });
  }
}
