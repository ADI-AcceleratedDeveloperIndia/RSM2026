import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Organizer from "@/models/Organizer";
import { getGovSession } from "@/lib/govAuth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    let district = searchParams.get("district");

    try {
      const session = await getGovSession();
      if (session?.user?.role === "district_admin" && session?.user?.district) {
        district = session.user.district;
      }
    } catch (_) {}

    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (district && district !== "all") {
      query.$or = [
        { district: district },
        { districtCode: district.slice(0, 4).toUpperCase() }
      ];
    }

    const organizers = await Organizer.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ organizers });
  } catch (error: any) {
    console.warn("Admin organizers list DB latency/disconnect, returning empty list:", error);
    return NextResponse.json({ organizers: [] });
  }
}










