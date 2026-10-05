import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db";
import Institution from "@/models/Institution";
import District from "@/models/District";
import { generateInstitutionId, getDistrictCode } from "@/lib/reference";

const registerInstitutionSchema = z.object({
  name: z.string().min(3, "Institution name must be at least 3 characters"),
  type: z.enum(["school", "college", "university", "ngo", "corporate", "government", "other"]),
  district: z.string().min(1, "District is required"),
  address: z.string().optional(),
  pincode: z.string().optional(),
  contactPerson: z.string().min(2, "Contact person is required"),
  contactEmail: z.string().email("Valid email required"),
  contactPhone: z.string().min(10, "Valid phone number required"),
  organizerId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = registerInstitutionSchema.parse(body);

    await connectDB();

    const districtCode = getDistrictCode(validated.district);
    const institutionId = generateInstitutionId(districtCode);

    const institution = await Institution.create({
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

    return NextResponse.json({
      success: true,
      institutionId: institution.institutionId,
      institution,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    console.error("Error registering institution:", error);
    return NextResponse.json({ error: "Failed to register institution" }, { status: 500 });
  }
}
