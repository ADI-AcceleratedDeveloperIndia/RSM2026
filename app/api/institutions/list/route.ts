import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Institution from "@/models/Institution";
import { listInstitutionsFromMemory } from "@/lib/institutionStore";

import { getGovSession } from "@/lib/govAuth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let district = searchParams.get("district");
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const page = parseInt(searchParams.get("page") || "1", 10);

  // DTO Session scoping: if logged in as district_admin, enforce their district
  try {
    const session = await getGovSession();
    if (session?.user?.role === "district_admin" && session?.user?.district) {
      district = session.user.district;
    }
  } catch (_) {}

  try {
    await connectDB();

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

    if (total > 0) {
      return NextResponse.json({
        institutions,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      });
    }

    // Fallback if DB has 0 institutions
    const memoryList = listInstitutionsFromMemory({
      district: district && district !== "all" ? district : undefined,
      type: type && type !== "all" ? type : undefined,
      status: status && status !== "all" ? status : undefined,
      search: search || undefined,
    });

    const memPaginated = memoryList.slice(skip, skip + limit);

    return NextResponse.json({
      institutions: memPaginated,
      total: memoryList.length,
      page,
      totalPages: Math.ceil(memoryList.length / limit) || 1,
    });
  } catch (error) {
    console.warn("MongoDB unavailable during institutions list fetch, using memory store:", error);
    const memoryList = listInstitutionsFromMemory({
      district: district || undefined,
      type: type || undefined,
      status: status || undefined,
      search: search || undefined,
    });

    const skip = (page - 1) * limit;
    const paginated = memoryList.slice(skip, skip + limit);

    return NextResponse.json({
      institutions: paginated,
      total: memoryList.length,
      page,
      totalPages: Math.ceil(memoryList.length / limit) || 1,
    });
  }
}
