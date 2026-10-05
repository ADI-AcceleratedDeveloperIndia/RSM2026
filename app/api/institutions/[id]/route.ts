import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Institution from "@/models/Institution";
import Action from "@/models/Action";
import Event from "@/models/Event";
import Certificate from "@/models/Certificate";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const institution = await Institution.findOne({
      $or: [{ institutionId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }]
    }).lean();

    if (!institution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    // Load recent actions and events linked to this institution
    const [recentActions, recentEvents, participantCount] = await Promise.all([
      Action.find({
        $or: [
          { institutionId: institution.institutionId },
          { submittedBy: institution.name }
        ]
      }).sort({ createdAt: -1 }).limit(10).lean(),
      Event.find({ institution: institution.name }).sort({ date: -1 }).limit(10).lean(),
      Certificate.countDocuments({ institution: institution.name }),
    ]);

    return NextResponse.json({
      institution,
      metrics: {
        totalParticipants: participantCount,
        totalEvents: recentEvents.length,
        totalActions: recentActions.length,
      },
      recentActions,
      recentEvents,
    });
  } catch (error) {
    console.error("Error fetching institution:", error);
    return NextResponse.json({ error: "Failed to fetch institution" }, { status: 500 });
  }
}
