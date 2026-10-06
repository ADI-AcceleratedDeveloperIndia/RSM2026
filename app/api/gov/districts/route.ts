import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";
import Event from "@/models/Event";
import Club from "@/models/Club";
import ParentsPledge from "@/models/ParentsPledge";
import Action from "@/models/Action";
import Hazard from "@/models/Hazard";
import District from "@/models/District";
import { STATE_DISTRICTS } from "@/lib/districts";

export async function GET() {
  try {
    await connectDB();
    
    // Fetch configured districts from DB or fallback
    let dbDistricts = await District.find().sort({ name: 1 }).lean();
    let districtsSource = dbDistricts.length > 0 ? dbDistricts : STATE_DISTRICTS;

    // Get real participation stats per district
    const [
      certsByDistrict,
      eventsByDistrict,
      clubsByDistrict,
      pledgesByDistrict,
      actionsByDistrict,
      hazardsByDistrict,
    ] = await Promise.all([
      Certificate.aggregate([
        { $group: { _id: "$district", count: { $sum: 1 } } }
      ]),
      Event.aggregate([
        { $match: { approved: true } },
        { $group: { _id: "$district", count: { $sum: 1 } } }
      ]),
      Club.aggregate([
        { $group: { _id: "$district", count: { $sum: 1 } } }
      ]),
      ParentsPledge.aggregate([
        { $group: { _id: "$district", count: { $sum: 1 } } }
      ]),
      Action.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: "$district", count: { $sum: 1 } } }
      ]),
      Hazard.aggregate([
        { $group: { _id: "$district", count: { $sum: 1 } } }
      ]),
    ]);
    
    // Build lookup maps
    const toMap = (arr: { _id: string; count: number }[]) => {
      const m: Record<string, number> = {};
      arr.forEach(i => { if (i._id) m[i._id] = i.count; });
      return m;
    };
    
    const certsMap = toMap(certsByDistrict);
    const eventsMap = toMap(eventsByDistrict);
    const clubsMap = toMap(clubsByDistrict);
    const pledgesMap = toMap(pledgesByDistrict);
    const actionsMap = toMap(actionsByDistrict);
    const hazardsMap = toMap(hazardsByDistrict);
    
    // Build district rows with real scores
    const districts = districtsSource.map(d => {
      const participants = certsMap[d.name] || 0;
      const events = eventsMap[d.name] || 0;
      const clubs = clubsMap[d.name] || 0;
      const pledges = pledgesMap[d.name] || 0;
      const actions = actionsMap[d.name] || 0;
      const hazards = hazardsMap[d.name] || 0;
      
      // Multi-factor real activity score
      const totalActivity = participants + (events * 5) + (actions * 10) + (clubs * 2) + (pledges * 0.5);
      const score = Math.min(100, Math.round(totalActivity));
      
      let grade = "D";
      if (score >= 90) grade = "A+";
      else if (score >= 80) grade = "A";
      else if (score >= 60) grade = "B";
      else if (score >= 40) grade = "C";
      else if (score > 0) grade = "D";
      else grade = "N/A";
      
      return {
        code: d.code,
        name: d.name,
        state: d.state,
        participants,
        events,
        clubs,
        pledges,
        actions,
        hazards,
        score,
        grade
      };
    });
    
    // Sort by score descending and assign ranks
    districts.sort((a, b) => b.score - a.score);
    districts.forEach((d, i) => { (d as any).rank = i + 1; });
    
    const validScores = districts.filter(d => d.score > 0);
    const avgScore = validScores.length > 0 
      ? Math.round(validScores.reduce((s, d) => s + d.score, 0) / validScores.length)
      : 0;

    return NextResponse.json({
      districts,
      summary: {
        totalDistricts: districts.length,
        avgScore,
        bestDistrict: validScores[0]?.name || districts[0]?.name || "N/A",
        worstDistrict: validScores.length > 0 ? validScores[validScores.length - 1]?.name : "N/A",
      }
    });
  } catch (error: any) {
    console.error("Gov districts error, returning zeroed registry:", error);
    const fallbackDistricts = STATE_DISTRICTS.map((d, i) => ({
      code: d.code,
      name: d.name,
      state: "State Government",
      participants: 0,
      events: 0,
      clubs: 0,
      pledges: 0,
      actions: 0,
      hazards: 0,
      score: 0,
      grade: "N/A",
      rank: i + 1,
    }));
    return NextResponse.json({
      districts: fallbackDistricts,
      summary: {
        totalDistricts: fallbackDistricts.length,
        avgScore: 0,
        bestDistrict: fallbackDistricts[0]?.name || "N/A",
        worstDistrict: "N/A",
      },
    });
  }
}
