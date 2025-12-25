"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Certificate, { CertificateCode, CertificateData } from "@/components/certificates/Certificate";
import { getRegionalAuthority } from "@/lib/regional";
import { exportCertificateToPdf } from "@/utils/certificateExport";
import { Download, ArrowLeft, Award, Loader2 } from "lucide-react";

const REQUIRED_PARAMS = ["type", "name", "district", "date"] as const;

const safeDecode = (value: string | null) => {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export default function CertificatePreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="rs-container py-20 flex flex-col items-center gap-4 text-center">
          <Award className="h-6 w-6 animate-spin text-emerald-600" />
          <p className="text-slate-600">Loading certificate preview...</p>
        </div>
      }
    >
      <CertificatePreviewContent />
    </Suspense>
  );
}

function CertificatePreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);

  // Always show Padala Rahul photo (karimnagar)
  const regionalAuthority = getRegionalAuthority("karimnagar");

  useEffect(() => {
    const certId = searchParams.get("certId");
    
    // If certId is provided, fetch certificate from API to get proper certificate number
    if (certId) {
      fetch(`/api/certificates/get?certId=${certId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.certificate) {
            const cert = data.certificate;
            const certType: CertificateCode = cert.type === "MERIT" ? "QUIZ" : cert.type === "ORGANIZER" ? "ORG" : "PAR";
            
            setCertificateData({
              certificateType: certType,
              fullName: cert.fullName,
              district: "Karimnagar", // Default district
              issueDate: new Date(cert.createdAt).toISOString(),
              email: cert.userEmail,
              score: cert.score?.toString(),
              total: cert.total?.toString(),
              institution: cert.institution,
              activityType: cert.activityType,
              details: undefined,
              eventName: cert.eventTitle,
              referenceId: cert.certificateId, // Use proper certificate number format (KRMR-RSM-2026-PDL-RHL-TYPE-00001)
              regionalAuthority: regionalAuthority
                ? {
                    officerName: regionalAuthority.officerName,
                    officerTitle: regionalAuthority.officerTitle,
                    photo: regionalAuthority.photo,
                  }
                : undefined,
            });
          } else {
            // Fallback to URL params
            const missingParam = REQUIRED_PARAMS.find((param) => !searchParams.get(param));
            if (missingParam) {
              router.replace("/certificates/generate");
              return;
            }
            const type = (searchParams.get("type") || "ORG") as CertificateCode;
            setCertificateData({
              certificateType: type,
              fullName: safeDecode(searchParams.get("name")),
              district: safeDecode(searchParams.get("district")),
              issueDate: searchParams.get("date") || new Date().toISOString(),
              email: safeDecode(searchParams.get("email")) || undefined,
              score: safeDecode(searchParams.get("score")) || undefined,
              details: safeDecode(searchParams.get("details")) || undefined,
              eventName: safeDecode(searchParams.get("event")) || undefined,
              referenceId: safeDecode(searchParams.get("ref")) || undefined,
              regionalAuthority: regionalAuthority
                ? {
                    officerName: regionalAuthority.officerName,
                    officerTitle: regionalAuthority.officerTitle,
                    photo: regionalAuthority.photo,
                  }
                : undefined,
            });
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          router.replace("/certificates/generate");
        });
    } else {
      // No certId, use URL params
      const missingParam = REQUIRED_PARAMS.find((param) => !searchParams.get(param));
      if (missingParam) {
        router.replace("/certificates/generate");
        return;
      }
      const type = (searchParams.get("type") || "ORG") as CertificateCode;
      setCertificateData({
        certificateType: type,
        fullName: safeDecode(searchParams.get("name")),
        district: safeDecode(searchParams.get("district")),
        issueDate: searchParams.get("date") || new Date().toISOString(),
        email: safeDecode(searchParams.get("email")) || undefined,
        score: safeDecode(searchParams.get("score")) || undefined,
        details: safeDecode(searchParams.get("details")) || undefined,
        eventName: safeDecode(searchParams.get("event")) || undefined,
        referenceId: safeDecode(searchParams.get("ref")) || undefined,
        regionalAuthority: regionalAuthority
          ? {
              officerName: regionalAuthority.officerName,
              officerTitle: regionalAuthority.officerTitle,
              photo: regionalAuthority.photo,
            }
          : undefined,
      });
      setLoading(false);
    }
  }, [router, searchParams, regionalAuthority]);

  const handleDownload = async () => {
    if (!certificateRef.current || isDownloading || !certificateData) return;
    setIsDownloading(true);
    setDownloadError(null);

    try {
      await exportCertificateToPdf(certificateRef.current, `${certificateData.fullName.replace(/\s+/g, "_")}_certificate.pdf`);
    } catch (error) {
      console.error("Certificate download failed:", error);
      setDownloadError("Could not generate the PDF. Please retry after a few seconds.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading || !certificateData) {
    return (
      <div className="rs-container py-20 flex flex-col items-center gap-4 text-center">
        <Award className="h-6 w-6 animate-spin text-emerald-600" />
        <p className="text-slate-600">Loading certificate preview...</p>
      </div>
    );
  }

  return (
    <div className="rs-container py-14 space-y-8">
      <div className="rs-card p-8 bg-gradient-to-br from-emerald-50 to-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <span className="rs-chip flex items-center gap-2">
            <Award className="h-4 w-4" /> Certificate Preview
          </span>
          <h1 className="text-3xl font-semibold text-emerald-900">Review & Download</h1>
          <p className="text-slate-600 max-w-2xl">
            Your certificate is ready. Click the download button to save it as a PDF file on your device.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => router.push("/certificates/generate")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Form
          </Button>
          <Button onClick={handleDownload} className="rs-btn-primary gap-2" disabled={isDownloading}>
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" /> Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {downloadError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {downloadError}
        </div>
      )}

      <div className="rounded-3xl border border-emerald-100 bg-slate-100/80 p-4 md:p-8 shadow-inner">
        <Certificate ref={certificateRef} data={certificateData} />
      </div>
    </div>
  );
}
