import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import GovernmentReport from "@/models/GovernmentReport";
import Certificate from "@/models/Certificate";
import Event from "@/models/Event";
import Action from "@/models/Action";
import Hazard from "@/models/Hazard";
import Institution from "@/models/Institution";
import DistrictScorecard from "@/models/DistrictScorecard";
import { generateReportId, getDistrictCode } from "@/lib/reference";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const { scope = "statewide", districtName, generatedBy = "Mission Control Administrator" } = body;

    const filter: Record<string, any> = {};
    if (scope === "district" && districtName) {
      filter.district = districtName;
    }

    const [
      totalCertificates,
      totalEvents,
      actionStats,
      hazardStats,
      totalInstitutions,
      topScorecards,
    ] = await Promise.all([
      Certificate.countDocuments(filter),
      Event.countDocuments({ approved: true, ...filter }),
      Action.aggregate([
        ...(filter.district ? [{ $match: { district: filter.district } }] : []),
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            beneficiaries: { $sum: "$actualBeneficiaries" }
          }
        }
      ]),
      Hazard.aggregate([
        ...(filter.district ? [{ $match: { district: filter.district } }] : []),
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Institution.countDocuments(filter),
      DistrictScorecard.find().sort({ rank: 1 }).limit(5).lean(),
    ]);

    const actCounts: Record<string, number> = {};
    actionStats.forEach((a) => { if (a._id) actCounts[a._id] = a.count; });

    const hzdCounts: Record<string, number> = {};
    hazardStats.forEach((h) => { if (h._id) hzdCounts[h._id] = h.count; });

    const totalHazards = Object.values(hzdCounts).reduce((a, b) => a + b, 0);
    const resolvedHazards = hzdCounts.resolved || 0;
    const rectificationRate = totalHazards > 0 ? Math.round((resolvedHazards / totalHazards) * 100) : 100;

    const committedActions = actCounts.committed || 0;
    const completedActions = (actCounts.completed || 0) + (actCounts.verified || 0);
    const verifiedActions = actCounts.verified || 0;

    const reportCode = scope === "district" && districtName ? getDistrictCode(districtName) : "SG";
    const reportId = generateReportId(reportCode);

    const title = scope === "district"
      ? `${districtName} District Road Safety Month 2027 — Impact & Action Report`
      : `Statewide Road Safety Month 2027 — Official Government Impact Dossier`;

    const executiveSummary = `This executive report documents the outcomes of Road Safety Month 2027 across ${scope === "district" ? districtName : "the State"}. During the campaign period, a total of ${totalCertificates.toLocaleString()} participants engaged through official educational assessments and mass safety pledges. Across the 4E pillars, ${completedActions.toLocaleString()} concrete safety actions were executed, and ${resolvedHazards.toLocaleString()} road hazards were rectified with photographic evidence, reflecting a rectification rate of ${rectificationRate}%. A total of ${totalInstitutions.toLocaleString()} educational institutions established active Road Safety Clubs.`;

    const report = await GovernmentReport.create({
      reportId,
      title,
      scope,
      districtCode: scope === "district" ? reportCode : undefined,
      districtName: scope === "district" ? districtName : undefined,
      generatedBy,
      executiveSummary,
      fourEAnalysis: {
        education: {
          totalInitiatives: totalEvents,
          participantsReached: totalCertificates,
          institutionsEngaged: totalInstitutions,
          highlights: [
            "Mandatory road sign literacy curriculum completed by student drivers",
            "Interactive physics-based braking simulation deployed statewide",
          ],
        },
        engineering: {
          blackspotsIdentified: totalHazards,
          potholesFixed: resolvedHazards,
          rectificationsCompleted: resolvedHazards,
          highlights: [
            "Pothole rectification blitz in high-density school zones",
            "Reflective cautionary sign installations at blind intersections",
          ],
        },
        enforcement: {
          complianceDrives: 24,
          helmetCheckpoints: 52,
          highlights: [
            "Strict pillion rider helmet compliance drive",
            "Zero-tolerance speed monitoring drives near educational campuses",
          ],
        },
        emergency: {
          firstAidTrained: Math.round(totalCertificates * 0.15),
          drillsConducted: 18,
          highlights: [
            "Golden hour trauma response workshops with 108 Emergency staff",
            "Good Samaritan protection awareness widely disseminated",
          ],
        },
      },
      hazardAudit: {
        reported: totalHazards,
        resolved: resolvedHazards,
        rectificationRate,
      },
      actionAudit: {
        committed: committedActions,
        completed: completedActions,
        verified: verifiedActions,
      },
      topDistricts: topScorecards.map((s) => ({
        districtName: s.districtName,
        score: s.overallScore,
        grade: s.grade,
        rank: s.rank || 1,
      })),
      evidenceAnnexures: [
        {
          title: "District Rectification Photographic Evidence",
          type: "Image Gallery",
          url: "/hazards",
          description: "Photographic before/after proof of repaired blackspots",
        },
        {
          title: "Institutional Road Safety Club Charters",
          type: "Audit Log",
          url: "/institution",
          description: "Registered student club memberships and pledge certificates",
        },
      ],
      status: "final",
    });

    return NextResponse.json({
      success: true,
      reportId: report.reportId,
      report,
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json({ error: "Failed to generate government report" }, { status: 500 });
  }
}
