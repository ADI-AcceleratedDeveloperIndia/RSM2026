import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import District from "@/models/District";
import SystemConfig from "@/models/SystemConfig";
import { STATE_DISTRICTS } from "@/lib/districts";

export async function GET() {
  try {
    await connectDB();

    // 1. Fetch system config
    let config = await SystemConfig.findOne({ key: "platform_config" });
    if (!config) {
      config = await SystemConfig.create({
        key: "platform_config",
        stateName: "State Government",
        stateCode: "SG",
        year: 2027,
      });
    }

    // 2. Fetch districts from DB
    let dbDistricts = await District.find().sort({ name: 1 }).lean();

    // If no districts in DB yet, seed from default STATE_DISTRICTS
    if (dbDistricts.length === 0) {
      const toInsert = STATE_DISTRICTS.map((d) => ({
        code: d.code,
        name: d.name,
        state: config.stateName,
        stateCode: config.stateCode,
        headquarters: d.name,
      }));
      await District.insertMany(toInsert);
      dbDistricts = await District.find().sort({ name: 1 }).lean();
    }

    return NextResponse.json({
      success: true,
      stateName: config.stateName,
      stateCode: config.stateCode,
      year: config.year,
      districts: dbDistricts.map((d: any) => ({
        code: d.code,
        name: d.name,
        state: d.state,
        totalParticipants: d.totalParticipants || 0,
        totalEvents: d.totalEvents || 0,
        totalActions: d.totalActions || 0,
        totalHazards: d.totalHazards || 0,
      })),
      totalCount: dbDistricts.length,
    });
  } catch (error: any) {
    console.error("Error fetching setup districts, returning default registry:", error);
    return NextResponse.json({
      success: true,
      stateName: "State Government",
      stateCode: "SG",
      year: 2027,
      districts: STATE_DISTRICTS.map((d) => ({
        code: d.code,
        name: d.name,
        state: "State Government",
        totalParticipants: 0,
        totalEvents: 0,
        totalActions: 0,
        totalHazards: 0,
      })),
      totalCount: STATE_DISTRICTS.length,
    });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { stateName, stateCode, districts, mode } = body;

    if (!stateName) {
      return NextResponse.json({ error: "State name is required" }, { status: 400 });
    }

    const cleanStateCode = (stateCode || stateName.slice(0, 2)).toUpperCase();

    // 1. Update or create SystemConfig
    await SystemConfig.findOneAndUpdate(
      { key: "platform_config" },
      {
        stateName: stateName.trim(),
        stateCode: cleanStateCode,
        updatedAt: new Date(),
        updatedBy: "Superadmin",
      },
      { upsert: true, new: true }
    );

    // 2. Process districts
    if (Array.isArray(districts) && districts.length > 0) {
      if (mode === "replace") {
        // Remove existing and insert new
        await District.deleteMany({});
      }

      for (const d of districts) {
        if (!d.name || !d.name.trim()) continue;
        const name = d.name.trim();
        // Generate a 4-letter code if not provided
        const code = (
          d.code ||
          name.replace(/[^A-Za-z]/g, "").slice(0, 4)
        ).toUpperCase().padEnd(4, "X");

        await District.findOneAndUpdate(
          { code },
          {
            code,
            name,
            state: stateName.trim(),
            stateCode: cleanStateCode,
            headquarters: name,
            updatedAt: new Date(),
          },
          { upsert: true }
        );
      }
    }

    // Return the updated list
    const updatedDistricts = await District.find().sort({ name: 1 }).lean();

    return NextResponse.json({
      success: true,
      message: `Successfully configured State: ${stateName} with ${updatedDistricts.length} districts.`,
      stateName,
      stateCode: cleanStateCode,
      districtsCount: updatedDistricts.length,
      districts: updatedDistricts,
    });
  } catch (error: any) {
    console.error("Error saving setup districts:", error);
    return NextResponse.json(
      { error: "Failed to save state and districts", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "District code is required" },
        { status: 400 }
      );
    }

    await District.deleteOne({ code: code.toUpperCase() });
    const remainingDistricts = await District.find().sort({ name: 1 }).lean();

    return NextResponse.json({
      success: true,
      message: `District ${code} deleted successfully.`,
      districtsCount: remainingDistricts.length,
      districts: remainingDistricts,
    });
  } catch (error: any) {
    console.error("Error deleting district:", error);
    return NextResponse.json(
      { error: "Failed to delete district", details: error.message },
      { status: 500 }
    );
  }
}
