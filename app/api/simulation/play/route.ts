import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SimulationPlay from "@/models/SimulationPlay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const type = body?.type;
    if (!type || !["bike", "car", "pedestrian"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    try {
      await connectDB();
      await SimulationPlay.create({ type });
    } catch (dbError) {
      console.warn("SimulationPlay database error, failing gracefully:", dbError);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: true });
  }
}









