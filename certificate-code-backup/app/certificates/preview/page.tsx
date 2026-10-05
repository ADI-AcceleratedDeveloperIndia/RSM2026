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
  const [downloadSignature, setDownloadSignature] = useState<string | null>(null);

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
          const regionalAuthority = getRegionalAuthority("karimnagar");
          
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
          if (data.signature) {
            setDownloadSignature(data.signature);
          }
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
    if (isDownloading || !certificateData) {
      console.log("Download blocked:", { isDownloading, hasData: !!certificateData });
      return;
    }
    
    if (!certificateRef.current) {
      console.error("Certificate ref is null");
      setDownloadError("Certificate element not found. Please refresh the page.");
      return;
    }

    console.log("Starting PDF download...");
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const certId = certificateData.referenceId || "certificate";
      const fileName = `certificate-${certId}.pdf`;
      
      console.log("Calling exportCertificateToPdf with:", { fileName, hasElement: !!certificateRef.current });
      
      // Use client-side PDF generation
      await exportCertificateToPdf(certificateRef.current, fileName);
      
      console.log("PDF download completed successfully");
    } catch (error: any) {
      console.error("Certificate download failed:", error);
      setDownloadError(
        i18n.language === "te"
          ? "PDF సృష్టించలేకపోయింది. దయచేసి మళ్లీ ప్రయత్నించండి."
          : `Failed to generate PDF: ${error?.message || "Unknown error"}`
      );
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
                {i18n.language === "te" ? "PDF సృష్టిస్తోంది..." : "Generating PDF..."}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" /> {i18n.language === "te" ? "PDF డౌన్‌లోడ్" : "Download PDF"}
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
        <div ref={certificateRef}>
          <Certificate data={certificateData} />
        </div>
      </div>
    </div>
  );
}
