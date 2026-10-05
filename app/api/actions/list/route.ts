import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Action from "@/models/Action";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district");
    const fourECategory = searchParams.get("fourECategory");
    const status = searchParams.get("status");
    const actionType = searchParams.get("actionType");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const query: Record<string, any> = {};

    if (district && district !== "all") {
      query.district = district;
    }
    if (fourECategory && fourECategory !== "all") {
      query.fourECategory = fourECategory;
    }
    if (status && status !== "all") {
      query.status = status;
    }
    if (actionType && actionType !== "all") {
      query.actionType = actionType;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { actionId: { $regex: search, $options: "i" } },
        { submittedBy: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [actions, total] = await Promise.all([
      Action.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Action.countDocuments(query),
    ]);

    return NextResponse.json({
      actions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching actions:", error);
    return NextResponse.json({ error: "Failed to fetch actions" }, { status: 500 });
  }
}
