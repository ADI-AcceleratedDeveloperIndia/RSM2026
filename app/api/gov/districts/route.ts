import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";
import Event from "@/models/Event";
import Club from "@/models/Club";
import ParentsPledge from "@/models/ParentsPledge";
import { TELANGANA_DISTRICTS } from "@/lib/districts";

export async function GET() {
  try {
    await connectDB();
    
    // Get participation stats per district
    const [certsByDistrict, eventsByDistrict, clubsByDistrict, pledgesByDistrict] = await Promise.all([
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
      ])
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
    
    // Build district rows with scores
    const districts = TELANGANA_DISTRICTS.map(d => {
      const participants = certsMap[d.name] || 0;
      const events = eventsMap[d.name] || 0;
      const clubs = clubsMap[d.name] || 0;
      const pledges = pledgesMap[d.name] || 0;
      
      // Simple composite score (will be replaced by proper scorecard later)
      const score = Math.min(100, Math.round(
        (participants * 0.3) + (events * 5) + (clubs * 10) + (pledges * 0.5)
      ));
      
      let grade = "F";
      if (score >= 90) grade = "A+";
      else if (score >= 80) grade = "A";
      else if (score >= 70) grade = "B";
      else if (score >= 50) grade = "C";
      else if (score >= 30) grade = "D";
      
      return {
        code: d.code,
        name: d.name,
        state: d.state,
        participants,
        events,
        clubs,
        pledges,
        actions: 0,
        hazards: 0,
        score,
        grade
      };
    });
    
    // Sort by score descending and assign ranks
    districts.sort((a, b) => b.score - a.score);
    districts.forEach((d, i) => { (d as any).rank = i + 1; });
    
    return NextResponse.json({
      districts,
      summary: {
        totalDistricts: districts.length,
        avgScore: Math.round(districts.reduce((s, d) => s + d.score, 0) / districts.length),
        bestDistrict: districts[0]?.name || "N/A",
        worstDistrict: districts[districts.length - 1]?.name || "N/A",
      }
    });
  } catch (error) {
    console.error("Gov districts error:", error);
    return NextResponse.json({ error: "Failed to fetch districts" }, { status: 500 });
  }
}
