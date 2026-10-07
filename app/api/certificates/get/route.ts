import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Certificate from "@/models/Certificate";
import { signCertificateUrl } from "@/lib/hmac";
import { getCertificateFromMemory } from "@/lib/organizerStore";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const certId = (searchParams.get("certId") || searchParams.get("certificateId") || searchParams.get("ref"))?.trim();

    if (!certId) {
      return NextResponse.json(
        { error: "Certificate ID is required" },
        { status: 400 }
      );
    }

    let certificate: any = null;

    try {
      await connectDB();
      const dbCert = await Certificate.findOne({ certificateId: certId }).lean();
      if (dbCert) {
        certificate = dbCert;
      }
    } catch (dbErr: any) {
      console.warn("MongoDB unavailable during certificate get, checking memory store:", dbErr?.message);
    }

    if (!certificate) {
      certificate = getCertificateFromMemory(certId);
    }

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
        eventReferenceId: certificate.eventReferenceId,
        eventType: certificate.eventType,
        district: certificate.district,
        participationContext: certificate.participationContext,
        createdAt: certificate.createdAt,
        userEmail: certificate.userEmail,
      },
      signature,
    });
  } catch (error: any) {
    console.error("Certificate get error:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificate. Please check network connection." },
      { status: 503 }
    );
  }
}
