import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import Organizer from "@/models/Organizer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password, phone } = body;

    if (!identifier || (!password && !phone)) {
      return NextResponse.json(
        { error: "Organizer ID/Email and Password or registered Phone number are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const cleanId = identifier.trim();
    const organizer = await Organizer.findOne({
      $or: [
        { finalId: cleanId },
        { temporaryId: cleanId },
        { email: cleanId.toLowerCase() },
      ],
    });

    if (!organizer) {
      return NextResponse.json(
        { error: "Organizer not found. Please verify your Organizer ID or Email." },
        { status: 404 }
      );
    }

    // Verification check:
    let authenticated = false;

    // 1. If password provided and hash exists
    if (password && organizer.passwordHash) {
      const match = await bcrypt.compare(password, organizer.passwordHash);
      if (match) authenticated = true;
    }

    // 2. If phone match provided (or if organizer hasn't set password yet)
    if (!authenticated && phone) {
      const cleanPhone = phone.trim().replace(/[^0-9]/g, "");
      const orgPhone = (organizer.phone || "").replace(/[^0-9]/g, "");
      if (cleanPhone && orgPhone && (orgPhone.endsWith(cleanPhone) || cleanPhone.endsWith(orgPhone))) {
        authenticated = true;
      }
    }

    // 3. Fallback: if password matches phone number
    if (!authenticated && password && organizer.phone) {
      const cleanPass = password.trim().replace(/[^0-9]/g, "");
      const orgPhone = (organizer.phone || "").replace(/[^0-9]/g, "");
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
        id: organizer._id.toString(),
        fullName: organizer.fullName,
        email: organizer.email,
        phone: organizer.phone,
        institution: organizer.institution,
        designation: organizer.designation,
        status: organizer.status,
        finalId: organizer.finalId || null,
        temporaryId: organizer.temporaryId,
      },
    });
  } catch (error: any) {
    console.error("Organizer login error:", error);
    return NextResponse.json(
      { error: "Internal server error during organizer login", details: error.message },
      { status: 500 }
    );
  }
}
