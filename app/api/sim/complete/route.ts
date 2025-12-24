import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SimStat from "@/models/SimStat";
import { generateReferenceId } from "@/lib/reference";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sceneId, success, attempts, seconds } = body;

    if (!sceneId || typeof success !== "boolean" || !attempts || !seconds) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await connectDB();

    // Extract category from sceneId
    let category: "bike" | "car" | "pedestrian" | "other" = "other";
    if (sceneId.startsWith("bike_")) category = "bike";
    else if (sceneId.startsWith("car_")) category = "car";
    else if (sceneId.startsWith("ped_")) category = "pedestrian";

    const referenceId = generateReferenceId(category === "bike" ? "SIM-BIKE" : category === "car" ? "SIM-CAR" : category === "pedestrian" ? "SIM-PED" : "SIM");

    await SimStat.create({
      referenceId,
      sceneId,
      category,
      success,
      attempts,
      seconds,
    });

    return NextResponse.json({ ok: true, referenceId });
  } catch (error) {
    console.error("Sim completion error:", error);
    return NextResponse.json({ error: "Failed to log" }, { status: 500 });
  }
}




