"use client";

import { Suspense, useEffect, useRef, useState } from "react";
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
            
            // Determine certificate type based on database type and score
            let certType: CertificateCode = "PAR";
            if (cert.type === "ORGANIZER") {
              certType = "ORG";
            } else if (cert.type === "MERIT") {
              // Check score to determine if TOPPER (>=80%) or MERIT (60-79%)
              if (cert.score !== undefined && cert.total !== undefined && cert.total > 0) {
                const percentage = (cert.score / cert.total) * 100;
                certType = percentage >= 80 ? "TOPPER" : "MERIT";
              } else {
                certType = "MERIT"; // Default to Merit if score not available
              }
            } else {
              certType = "PAR";
            }
            
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
          <Button 
            variant="outline" 
            onClick={() => {
              const source = searchParams.get("source");
              if (source === "offline") {
                router.push("/certificates");
              } else {
                router.push("/certificates/generate");
              }
            }} 
            className="gap-2"
          >
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

      {/* Appreciation Form */}
      {certificateData.referenceId && (
        <AppreciationForm certificateId={certificateData.referenceId} />
      )}
    </div>
  );
}

function AppreciationForm({ certificateId }: { certificateId: string }) {
  const [appreciationText, setAppreciationText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { i18n } = useTranslation("common");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appreciationText.trim()) {
      alert(i18n.language === "te" ? "దయచేసి మీ అభినందనను నమోదు చేయండి" : "Please enter your appreciation");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/certificates/appreciation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateId,
          appreciationText: appreciationText.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setAppreciationText("");
      } else {
        alert(data.error || (i18n.language === "te" ? "సమర్పణ విఫలమైంది" : "Submission failed"));
      }
    } catch (error) {
      alert(i18n.language === "te" ? "సమర్పణ విఫలమైంది" : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rs-card p-6 bg-emerald-50 border border-emerald-200">
        <p className="text-emerald-800 font-semibold text-center">
          {i18n.language === "te"
            ? "మీ అభినందన విజయవంతంగా సమర్పించబడింది! ప్రభుత్వానికి ధన్యవాదాలు."
            : "Thank you! Your appreciation has been submitted to the government."}
        </p>
      </div>
    );
  }

  return (
    <div className="rs-card p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-emerald-900">
          {i18n.language === "te" ? "మీ అభిప్రాయం ఇవ్వండి" : "Share Your Feedback"}
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          {i18n.language === "te"
            ? "మీ అభినందనను ప్రభుత్వానికి పంపండి. ఇది ప్రభుత్వానికి చేరుతుంది."
            : "Your feedback will be sent to the government. This will reach the government."}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={appreciationText}
          onChange={(e) => setAppreciationText(e.target.value)}
          placeholder={i18n.language === "te" ? "మీ అభినందనను ఇక్కడ నమోదు చేయండి..." : "Enter your appreciation message here..."}
          className="w-full min-h-[100px] rounded-lg border border-emerald-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none resize-y"
          required
        />
        <Button type="submit" className="rs-btn-primary" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {i18n.language === "te" ? "సమర్పిస్తోంది..." : "Submitting..."}
            </>
          ) : (
            i18n.language === "te" ? "సమర్పించండి" : "Submit Appreciation"
          )}
        </Button>
      </form>
    </div>
  );
}
