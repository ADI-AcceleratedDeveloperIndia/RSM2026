"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import Certificate, { CertificateData } from "@/components/certificates/Certificate";
import { getRegionalAuthority } from "@/lib/regional";
import { exportCertificateToPdf } from "@/utils/certificateExport";
import { Download, ArrowLeft, Award, Loader2 } from "lucide-react";

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
  const { t, i18n } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  const router = useRouter();
  const searchParams = useSearchParams();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const certId = searchParams.get("certId");
    const isRegional = searchParams.get("regional") === "true";
    
    if (!certId) {
      router.replace("/certificates/generate");
      return;
    }

    // Fetch certificate data from API
    fetch(`/api/certificates/get?certId=${certId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.certificate) {
          const cert = data.certificate;
          const regionalAuthority = getRegionalAuthority();
          
          // Always include regional authority for regional certificates (Padala Rahul photo)
          const shouldIncludeRegional = isRegional || cert.activityType === "online";
          
          setCertificateData({
            certificateType: cert.type === "MERIT" ? "QUIZ" : cert.type === "ORGANIZER" ? "ORG" : "PAR",
            fullName: cert.fullName,
            district: "Karimnagar",
            issueDate: new Date(cert.createdAt).toISOString(),
            email: cert.userEmail,
            score: cert.score?.toString(),
            total: cert.total?.toString(),
            eventName: cert.eventTitle || searchParams.get("eventTitle") || undefined,
            referenceId: cert.certificateId,
            language: i18n.language,
            regionalAuthority: shouldIncludeRegional ? {
              officerName: regionalAuthority.officerName,
              officerTitle: regionalAuthority.officerTitle,
              photo: regionalAuthority.photo,
            } : undefined,
          });
        } else {
          router.replace("/certificates/generate");
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        router.replace("/certificates/generate");
      });
  }, [searchParams, router, i18n.language]);

  const handleDownload = async () => {
    if (!certificateRef.current || isDownloading || !certificateData) return;
    setIsDownloading(true);
    setDownloadError(null);

    try {
      // Ensure certificate is fully rendered (reduced wait time)
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      // Check if certificate element exists and is visible
      if (!certificateRef.current || certificateRef.current.offsetHeight === 0) {
        throw new Error("Certificate element is not visible");
      }

      await exportCertificateToPdf(
        certificateRef.current,
        `${certificateData.fullName.replace(/\s+/g, "_")}_certificate.png`
      );
    } catch (error: any) {
      console.error("Certificate download failed:", error);
      const errorMessage = error?.message || "Unknown error";
      if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
        setDownloadError(
          "PDF generation is taking too long. Please try again or use the server download option."
        );
      } else {
        setDownloadError(
          tc("couldNotGeneratePdf") || "Could not generate the PDF. Please retry after a few seconds."
        );
      }
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return <LoadingFallback />;
  }

  if (!certificateData) {
    return (
      <div className="rs-container py-20 flex flex-col items-center gap-4 text-center">
        <p className="text-slate-600">Certificate not found</p>
        <Button onClick={() => router.push("/certificates/generate")}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="rs-container py-14 space-y-8">
      <div className="rs-card p-8 bg-gradient-to-br from-emerald-50 to-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <span className="rs-chip flex items-center gap-2">
            <Award className="h-4 w-4" /> {tc("certificatePreview") || "Certificate Preview"}
          </span>
          <h1 className="text-3xl font-semibold text-emerald-900">
            {i18n.language === "te" ? "సర్టిఫికేట్ ప్రివ్యూ" : "Review & Download"}
          </h1>
              <p className="text-slate-600 max-w-2xl">
            {i18n.language === "te"
              ? "మీ సర్టిఫికేట్ సిద్ధంగా ఉంది. PNG ఫైల్‌గా డౌన్‌లోడ్ చేయడానికి డౌన్‌లోడ్ బటన్‌ను క్లిక్ చేయండి."
              : "Your certificate is ready. Click the download button to save it as a PNG image file on your device."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => router.push("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> {i18n.language === "te" ? "హోమ్‌కు వెళ్ళండి" : "Go to Home"}
          </Button>
          <Button onClick={handleDownload} className="rs-btn-primary gap-2" disabled={isDownloading}>
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />{" "}
                {i18n.language === "te" ? "PNG సృష్టిస్తోంది..." : "Generating PNG..."}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" /> {i18n.language === "te" ? "PNG డౌన్‌లోడ్" : "Download PNG"}
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

      <div className="rounded-2xl sm:rounded-3xl border border-emerald-100 bg-slate-100/80 p-2 sm:p-4 md:p-8 shadow-inner overflow-x-auto">
        <Certificate ref={certificateRef} data={certificateData} />
      </div>
    </div>
  );
}
