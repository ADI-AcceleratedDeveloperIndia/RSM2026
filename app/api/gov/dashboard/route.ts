import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";
import Event from "@/models/Event";
import Organizer from "@/models/Organizer";
import QuizAttempt from "@/models/QuizAttempt";
import SimStat from "@/models/SimStat";
import Club from "@/models/Club";
import ParentsPledge from "@/models/ParentsPledge";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district");
    
    // Build district filter
    const districtFilter = district ? { district } : {};
    
    // Parallel queries
    const [
      totalCertificates,
      totalEvents,
      totalOrganizers,
      pendingOrganizers,
      totalQuizAttempts,
      totalSimPlays,
      totalClubs,
      totalPledges,
      // 4E breakdown from certificates by activityType
      certificatesByActivity
    ] = await Promise.all([
      Certificate.countDocuments(districtFilter),
      Event.countDocuments({ approved: true, ...districtFilter }),
      Organizer.countDocuments({ status: "approved" }),
      Organizer.countDocuments({ status: "pending" }),
      QuizAttempt.countDocuments(),
      SimStat.countDocuments(),
      Club.countDocuments(districtFilter),
      ParentsPledge.countDocuments(districtFilter),
      Certificate.aggregate([
        ...(district ? [{ $match: { district } }] : []),
        { $group: { _id: "$activityType", count: { $sum: 1 } } }
      ])
    ]);
    
    // Classify activities into 4E categories
    const fourEBreakdown = { education: 0, engineering: 0, enforcement: 0, emergency: 0 };
    certificatesByActivity.forEach((item: { _id: string; count: number }) => {
      const activity = (item._id || "").toLowerCase();
      if (["quiz", "basics", "simulation", "guides", "prevention", "essay", "workshop"].includes(activity)) {
        fourEBreakdown.education += item.count;
      } else if (["infrastructure", "engineering", "repair"].includes(activity)) {
        fourEBreakdown.engineering += item.count;
      } else if (["enforcement", "compliance", "checking"].includes(activity)) {
        fourEBreakdown.enforcement += item.count;
      } else if (["emergency", "first_aid", "rescue"].includes(activity)) {
        fourEBreakdown.emergency += item.count;
      } else {
        fourEBreakdown.education += item.count; // default to education
      }
    });
    
    // District-wise participation
    const districtStats = await Certificate.aggregate([
      { $group: {
        _id: "$district",
        participants: { $sum: 1 },
        avgScore: { $avg: { $multiply: [{ $divide: ["$score", { $max: ["$total", 1] }] }, 100] } }
      }},
      { $sort: { participants: -1 } },
      { $limit: 10 }
    ]);
    
    return NextResponse.json({
      kpis: {
        totalParticipants: totalCertificates,
        actionsCompleted: 0,  // Will be populated when Action model is active
        hazardsReported: 0,   // Will be populated when Hazard model is active
        institutionsActive: totalClubs,
        certificatesIssued: totalCertificates,
        eventsConducted: totalEvents,
      },
      fourEBreakdown,
      pending: {
        actionsToVerify: 0,
        hazardsToAssign: 0,
        organizersToApprove: pendingOrganizers,
      },
      topDistricts: districtStats.map((d: { _id: string; participants: number; avgScore: number }, i: number) => ({
        rank: i + 1,
        district: d._id || "Online",
        participants: d.participants,
        avgScore: Math.round(d.avgScore || 0),
      })),
      totals: {
        organizers: totalOrganizers,
        quizAttempts: totalQuizAttempts,
        simPlays: totalSimPlays,
        clubs: totalClubs,
        pledges: totalPledges,
      }
    });
  } catch (error) {
    console.error("Gov dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
