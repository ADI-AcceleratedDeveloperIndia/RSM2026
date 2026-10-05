import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ParentsPledge from "@/models/ParentsPledge";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const pledges = await ParentsPledge.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ParentsPledge.countDocuments();

    return NextResponse.json({
      items: pledges.map((pledge: any) => ({
        _id: pledge._id.toString(),
        childName: pledge.childName,
        institutionName: pledge.institutionName,
        parentName: pledge.parentName,
        district: pledge.district,
        createdAt: pledge.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("Error fetching pledges:", error);
    return NextResponse.json(
      { error: "Failed to fetch pledges" },
      { status: 500 }
    );
  }
}

