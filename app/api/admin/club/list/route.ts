import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Club from "@/models/Club";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const clubEntries = await Club.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Club.countDocuments();

    return NextResponse.json({
      items: clubEntries.map((entry: any) => ({
        _id: entry._id.toString(),
        institutionName: entry.institutionName,
        district: entry.district,
        pointOfContact: entry.pointOfContact,
        organizerId: entry.organizerId,
        createdAt: entry.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Error fetching club entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch club entries" },
      { status: 500 }
    );
  }
}

