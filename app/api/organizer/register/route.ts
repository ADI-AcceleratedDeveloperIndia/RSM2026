import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import Organizer from "@/models/Organizer";
import { generateTemporaryOrganizerId, getDistrictCode } from "@/lib/reference";
import { saveOrganizerInMemory } from "@/lib/organizerStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid request payload. JSON body is required." },
        { status: 400 }
      );
    }

    const { fullName, email, phone, institution, designation, password, district } = body;

    // 1. Validate required fields: name, email, phone, institution, district
    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return NextResponse.json(
        { error: "Full Name is required and must not be empty." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim().replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid phone number with at least 10 digits." },
        { status: 400 }
      );
    }

    if (!institution || typeof institution !== "string" || !institution.trim()) {
      return NextResponse.json(
        { error: "Institution / Organization name is required." },
        { status: 400 }
      );
    }

    if (!district || typeof district !== "string" || !district.trim()) {
      return NextResponse.json(
        { error: "District is required. Please select your district." },
        { status: 400 }
      );
    }

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanInstitution = institution.trim();
    const cleanDesignation = (designation && typeof designation === "string" ? designation.trim() : "Road Safety Coordinator");
    const cleanDistrict = district.trim();
    const districtCode = getDistrictCode(cleanDistrict);

    const temporaryId = generateTemporaryOrganizerId();
    const passwordHash = password && typeof password === "string" && password.trim().length > 0
      ? await bcrypt.hash(password.trim(), 10)
      : undefined;

    let dbAvailable = false;
    let existingOrg = null;

    try {
      await connectDB();
      dbAvailable = true;

      // Check if email or phone already exists
      existingOrg = await Organizer.findOne({
        $or: [{ email: cleanEmail }, { phone: cleanPhone }],
      });
    } catch (dbError: any) {
      console.warn("MongoDB unavailable during organizer registration check, continuing with resilient memory store:", dbError?.message);
    }

    if (existingOrg) {
      return NextResponse.json(
        { error: "An organizer with this email address or phone number is already registered." },
        { status: 400 }
      );
    }

    let createdId: string = temporaryId;

    if (dbAvailable) {
      try {
        const organizer = await Organizer.create({
          temporaryId,
          fullName: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          institution: cleanInstitution,
          designation: cleanDesignation,
          district: cleanDistrict,
          districtCode,
          passwordHash,
          status: "pending",
        });
        if (organizer?._id) {
          createdId = organizer.temporaryId;
        }
      } catch (createError: any) {
        if (createError?.code === 11000) {
          return NextResponse.json(
            { error: "An organizer with this email or ID is already registered." },
            { status: 400 }
          );
        }
        console.warn("MongoDB organizer creation failed, falling back to in-memory store:", createError?.message);
      }
    }

    // Save in memory store for offline and fast verification
    saveOrganizerInMemory({
      temporaryId: createdId,
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      institution: cleanInstitution,
      designation: cleanDesignation,
      district: cleanDistrict,
      districtCode,
      status: "pending",
      passwordHash,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      temporaryId: createdId,
      status: "pending",
      district: cleanDistrict,
      institution: cleanInstitution,
      fullName: cleanName,
      message: "Organizer registration submitted successfully. Your application is under admin review.",
    });
  } catch (error: any) {
    console.error("Organizer registration error:", error);
    return NextResponse.json(
      { error: "Registration could not be completed. Please check all fields and try again.", details: error?.message },
      { status: 400 }
    );
  }
}
