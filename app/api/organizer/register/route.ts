import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Organizer from "@/models/Organizer";
import { generateTemporaryOrganizerId } from "@/lib/reference";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, phone, institution, designation } = body;

    if (!fullName || !email || !phone || !institution || !designation) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if email already exists
    const existing = await Organizer.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const temporaryId = generateTemporaryOrganizerId();
    const organizer = await Organizer.create({
      temporaryId,
      fullName,
      email,
      phone,
      institution,
      designation,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      temporaryId: organizer.temporaryId,
    });
  } catch (error: any) {
    console.error("Organizer registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}








