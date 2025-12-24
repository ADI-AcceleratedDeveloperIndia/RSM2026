"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
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

function LoadingFallback() {
  const { t: tc } = useTranslation("content");
  return (
    <div className="rs-container py-20 flex flex-col items-center gap-4 text-center">
      <Award className="h-6 w-6 animate-spin text-emerald-600" />
      <p className="text-slate-600">{tc("loadingCertificatePreview") || "Loading certificate preview..."}</p>
    </div>
  );
}

export default function CertificatePreviewPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CertificatePreviewContent />
    </Suspense>
  );
}

function CertificatePreviewContent() {
  const { t } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  const router = useRouter();
  const searchParams = useSearchParams();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    const missingParam = REQUIRED_PARAMS.find((param) => !searchParams.get(param));
    if (missingParam) {
      router.replace("/certificates/generate");
    }
  }, [router, searchParams]);

  const data = useMemo<CertificateData>(() => {
    const type = (searchParams.get("type") || "ORG") as CertificateCode;
    const regionalAuthority = getRegionalAuthority(searchParams.get("rta"));
    return {
      certificateType: type,
      fullName: safeDecode(searchParams.get("name")),
      district: safeDecode(searchParams.get("district")),
      issueDate: searchParams.get("date") || new Date().toISOString(),
      email: safeDecode(searchParams.get("email")) || undefined,
      score: safeDecode(searchParams.get("score")) || undefined,
      details: safeDecode(searchParams.get("details")) || undefined,
      eventName: safeDecode(searchParams.get("event")) || undefined,
      referenceId: safeDecode(searchParams.get("ref")) || undefined,
      language: searchParams.get("lang") || undefined,
      regionalAuthority: regionalAuthority
        ? {
            officerName: regionalAuthority.officerName,
            officerTitle: regionalAuthority.officerTitle,
            photo: regionalAuthority.photo,
          }
        : undefined,
    };
  }, [searchParams]);

  const handleDownload = async () => {
    if (!certificateRef.current || isDownloading) return;
    setIsDownloading(true);
    setDownloadError(null);

    try {
      await exportCertificateToPdf(certificateRef.current, `${data.fullName.replace(/\s+/g, "_")}_certificate.pdf`);
    } catch (error) {
      console.error("Certificate download failed:", error);
      setDownloadError(tc("couldNotGeneratePdf") || "Could not generate the PDF. Please retry after a few seconds.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="rs-container py-14 space-y-8">
      <div className="rs-card p-8 bg-gradient-to-br from-emerald-50 to-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <span className="rs-chip flex items-center gap-2">
            <Award className="h-4 w-4" /> {tc("certificatePreview") || "Certificate Preview"}
          </span>
          <h1 className="text-3xl font-semibold text-emerald-900">{tc("reviewDownload") || "Review & Download"}</h1>
          <p className="text-slate-600 max-w-2xl">
            {tc("yourCertificateIsReady") || "Your certificate is ready. Click the download button to save it as a PDF file on your device."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => router.push("/certificates/generate")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> {tc("backToForm") || "Back to Form"}
          </Button>
          <Button onClick={handleDownload} className="rs-btn-primary gap-2" disabled={isDownloading}>
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {tc("generatingPdf") || "Generating PDF..."}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" /> {tc("downloadPdf") || "Download PDF"}
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
        <Certificate ref={certificateRef} data={data} />
      </div>
    </div>
  );
}

