import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Institution from "@/models/Institution";
import District from "@/models/District";
import { generateInstitutionId, getDistrictCode } from "@/lib/reference";
import { saveInstitutionInMemory } from "@/lib/institutionStore";

const registerInstitutionSchema = z.object({
  name: z.string().min(3, "Institution name must be at least 3 characters"),
  type: z.enum(["school", "college", "university", "ngo", "corporate", "government", "other"]),
  district: z.string().min(1, "District is required"),
  address: z.string().optional(),
  pincode: z.string().optional(),
  contactPerson: z.string().min(2, "Contact person is required"),
  contactEmail: z.string().email("Valid email required"),
  contactPhone: z.string().min(10, "Valid phone number with at least 10 digits required"),
  organizerId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Sanitize phone number (remove spaces, hyphens, parentheses, +91 prefix)
    const sanitizedBody = {
      ...rawBody,
      contactPhone: rawBody.contactPhone
        ? String(rawBody.contactPhone).replace(/[^0-9]/g, "").slice(-10)
        : "",
      name: rawBody.name ? String(rawBody.name).trim() : "",
      contactPerson: rawBody.contactPerson ? String(rawBody.contactPerson).trim() : "",
      contactEmail: rawBody.contactEmail ? String(rawBody.contactEmail).trim().toLowerCase() : "",
      district: rawBody.district ? String(rawBody.district).trim() : "",
    };

    const validated = registerInstitutionSchema.parse(sanitizedBody);

    const districtCode = getDistrictCode(validated.district);
    const institutionId = generateInstitutionId(districtCode);

    let dbAvailable = false;
    let institutionDoc: any = null;

    try {
      await connectDB();
      dbAvailable = true;

      institutionDoc = await Institution.create({
        institutionId,
        name: validated.name,
        type: validated.type,
        district: validated.district,
        address: validated.address || "",
        pincode: validated.pincode || "",
        contactPerson: validated.contactPerson,
        contactEmail: validated.contactEmail,
        contactPhone: validated.contactPhone,
        organizerIds: validated.organizerId ? [validated.organizerId] : [],
        status: "active",
      });

      District.updateOne({ code: districtCode }, { $inc: { totalInstitutions: 1 } }).catch(() => {});
    } catch (dbErr: any) {
      console.warn("MongoDB unavailable during institution registration, persisting to memory store:", dbErr?.message);
    }

    const institutionRecord = {
      id: institutionDoc?._id ? institutionDoc._id.toString() : institutionId,
      institutionId,
      name: validated.name,
      type: validated.type,
      district: validated.district,
      address: validated.address || "",
      pincode: validated.pincode || "",
      contactPerson: validated.contactPerson,
      contactEmail: validated.contactEmail,
      contactPhone: validated.contactPhone,
      organizerIds: validated.organizerId ? [validated.organizerId] : [],
      status: "active" as const,
      totalParticipants: 0,
      totalEvents: 0,
      totalActions: 0,
      createdAt: new Date(),
    };

    saveInstitutionInMemory(institutionRecord);

    return NextResponse.json({
      success: true,
      institutionId,
      institution: institutionDoc || institutionRecord,
      message: "Institution onboarded successfully into National Road Safety Month 2027.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("Error registering institution:", error);
    return NextResponse.json({ error: "Failed to register institution. Please verify information and retry." }, { status: 400 });
  }
}
