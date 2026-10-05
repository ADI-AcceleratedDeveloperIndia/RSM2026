import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Organizer from "@/models/Organizer";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status"); // "pending", "approved", "rejected", or null for all

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const organizers = await Organizer.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ organizers });
  } catch (error: any) {
    console.error("Admin organizers list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizers" },
      { status: 500 }
    );
  }
}










