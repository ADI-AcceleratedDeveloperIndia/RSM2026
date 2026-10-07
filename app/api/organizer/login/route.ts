import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import Organizer from "@/models/Organizer";
import { getOrganizerFromMemory } from "@/lib/organizerStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid request payload. Credentials required." },
        { status: 400 }
      );
    }

    const { identifier, password, phone } = body;

    if (!identifier || (!password && !phone)) {
      return NextResponse.json(
        { error: "Organizer ID/Email and Password or registered Phone number are required." },
        { status: 400 }
      );
    }

    const cleanId = String(identifier).trim();

    // 1. Check in-memory store
    let organizer: any = getOrganizerFromMemory(cleanId);

    // 2. Query MongoDB if available
    let dbConnected = false;
    try {
      await connectDB();
      dbConnected = true;

      const dbOrg = await Organizer.findOne({
        $or: [
          { finalId: cleanId },
          { temporaryId: cleanId },
          { email: cleanId.toLowerCase() },
        ],
      }).lean();

      if (dbOrg) {
        organizer = dbOrg;
      }
    } catch (dbError: any) {
      console.warn("MongoDB unavailable during organizer login, checking memory store:", dbError?.message);
    }

    if (!organizer) {
      return NextResponse.json(
        { error: "Organizer not found. Please verify your Organizer ID or registered Email." },
        { status: 404 }
      );
    }

    // 3. Authenticate credentials
    let authenticated = false;

    // A. Password hash match
    if (password && organizer.passwordHash) {
      try {
        const match = await bcrypt.compare(String(password), organizer.passwordHash);
        if (match) authenticated = true;
      } catch (bcryptErr) {
        console.warn("Bcrypt comparison error:", bcryptErr);
      }
    }

    // B. Registered Phone number match
    if (!authenticated && phone) {
      const cleanPhone = String(phone).trim().replace(/[^0-9]/g, "");
      const orgPhone = String(organizer.phone || "").replace(/[^0-9]/g, "");
      if (cleanPhone && orgPhone && (orgPhone.endsWith(cleanPhone) || cleanPhone.endsWith(orgPhone))) {
        authenticated = true;
      }
    }

    // C. Password matches phone number fallback
    if (!authenticated && password && organizer.phone) {
      const cleanPass = String(password).trim().replace(/[^0-9]/g, "");
      const orgPhone = String(organizer.phone || "").replace(/[^0-9]/g, "");
      if (cleanPass.length >= 4 && orgPhone.endsWith(cleanPass)) {
        authenticated = true;
      }
    }

    if (!authenticated) {
      return NextResponse.json(
        { error: "Invalid credentials. Please enter the correct password or registered phone number." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Organizer login successful",
      organizer: {
        id: organizer._id ? organizer._id.toString() : (organizer.id || organizer.temporaryId),
        fullName: organizer.fullName,
        email: organizer.email,
        phone: organizer.phone,
        institution: organizer.institution,
        designation: organizer.designation || "Road Safety Coordinator",
        district: organizer.district || "Karimnagar",
        districtCode: organizer.districtCode || "KRMR",
        status: organizer.status || "pending",
        finalId: organizer.finalId || null,
        temporaryId: organizer.temporaryId,
      },
    });
  } catch (error: any) {
    console.error("Organizer login error:", error);
    return NextResponse.json(
      { error: "Unable to process organizer login. Please verify your credentials and network connection." },
      { status: 503 }
    );
  }
}
