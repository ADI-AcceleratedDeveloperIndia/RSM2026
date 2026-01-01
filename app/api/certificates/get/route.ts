import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";
import { signCertificateUrl } from "@/lib/hmac";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const certId = searchParams.get("certId");

    if (!certId) {
      return NextResponse.json(
        { error: "Certificate ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const certificate = await Certificate.findOne({ certificateId: certId });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Generate signature for download URL
    const signature = await signCertificateUrl(certId);

    return NextResponse.json({
      certificate: {
        certificateId: certificate.certificateId,
        type: certificate.type,
        fullName: certificate.fullName,
        institution: certificate.institution,
        score: certificate.score,
        total: certificate.total,
        activityType: certificate.activityType,
        eventTitle: certificate.eventTitle,
        eventReferenceId: certificate.eventReferenceId, // Event Reference ID (TGSG-* or district code-*)
        eventType: certificate.eventType, // statewide or regional
        district: certificate.district, // District name
        createdAt: certificate.createdAt,
        userEmail: certificate.userEmail,
      },
      signature, // Include signature for download
    });
  } catch (error: any) {
    console.error("Certificate get error:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificate" },
      { status: 500 }
    );
  }
}

