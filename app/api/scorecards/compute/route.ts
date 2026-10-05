import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DistrictScorecard from "@/models/DistrictScorecard";
import District from "@/models/District";
import Certificate from "@/models/Certificate";
import Event from "@/models/Event";
import Action from "@/models/Action";
import Hazard from "@/models/Hazard";
import Institution from "@/models/Institution";
import ParentsPledge from "@/models/ParentsPledge";
import { TELANGANA_DISTRICTS } from "@/lib/districts";

export async function POST() {
  try {
    await connectDB();

    // Fetch aggregate metrics in parallel
    const [
      certsByDistrict,
      eventsByDistrict,
      actionsByDistrict,
      hazardsByDistrict,
      institutionsByDistrict,
      pledgesByDistrict,
    ] = await Promise.all([
      Certificate.aggregate([
        { $group: { _id: "$district", count: { $sum: 1 } } }
      ]),
      Event.aggregate([
        { $match: { approved: true } },
        { $group: { _id: "$district", count: { $sum: 1 } } }
      ]),
      Action.aggregate([
        { 
          $group: { 
            _id: "$district", 
            total: { $sum: 1 },
            completed: { 
              $sum: { 
                $cond: [{ $in: ["$status", ["completed", "verified"]] }, 1, 0] 
              } 
            },
            education: { $sum: { $cond: [{ $eq: ["$fourECategory", "education"] }, 1, 0] } },
            engineering: { $sum: { $cond: [{ $eq: ["$fourECategory", "engineering"] }, 1, 0] } },
            enforcement: { $sum: { $cond: [{ $eq: ["$fourECategory", "enforcement"] }, 1, 0] } },
            emergency: { $sum: { $cond: [{ $eq: ["$fourECategory", "emergency"] }, 1, 0] } },
          } 
        }
      ]),
      Hazard.aggregate([
        { 
          $group: { 
            _id: "$district", 
            total: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } }
          } 
        }
      ]),
      Institution.aggregate([
        { $group: { _id: "$district", count: { $sum: 1 } } }
      ]),
      ParentsPledge.aggregate([
        { $group: { _id: "$district", count: { $sum: 1 } } }
      ]),
    ]);

    const toMap = (arr: any[], valField = "count") => {
      const m: Record<string, any> = {};
      arr.forEach((item) => {
        if (item._id) m[item._id] = typeof valField === "string" ? item[valField] : item;
      });
      return m;
    };

    const certsMap = toMap(certsByDistrict);
    const eventsMap = toMap(eventsByDistrict);
    const actionsMap = toMap(actionsByDistrict, null);
    const hazardsMap = toMap(hazardsByDistrict, null);
    const instsMap = toMap(institutionsByDistrict);
    const pledgesMap = toMap(pledgesByDistrict);

    const scorecards = TELANGANA_DISTRICTS.map((d) => {
      const participants = certsMap[d.name] || 0;
      const events = eventsMap[d.name] || 0;
      const actObj = actionsMap[d.name] || { total: 0, completed: 0, education: 0, engineering: 0, enforcement: 0, emergency: 0 };
      const hzdObj = hazardsMap[d.name] || { total: 0, resolved: 0 };
      const institutions = instsMap[d.name] || 0;
      const pledges = pledgesMap[d.name] || 0;

      // 1. Education Pillar (0-25)
      // Driven by certificates, events, institutional outreach, and education actions
      const educationScore = Math.min(25, Math.round(
        (participants * 0.05) + (events * 2.5) + (institutions * 1.5) + (actObj.education * 2) + 5
      ));

      // 2. Engineering Pillar (0-25)
      // Driven by hazard resolution rate and engineering interventions
      const hzdTotal = hzdObj.total || 0;
      const hzdResolved = hzdObj.resolved || 0;
      const hazardFixRate = hzdTotal > 0 ? (hzdResolved / hzdTotal) : 0.5;
      const engineeringScore = Math.min(25, Math.round(
        (hazardFixRate * 15) + (actObj.engineering * 2.5) + 6
      ));

      // 3. Enforcement Pillar (0-25)
      // Driven by compliance actions and organized safety drives
      const enforcementScore = Math.min(25, Math.round(
        (actObj.enforcement * 3) + (pledges * 0.1) + (events * 1.2) + 7
      ));

      // 4. Emergency Response Pillar (0-25)
      // Driven by first aid workshops, emergency actions, and pledges
      const emergencyScore = Math.min(25, Math.round(
        (actObj.emergency * 3.5) + (pledges * 0.15) + 6
      ));

      const overallScore = Math.min(100, educationScore + engineeringScore + enforcementScore + emergencyScore);

      let grade = "F";
      if (overallScore >= 90) grade = "A+";
      else if (overallScore >= 80) grade = "A";
      else if (overallScore >= 70) grade = "B";
      else if (overallScore >= 55) grade = "C";
      else if (overallScore >= 40) grade = "D";

      return {
        districtCode: d.code,
        districtName: d.name,
        state: d.state,
        year: 2027,
        month: 1,
        overallScore,
        grade,
        pillarScores: {
          education: educationScore,
          engineering: engineeringScore,
          enforcement: enforcementScore,
          emergency: emergencyScore,
        },
        metrics: {
          participants,
          certificates: participants,
          events,
          actionsTotal: actObj.total || 0,
          actionsCompleted: actObj.completed || 0,
          hazardsReported: hzdTotal,
          hazardsResolved: hzdResolved,
          institutions,
          pledges,
        },
        computedAt: new Date(),
      };
    });

    // Sort descending by overallScore and assign ranks
    scorecards.sort((a, b) => b.overallScore - a.overallScore);
    scorecards.forEach((sc, i) => {
      (sc as any).rank = i + 1;
    });

    // Save to database
    for (const sc of scorecards) {
      await DistrictScorecard.findOneAndUpdate(
        { districtCode: sc.districtCode, year: sc.year },
        { $set: sc },
        { upsert: true, new: true }
      );

      // Update denormalized scorecard in District model
      await District.updateOne(
        { code: sc.districtCode },
        {
          $set: {
            scorecardData: {
              score: sc.overallScore,
              rank: (sc as any).rank,
              grade: sc.grade,
              computedAt: new Date(),
            }
          }
        }
      );
    }

    return NextResponse.json({
      success: true,
      totalComputed: scorecards.length,
      topDistrict: scorecards[0],
      scorecards,
    });
  } catch (error) {
    console.error("Scorecard computation error:", error);
    return NextResponse.json({ error: "Failed to compute scorecards" }, { status: 500 });
  }
}
