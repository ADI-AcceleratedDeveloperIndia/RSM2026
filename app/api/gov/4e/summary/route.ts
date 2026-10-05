import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Action from "@/models/Action";
import Certificate from "@/models/Certificate";
import Hazard from "@/models/Hazard";
import Event from "@/models/Event";
import { FOUR_E_CATEGORIES } from "@/lib/fourE";

export async function GET() {
  try {
    await connectDB();

    const [actionStats, certStats, hazardStats, eventStats] = await Promise.all([
      Action.aggregate([
        { $group: { _id: "$fourECategory", count: { $sum: 1 }, beneficiaries: { $sum: "$actualBeneficiaries" } } }
      ]),
      Certificate.aggregate([
        { $group: { _id: "$fourECategory", count: { $sum: 1 } } }
      ]),
      Hazard.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Event.aggregate([
        { $group: { _id: "$fourECategory", count: { $sum: 1 } } }
      ]),
    ]);

    const actionMap: Record<string, { count: number; beneficiaries: number }> = {};
    actionStats.forEach((a) => {
      if (a._id) actionMap[a._id] = { count: a.count, beneficiaries: a.beneficiaries || 0 };
    });

    const certMap: Record<string, number> = {};
    certStats.forEach((c) => {
      if (c._id) certMap[c._id] = c.count;
    });

    const eventMap: Record<string, number> = {};
    eventStats.forEach((e) => {
      if (e._id) eventMap[e._id] = e.count;
    });

    const pillars = FOUR_E_CATEGORIES.map((cat) => {
      const act = actionMap[cat.id] || { count: 0, beneficiaries: 0 };
      const certs = certMap[cat.id] || 0;
      const events = eventMap[cat.id] || 0;

      return {
        id: cat.id,
        label: cat.label,
        description: cat.description,
        color: cat.color,
        actionsCount: act.count,
        beneficiaries: act.beneficiaries,
        certificates: certs,
        events: events,
        weight: 25,
      };
    });

    return NextResponse.json({
      pillars,
      summary: {
        totalPillars: 4,
        totalActions: actionStats.reduce((s, a) => s + a.count, 0),
        totalBeneficiaries: actionStats.reduce((s, a) => s + (a.beneficiaries || 0), 0),
      }
    });
  } catch (error) {
    console.error("4E summary error:", error);
    return NextResponse.json({ error: "Failed to fetch 4E summary" }, { status: 500 });
  }
}
