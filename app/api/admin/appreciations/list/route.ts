import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const certificates = await Certificate.find({
      appreciationOptIn: true,
      appreciationText: { $exists: true, $ne: "" },
    })
      .sort({ createdAt: -1 })
      .select({ fullName: 1, appreciationText: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({ items: certificates });
  } catch (error) {
    console.warn("Appreciations list DB latency/disconnect, returning empty list:", error);
    return NextResponse.json({ items: [] });
  }
}









