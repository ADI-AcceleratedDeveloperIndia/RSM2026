import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Institution from "@/models/Institution";
import Action from "@/models/Action";
import Event from "@/models/Event";
import Certificate from "@/models/Certificate";
import { getInstitutionFromMemory } from "@/lib/institutionStore";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = String(id).trim();

    let institution: any = getInstitutionFromMemory(cleanId);
    let recentActions: any[] = [];
    let recentEvents: any[] = [];
    let participantCount = 0;

    try {
      await connectDB();

      const query = cleanId.match(/^[0-9a-fA-F]{24}$/)
        ? { $or: [{ institutionId: cleanId }, { _id: cleanId }] }
        : { institutionId: cleanId };

      const dbInst = await Institution.findOne(query).lean();
      if (dbInst) {
        institution = dbInst;
      }

      if (institution) {
        const [actions, events, count] = await Promise.all([
          Action.find({
            $or: [
              { institutionId: institution.institutionId },
              { submittedBy: institution.name }
            ]
          }).sort({ createdAt: -1 }).limit(10).lean().catch(() => []),
          Event.find({ institution: institution.name }).sort({ date: -1 }).limit(10).lean().catch(() => []),
          Certificate.countDocuments({ institution: institution.name }).catch(() => 0),
        ]);
        recentActions = actions;
        recentEvents = events;
        participantCount = count;
      }
    } catch (dbErr: any) {
      console.warn("MongoDB unavailable during institution lookup, using memory record:", dbErr?.message);
    }

    if (!institution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

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
