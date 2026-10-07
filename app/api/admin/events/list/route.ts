import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import { getGovSession } from "@/lib/govAuth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const includePending = searchParams.get("includePending") === "true";
    let district = searchParams.get("district");

    try {
      const session = await getGovSession();
      if (session?.user?.role === "district_admin" && session?.user?.district) {
        district = session.user.district;
      }
    } catch (_) {}

    const query: any = {};
    if (!includePending) {
      query.approved = true;
    }
    if (district && district !== "all") {
      query.district = district;
    }

    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .select("referenceId title date location district organizerId organizerName institution approved createdAt")
      .lean();

    return NextResponse.json({ events });
  } catch (error: any) {
    console.warn("Admin events list DB latency/disconnect, returning empty list:", error);
    return NextResponse.json({ events: [] });
  }
}


