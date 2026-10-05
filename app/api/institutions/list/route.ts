import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Institution from "@/models/Institution";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const query: Record<string, any> = {};

    if (district && district !== "all") query.district = district;
    if (type && type !== "all") query.type = type;
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { institutionId: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [institutions, total] = await Promise.all([
      Institution.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Institution.countDocuments(query),
    ]);

    return NextResponse.json({
      institutions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching institutions:", error);
    return NextResponse.json({ error: "Failed to fetch institutions" }, { status: 500 });
  }
}
