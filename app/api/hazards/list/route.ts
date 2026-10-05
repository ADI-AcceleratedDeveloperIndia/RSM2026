import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Hazard from "@/models/Hazard";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district");
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const query: Record<string, any> = {};

    if (district && district !== "all") query.district = district;
    if (status && status !== "all") query.status = status;
    if (severity && severity !== "all") query.severity = severity;
    if (category && category !== "all") query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { hazardId: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [hazards, total] = await Promise.all([
      Hazard.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Hazard.countDocuments(query),
    ]);

    return NextResponse.json({
      hazards,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching hazards:", error);
    return NextResponse.json({ error: "Failed to fetch hazards" }, { status: 500 });
  }
}
