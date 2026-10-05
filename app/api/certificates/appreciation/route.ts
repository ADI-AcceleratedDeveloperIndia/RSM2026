import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { certificateId, appreciationText } = body;

    if (!certificateId || !appreciationText || !appreciationText.trim()) {
      return NextResponse.json(
        { error: "Certificate ID and appreciation text are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const certificate = await Certificate.findOne({ certificateId });
    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Update certificate with appreciation
    certificate.appreciationOptIn = true;
    certificate.appreciationText = appreciationText.trim();
    await certificate.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Appreciation submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit appreciation" },
      { status: 500 }
    );
  }
}









