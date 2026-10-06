"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import Certificate, { CertificateCode, CertificateData } from "@/components/certificates/Certificate";
import {
  exportCertificateToPdf,
  exportCertificateToPng,
  getCertificateBlob,
} from "@/utils/certificateExport";
import {
  Download,
  ArrowLeft,
  Award,
  Loader2,
  Share2,
  Check,
  Copy,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Sparkles,
  ExternalLink,
  Hash,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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

  // Download states
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Certificate data state
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);

  // Social configuration from Admin
  const [socialHashtags, setSocialHashtags] = useState<string[]>([
    "#RoadSafetyMonth2027",
    "#SadakSurakshaJeevanRaksha",
    "#StateTransport",
    "#SafeRoadsSaveLives",
    "#ZeroAccidents2027",
  ]);
  const [socialShareMessage, setSocialShareMessage] = useState<string>(
    "I am proud to receive the official Road Safety Certificate from the Government Transport Department! Let us commit to responsible road behaviour and zero accidents."
  );

  // Share & Notification UI states
  const [isSharing, setIsSharing] = useState(false);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [instagramModalOpen, setInstagramModalOpen] = useState(false);

  useEffect(() => {
    // Fetch live Admin social hashtags & message
    fetch("/api/config/social")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (Array.isArray(data.socialHashtags) && data.socialHashtags.length > 0) {
            setSocialHashtags(data.socialHashtags);
          }
          if (data.socialShareMessage) {
            setSocialShareMessage(data.socialShareMessage);
          }
        }
      })
      .catch((err) => console.warn("Using default social hashtags:", err));

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
              if (cert.score !== undefined && cert.total !== undefined && cert.total > 0) {
                const percentage = (cert.score / cert.total) * 100;
                certType = percentage >= 80 ? "TOPPER" : "MERIT";
              } else {
                certType = "MERIT";
              }
            } else {
              certType = "PAR";
            }

            setCertificateData({
              certificateType: certType,
              fullName: cert.fullName,
              district: cert.district || "Karimnagar",
              issueDate: new Date(cert.createdAt).toISOString(),
              email: cert.userEmail,
              score: cert.score?.toString(),
              total: cert.total?.toString(),
              institution: cert.institution,
              activityType: cert.activityType,
              details: undefined,
              eventName: cert.eventTitle,
              referenceId: cert.certificateId,
              eventType: cert.eventType || null,
              eventReferenceId: cert.eventReferenceId || null,
              participationContext: cert.participationContext || null,
            });
          } else {
            // Fallback to URL params
            const missingParam = REQUIRED_PARAMS.find((param) => !searchParams.get(param));
            if (missingParam) {
              router.replace("/certificates/generate");
              return;
            }
            const type = (searchParams.get("type") || "ORG") as CertificateCode;
            const eventTypeParam = searchParams.get("eventType");
            setCertificateData({
              certificateType: type,
              fullName: safeDecode(searchParams.get("name")),
              district: safeDecode(searchParams.get("district")),
              issueDate: searchParams.get("date") || new Date().toISOString(),
              email: safeDecode(searchParams.get("email")) || undefined,
              score: safeDecode(searchParams.get("score")) || undefined,
              details: safeDecode(searchParams.get("details")) || undefined,
              eventName: safeDecode(searchParams.get("event")) || undefined,
              institution: safeDecode(searchParams.get("institution")) || undefined,
              referenceId: safeDecode(searchParams.get("ref")) || undefined,
              eventType: eventTypeParam === "statewide" ? "statewide" : eventTypeParam === "regional" ? "regional" : null,
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
      const eventTypeParam = searchParams.get("eventType");
      setCertificateData({
        certificateType: type,
        fullName: safeDecode(searchParams.get("name")),
        district: safeDecode(searchParams.get("district")),
        institution: safeDecode(searchParams.get("institution")) || undefined,
        issueDate: searchParams.get("date") || new Date().toISOString(),
        email: safeDecode(searchParams.get("email")) || undefined,
        score: safeDecode(searchParams.get("score")) || undefined,
        details: safeDecode(searchParams.get("details")) || undefined,
        eventName: safeDecode(searchParams.get("event")) || undefined,
        referenceId: safeDecode(searchParams.get("ref")) || undefined,
        eventType: eventTypeParam === "statewide" ? "statewide" : eventTypeParam === "regional" ? "regional" : null,
      });
      setLoading(false);
    }
  }, [router, searchParams]);

  const sanitizedFileName = (ext: string) => {
    const name = certificateData?.fullName ? certificateData.fullName.replace(/\s+/g, "_") : "RoadSafety";
    const ref = certificateData?.referenceId ? `_${certificateData.referenceId}` : "";
    return `${name}${ref}_certificate.${ext}`;
  };

  // 1. Download PDF Handler
  const handleDownloadPdf = async () => {
    if (!certificateRef.current || isDownloadingPdf || !certificateData) return;

    setIsDownloadingPdf(true);
    setDownloadError(null);

    const timeoutId = setTimeout(() => {
      setIsDownloadingPdf(false);
      setDownloadError("PDF generation timed out. Please try refreshing or using another browser.");
    }, 65000);

    try {
      await exportCertificateToPdf(certificateRef.current, sanitizedFileName("pdf"));
      clearTimeout(timeoutId);
      setIsDownloadingPdf(false);
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("PDF download failed:", error);
      setDownloadError(`PDF generation failed: ${error?.message || "Unknown error"}. Please retry.`);
      setIsDownloadingPdf(false);
    }
  };

  // 2. Download PNG Handler
  const handleDownloadPng = async () => {
    if (!certificateRef.current || isDownloadingPng || !certificateData) return;

    setIsDownloadingPng(true);
    setDownloadError(null);

    const timeoutId = setTimeout(() => {
      setIsDownloadingPng(false);
      setDownloadError("PNG generation timed out. Please try refreshing or using another browser.");
    }, 45000);

    try {
      await exportCertificateToPng(certificateRef.current, sanitizedFileName("png"));
      clearTimeout(timeoutId);
      setIsDownloadingPng(false);
      triggerToast("High-definition PNG Certificate Downloaded!");
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("PNG download failed:", error);
      setDownloadError(`PNG generation failed: ${error?.message || "Unknown error"}. Please retry.`);
      setIsDownloadingPng(false);
    }
  };

  // Helper to trigger toast notification
  const triggerToast = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => {
      setCopiedToast(null);
    }, 4000);
  };

  // Copy helper
  const copyToClipboard = async (text: string, notice: string) => {
    try {
      await navigator.clipboard.writeText(text);
      triggerToast(notice);
    } catch {
      // Fallback
      triggerToast("Copied to clipboard!");
    }
  };

  // Build social share details
  const getSharePayload = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const certRef = certificateData?.referenceId || "";
    const certUrl = certRef ? `${origin}/certificates/preview?certId=${encodeURIComponent(certRef)}` : (typeof window !== "undefined" ? window.location.href : "");
    const hashtagsFormatted = socialHashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
    const hashtagsCleanNoHash = socialHashtags.map((h) => h.replace(/^#/, "")).join(",");

    const orgLine = certificateData?.institution
      ? `🏛️ Organisation / Institution: ${certificateData.institution}\n`
      : "";

    const fullCaption = `${socialShareMessage}\n\n🏅 Awarded to: ${certificateData?.fullName}\n${orgLine}🆔 Certificate ID: ${certRef || "RSM2027"}\n\n${hashtagsFormatted}\n\n🔗 Verify Certificate: ${certUrl}`;

    return {
      certUrl,
      hashtagsFormatted,
      hashtagsCleanNoHash,
      fullCaption,
      shortText: `${socialShareMessage} - Awarded to ${certificateData?.fullName}`,
    };
  };

  // Extract certificate PNG file for Web Share API
  const getCertificateFile = async (): Promise<File | null> => {
    if (!certificateRef.current) return null;
    try {
      const blob = await getCertificateBlob(certificateRef.current);
      return new File([blob], sanitizedFileName("png"), { type: "image/png" });
    } catch (err) {
      console.warn("Could not create PNG file for sharing:", err);
      return null;
    }
  };

  // 3. WhatsApp Status & Chat Share
  const handleShareWhatsApp = async () => {
    const { fullCaption } = getSharePayload();
    setIsSharing(true);

    try {
      // Check if mobile device supports Web Share with file (for WhatsApp status)
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile && navigator.canShare && certificateRef.current) {
        const file = await getCertificateFile();
        if (file && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Road Safety Certificate 2027",
            text: fullCaption,
            files: [file],
          });
          setIsSharing(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Mobile file share bypassed, falling back to WhatsApp intent:", err);
    }

    // Direct WhatsApp Web / App intent
    setIsSharing(false);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullCaption)}`;
    window.open(whatsappUrl, "_blank");
  };

  // 4. Instagram Post & Story Share
  const handleShareInstagram = async () => {
    const { fullCaption } = getSharePayload();
    setIsSharing(true);

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile && navigator.canShare && certificateRef.current) {
      try {
        const file = await getCertificateFile();
        if (file && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Road Safety Certificate 2027",
            text: fullCaption,
            files: [file],
          });
          setIsSharing(false);
          return;
        }
      } catch (err) {
        console.warn("Instagram mobile share sheet:", err);
      }
    }

    // Desktop or non-supporting browser fallback:
    // 1. Download PNG
    if (certificateRef.current) {
      try {
        await exportCertificateToPng(certificateRef.current, sanitizedFileName("png"));
      } catch (err) {
        console.warn("PNG auto-download on Instagram share:", err);
      }
    }
    // 2. Copy caption with hashtags
    await copyToClipboard(fullCaption, "Certificate PNG downloaded & caption copied!");
    setIsSharing(false);
    // 3. Open helpful Instagram instructions dialog
    setInstagramModalOpen(true);
  };

  // 5. LinkedIn Post Share
  const handleShareLinkedIn = async () => {
    const { certUrl, fullCaption } = getSharePayload();
    await copyToClipboard(fullCaption, "Citation & hashtags copied to clipboard! Opening LinkedIn...");
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(certUrl)}`;
    window.open(linkedInUrl, "_blank");
  };

  // 6. X (Twitter) Post Share
  const handleShareTwitter = () => {
    const { certUrl, hashtagsCleanNoHash } = getSharePayload();
    const orgSuffix = certificateData?.institution ? ` (${certificateData.institution})` : "";
    const tweetText = `${socialShareMessage}\n\nHonoured to receive the official Road Safety Certificate! 🏅\n- ${certificateData?.fullName}${orgSuffix}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&hashtags=${encodeURIComponent(hashtagsCleanNoHash)}&url=${encodeURIComponent(certUrl)}`;
    window.open(twitterUrl, "_blank");
  };

  // 7. Facebook Post & Story Share
  const handleShareFacebook = async () => {
    const { certUrl, fullCaption } = getSharePayload();
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile && navigator.canShare && certificateRef.current) {
      try {
        const file = await getCertificateFile();
        if (file && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Road Safety Certificate 2027",
            text: fullCaption,
            files: [file],
          });
          return;
        }
      } catch (err) {
        console.warn("Facebook mobile share sheet:", err);
      }
    }

    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(certUrl)}&quote=${encodeURIComponent(fullCaption)}`;
    window.open(fbUrl, "_blank");
  };

  // 8. General Mobile Share Sheet (All Apps)
  const handleDeviceShare = async () => {
    const { certUrl, fullCaption } = getSharePayload();
    setIsSharing(true);

    try {
      if (navigator.share && certificateRef.current) {
        const file = await getCertificateFile();
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Road Safety Certificate 2027",
            text: fullCaption,
            files: [file],
            url: certUrl,
          });
          setIsSharing(false);
          return;
        } else {
          await navigator.share({
            title: "Road Safety Certificate 2027",
            text: fullCaption,
            url: certUrl,
          });
          setIsSharing(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Device share dismissed or unsupported:", err);
    }

    setIsSharing(false);
    await copyToClipboard(fullCaption, "Certificate link and hashtags copied to clipboard!");
  };

  if (loading || !certificateData) {
    return (
      <div className="rs-container py-20 flex flex-col items-center gap-4 text-center">
        <Award className="h-6 w-6 animate-spin text-emerald-600" />
        <p className="text-slate-600">Loading certificate preview...</p>
      </div>
    );
  }

  const { fullCaption } = getSharePayload();

  return (
    <div className="rs-container py-10 md:py-14 space-y-8">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="h-6 w-6 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center">
            <Check size={14} className="stroke-[3]" />
          </div>
          <span className="text-sm font-semibold">{copiedToast}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="rs-card p-6 md:p-8 bg-gradient-to-br from-emerald-50 via-white to-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-emerald-100 shadow-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rs-chip flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-100/70">
              <Award className="h-4 w-4 text-emerald-700" /> Verified Certificate
            </span>
            {certificateData.referenceId && (
              <Badge variant="outline" className="font-mono text-xs text-slate-600 bg-white">
                {certificateData.referenceId}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-950">
            Official Road Safety Certificate
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl">
            Issued under the authority of the Transport Department. Export in PDF or PNG format, or share directly to your social media status and feeds with official campaign hashtags.
          </p>
        </div>

        {/* Action Buttons: Back, Download PDF, Download PNG */}
        <div className="flex flex-wrap gap-2.5 sm:gap-3 items-center">
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
            className="gap-2 h-11 px-4 min-h-[44px] text-xs sm:text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Form
          </Button>

          {/* Download PNG Button */}
          <Button
            onClick={handleDownloadPng}
            disabled={isDownloadingPng || isDownloadingPdf}
            variant="outline"
            className="gap-2 h-11 px-4 min-h-[44px] text-xs sm:text-sm font-semibold border-emerald-300 text-emerald-800 hover:bg-emerald-50 bg-white shadow-xs"
          >
            {isDownloadingPng ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" /> Exporting PNG...
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4 text-emerald-600" /> Download PNG (HD)
              </>
            )}
          </Button>

          {/* Download PDF Button */}
          <Button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf || isDownloadingPng}
            className="rs-btn-primary gap-2 h-11 px-5 min-h-[44px] text-xs sm:text-sm font-semibold shadow-sm"
          >
            {isDownloadingPdf ? (
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
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
          <span>{downloadError}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDownloadError(null)}
            className="text-xs text-red-700 border-red-200 hover:bg-red-100"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* SOCIAL MEDIA DIRECT SHARING HUB */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base md:text-lg font-bold text-slate-900">
                Direct Social Media Sharing Hub
              </h2>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[11px] font-semibold">
                Official Campaign
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Share your achievement to Instagram, WhatsApp, LinkedIn, X, and Facebook. Posts are automatically pre-filled with the statutory hashtags set by Admin.
            </p>
          </div>

          <Button
            onClick={() => copyToClipboard(fullCaption, "Caption and official hashtags copied to clipboard!")}
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 text-xs text-slate-700 hover:text-indigo-600 border-slate-200 h-9"
          >
            <Copy size={13} />
            <span>Copy Caption & Tags</span>
          </Button>
        </div>

        {/* Admin Hashtags Pills Display */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Hash size={13} className="text-indigo-600" />
            <span>Enforced Statutory Hashtags:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {socialHashtags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-xs font-semibold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full hover:bg-indigo-100 transition cursor-pointer"
                onClick={() => copyToClipboard(tag, `Copied ${tag} to clipboard!`)}
                title="Click to copy hashtag"
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        </div>

        {/* 6 Direct Sharing Action Buttons (Mobile First, 48px Touch Targets) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 pt-1">
          {/* 1. WhatsApp Status & Chat */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            disabled={isSharing}
            className="flex flex-col items-center justify-center gap-1 p-3 min-h-[58px] rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white shadow-xs transition duration-150 focus:outline-none focus:ring-2 focus:ring-[#25D366]/50"
            title="Share to WhatsApp Status & Chats"
          >
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp</span>
            </div>
            <span className="text-[10px] text-white/90 font-medium">Status & Chat</span>
          </button>

          {/* 2. Instagram Post & Story */}
          <button
            type="button"
            onClick={handleShareInstagram}
            disabled={isSharing}
            className="flex flex-col items-center justify-center gap-1 p-3 min-h-[58px] rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-95 active:scale-95 text-white shadow-xs transition duration-150 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            title="Share to Instagram Post & Story"
          >
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
              <Instagram className="h-4 w-4" />
              <span>Instagram</span>
            </div>
            <span className="text-[10px] text-white/90 font-medium">Post & Story</span>
          </button>

          {/* 3. LinkedIn Post */}
          <button
            type="button"
            onClick={handleShareLinkedIn}
            disabled={isSharing}
            className="flex flex-col items-center justify-center gap-1 p-3 min-h-[58px] rounded-xl bg-[#0A66C2] hover:bg-[#084e96] active:scale-95 text-white shadow-xs transition duration-150 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/50"
            title="Share to LinkedIn Professional Feed"
          >
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </div>
            <span className="text-[10px] text-white/90 font-medium">Feed Post</span>
          </button>

          {/* 4. X (Twitter) Post */}
          <button
            type="button"
            onClick={handleShareTwitter}
            disabled={isSharing}
            className="flex flex-col items-center justify-center gap-1 p-3 min-h-[58px] rounded-xl bg-slate-900 hover:bg-black active:scale-95 text-white shadow-xs transition duration-150 focus:outline-none focus:ring-2 focus:ring-slate-700/50"
            title="Share on X with prefilled hashtags"
          >
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
              <Twitter className="h-4 w-4" />
              <span>X (Twitter)</span>
            </div>
            <span className="text-[10px] text-white/80 font-medium">Post with Tags</span>
          </button>

          {/* 5. Facebook Post & Story */}
          <button
            type="button"
            onClick={handleShareFacebook}
            disabled={isSharing}
            className="flex flex-col items-center justify-center gap-1 p-3 min-h-[58px] rounded-xl bg-[#1877F2] hover:bg-[#0c63d4] active:scale-95 text-white shadow-xs transition duration-150 focus:outline-none focus:ring-2 focus:ring-[#1877F2]/50"
            title="Share to Facebook Post & Story"
          >
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
              <Facebook className="h-4 w-4" />
              <span>Facebook</span>
            </div>
            <span className="text-[10px] text-white/90 font-medium">Post & Story</span>
          </button>

          {/* 6. Mobile Device Share Sheet (AirDrop, Messages, All Apps) */}
          <button
            type="button"
            onClick={handleDeviceShare}
            disabled={isSharing}
            className="flex flex-col items-center justify-center gap-1 p-3 min-h-[58px] rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-xs transition duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            title="Share via device apps"
          >
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm">
              <Share2 className="h-4 w-4" />
              <span>All Apps</span>
            </div>
            <span className="text-[10px] text-white/90 font-medium">Device Share</span>
          </button>
        </div>
      </div>

      {/* CERTIFICATE CANVAS CONTAINER */}
      <div className="rounded-3xl border border-emerald-100 bg-slate-100/80 p-3 md:p-8 shadow-inner overflow-x-auto">
        <Certificate ref={certificateRef} data={certificateData} />
      </div>

      {/* Instagram Desktop Guide Dialog */}
      <Dialog open={instagramModalOpen} onOpenChange={setInstagramModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Instagram className="h-5 w-5 text-pink-600" />
              Share to Instagram (Post & Story)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              Your certificate PNG has been downloaded and your official caption has been copied to your clipboard.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Certificate PNG Downloaded</p>
                <p className="text-[11px] text-emerald-800">
                  The image file is saved in your device downloads folder.
                </p>
              </div>
            </div>

            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-indigo-900 flex items-start gap-2">
              <Copy className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Official Caption & Hashtags Copied</p>
                <p className="text-[11px] text-indigo-800">
                  Pre-filled with official Admin hashtags: {socialHashtags.slice(0, 3).join(" ")}...
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-1">
              <p className="font-semibold text-slate-800">Next Steps:</p>
              <ol className="list-decimal list-inside text-slate-600 space-y-0.5 text-[11px]">
                <li>Open Instagram on your phone or web.</li>
                <li>Create a new Story or Post (+ icon).</li>
                <li>Select the downloaded certificate PNG image.</li>
                <li>Paste your copied caption with official campaign hashtags!</li>
              </ol>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => copyToClipboard(fullCaption, "Caption copied again!")}
              className="text-xs flex-1 gap-1.5"
            >
              <Copy size={13} /> Copy Caption Again
            </Button>
            <Button
              onClick={() => {
                window.open("https://www.instagram.com", "_blank");
                setInstagramModalOpen(false);
              }}
              className="bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-95 text-white text-xs flex-1 gap-1.5"
            >
              <ExternalLink size={13} /> Open Instagram Web
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
