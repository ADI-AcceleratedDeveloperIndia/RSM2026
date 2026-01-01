"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download } from "lucide-react";
import { useTranslation } from "react-i18next";

const DISTRICTS = [
  "Adilabad",
  "Bhadradri Kothagudem",
  "Hyderabad",
  "Jagtial",
  "Jangaon",
  "Jayashankar Bhupalpally",
  "Jogulamba Gadwal",
  "Kamareddy",
  "Karimnagar",
  "Khammam",
  "Kumuram Bheem Asifabad",
  "Mahabubabad",
  "Mahabubnagar",
  "Mancherial",
  "Medak",
  "Medchal–Malkajgiri",
  "Mulugu",
  "Nagarkurnool",
  "Nalgonda",
  "Narayanpet",
  "Nirmal",
  "Nizamabad",
  "Peddapalli",
  "Rajanna Sircilla",
  "Ranga Reddy",
  "Sangareddy",
  "Siddipet",
  "Suryapet",
  "Vikarabad",
  "Wanaparthy",
  "Warangal",
  "Hanumakonda",
  "Yadadri Bhuvanagiri",
];

const TELUGU_PLEDGE = `తల్లిదండ్రుల హామీ పత్రం

నేను ఒక బాధ్యతాయుతమైన తల్లి / తండ్రిగా,
రోడ్డు భద్రతా నియమాలను తప్పనిసరిగా పాటిస్తానని హామీ ఇస్తున్నాను.
వాహనం నడుపుతున్నప్పుడు హెల్మెట్ లేదా సీటుబెల్ట్ ధరిస్తాను,
మొబైల్ ఫోన్ ఉపయోగించను, మద్యం సేవించి వాహనం నడపను.
నా ప్రవర్తన నా పిల్లల భవిష్యత్తుపై ప్రభావం చూపుతుందనే బాధ్యతతో,
వారికి మంచి ఆదర్శంగా ఉంటాను.

సడక్ సురక్ష – జీవన్ రక్ష`;

const ENGLISH_PLEDGE = `Parents Pledge

As a responsible parent, I pledge to follow road safety rules at all times.
I will wear a helmet or seatbelt while driving, avoid using mobile phones,
and never drive under the influence of alcohol.
I understand that my behavior sets an example for my children,
and I commit to being a positive role model for their future.

Safe Roads – Safe Lives`;

interface ParentsPledgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ParentsPledgeModal({ open, onOpenChange }: ParentsPledgeModalProps) {
  const { i18n } = useTranslation("common");
  const [formData, setFormData] = useState({
    childName: "",
    institutionName: "",
    parentName: "",
    district: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pledgeId, setPledgeId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.childName.trim() || !formData.institutionName.trim() || 
        !formData.parentName.trim() || !formData.district) {
      setError(i18n.language === "te" ? "దయచేసి అన్ని ఫీల్డ్‌లను పూరించండి" : "Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/parents-pledge/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit pledge");
      }

      // Store pledge ID and show download button
      setPledgeId(data.pledgeId);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || (i18n.language === "te" ? "దాఖలు విఫలమైంది" : "Submission failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!pledgeId) return;

    setDownloading(true);
    try {
      const pngRes = await fetch(`/api/parents-pledge/generate-png?pledgeId=${pledgeId}`);
      
      if (!pngRes.ok) {
        const errorData = await pngRes.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || "Failed to generate PNG");
      }

      const contentType = pngRes.headers.get("content-type");
      
      // Check if server returned HTML (for client-side generation) or PNG
      if (contentType?.includes("application/json")) {
        // Client-side generation needed
        const data = await pngRes.json();
        if (!data.html) {
          throw new Error("HTML content not received from server");
        }
        await generatePNGClientSide(data.html, data.pledge || {
          childName: formData.childName,
          parentName: formData.parentName,
          institutionName: formData.institutionName,
          district: formData.district,
        });
      } else {
        // Server-side PNG ready
        const blob = await pngRes.blob();
        if (blob.size === 0) {
          throw new Error("Received empty PNG file");
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Parents-Pledge-${formData.childName.replace(/\s+/g, "-")}.png`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (a.parentNode) {
            document.body.removeChild(a);
          }
          window.URL.revokeObjectURL(url);
        }, 200);
      }

      // Close modal and reset after download
      setTimeout(() => {
        onOpenChange(false);
        setFormData({
          childName: "",
          institutionName: "",
          parentName: "",
          district: "",
        });
        setPledgeId(null);
        setSubmitted(false);
      }, 500);
    } catch (err: any) {
      setError(err?.message || (i18n.language === "te" ? "PNG డౌన్‌లోడ్ విఫలమైంది" : "PNG download failed"));
    } finally {
      setDownloading(false);
    }
  };

  const generatePNGClientSide = async (html: string, pledgeData: any) => {
    try {
      // Dynamically import html2canvas
      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default ?? html2canvasModule;

      // Create a temporary container - must be visible for html2canvas to work properly
      const container = document.createElement("div");
      container.innerHTML = html;
      
      // Position off-screen but visible (html2canvas needs visible elements)
      container.style.position = "absolute";
      container.style.left = "0";
      container.style.top = "0";
      container.style.width = "800px";
      container.style.height = "auto";
      container.style.visibility = "visible";
      container.style.opacity = "1";
      container.style.pointerEvents = "auto";
      container.style.zIndex = "99999";
      container.style.overflow = "visible";
      container.style.transform = "translateX(-9999px)"; // Move off-screen but keep visible
      
      document.body.appendChild(container);

      // Wait for fonts, images, and layout to fully render
      // Longer wait for mobile devices
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate canvas with mobile-friendly options
      const canvas = await html2canvas(container, {
        scale: 2, // Higher quality
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false, // Better for mobile
        logging: false,
        removeContainer: false,
        width: 800,
        height: container.scrollHeight || 1200,
        windowWidth: 800,
        windowHeight: container.scrollHeight || 1200,
        x: 0,
        y: 0,
        onclone: (clonedDoc) => {
          // Ensure cloned document has proper styles
          const clonedContainer = clonedDoc.querySelector('body > div');
          if (clonedContainer) {
            (clonedContainer as HTMLElement).style.visibility = "visible";
            (clonedContainer as HTMLElement).style.opacity = "1";
          }
        },
      });

      // Remove container after canvas generation
      if (container.parentNode) {
        document.body.removeChild(container);
      }

      // Verify canvas has content
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Generated canvas is empty");
      }

      // Convert to blob and download
      return new Promise<void>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob && blob.size > 0) {
            try {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `Parents-Pledge-${pledgeData.childName.replace(/\s+/g, "-")}.png`;
              a.style.display = "none";
              document.body.appendChild(a);
              a.click();
              
              // Clean up after download
              setTimeout(() => {
                if (a.parentNode) {
                  document.body.removeChild(a);
                }
                window.URL.revokeObjectURL(url);
                resolve();
              }, 300);
            } catch (downloadError) {
              console.error("Download error:", downloadError);
              reject(new Error("Failed to download PNG"));
            }
          } else {
            reject(new Error("Generated PNG is empty or invalid"));
          }
        }, "image/png", 1.0); // Maximum quality
      });
    } catch (err) {
      console.error("Client-side PNG generation error:", err);
      throw new Error(`Failed to generate PNG: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };


  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when modal closes
      setFormData({
        childName: "",
        institutionName: "",
        parentName: "",
        district: "",
      });
      setPledgeId(null);
      setSubmitted(false);
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl text-emerald-900">
            {i18n.language === "te" ? "తల్లిదండ్రుల హామీ పత్రం" : "Parents Pledge"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {i18n.language === "te" 
              ? "రోడ్డు భద్రతకు మీ హామీ ఇవ్వండి" 
              : "Take the pledge for road safety"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {/* Pledge Content */}
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-semibold text-emerald-900 mb-2">
                {i18n.language === "te" ? "హామీ పత్రం" : "Pledge Text"}
              </h3>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="whitespace-pre-line text-slate-700 leading-relaxed">{TELUGU_PLEDGE}</div>
                <div className="border-t border-emerald-200 pt-2 sm:pt-3 mt-2 sm:mt-3">
                  <div className="whitespace-pre-line text-slate-700 leading-relaxed">{ENGLISH_PLEDGE}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="childName" className="text-xs sm:text-sm font-semibold text-emerald-900">
                  {i18n.language === "te" ? "పిల్లవాడి పేరు *" : "Name of the Child *"}
                </Label>
                <Input
                  id="childName"
                  value={formData.childName}
                  onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                  required
                  className="h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="institutionName" className="text-xs sm:text-sm font-semibold text-emerald-900">
                  {i18n.language === "te" ? "పాఠశాల పేరు *" : "Name of the Institution (School) *"}
                </Label>
                <Input
                  id="institutionName"
                  value={formData.institutionName}
                  onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                  required
                  className="h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="parentName" className="text-xs sm:text-sm font-semibold text-emerald-900">
                  {i18n.language === "te" ? "తల్లిదండ్రుల పేరు *" : "Name of the Parent *"}
                </Label>
                <Input
                  id="parentName"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  required
                  className="h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="district" className="text-xs sm:text-sm font-semibold text-emerald-900">
                  {i18n.language === "te" ? "జిల్లా పేరు *" : "District Name *"}
                </Label>
                <select
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  required
                  className="h-10 sm:h-11 w-full rounded-lg border border-emerald-200 px-3 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">{i18n.language === "te" ? "జిల్లాను ఎంచుకోండి" : "Select District"}</option>
                  {DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!submitted ? (
              <Button
                type="submit"
                disabled={submitting}
                className="w-full rs-btn-primary h-11 sm:h-12 text-sm sm:text-base touch-manipulation"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                    <span className="text-xs sm:text-sm">{i18n.language === "te" ? "సమర్పిస్తోంది..." : "Submitting..."}</span>
                  </>
                ) : (
                  <span className="text-xs sm:text-sm">{i18n.language === "te" ? "నేను హామీ తీసుకుంటున్నాను" : "I Take the Pledge"}</span>
                )}
              </Button>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm text-center">
                  {i18n.language === "te" 
                    ? "హామీ విజయవంతంగా సమర్పించబడింది! PNG డౌన్‌లోడ్ చేయండి." 
                    : "Pledge submitted successfully! Download your PNG certificate."}
                </div>
                <Button
                  type="button"
                  onClick={handleDownloadPNG}
                  disabled={downloading}
                  className="w-full rs-btn-primary h-11 sm:h-12 text-sm sm:text-base touch-manipulation"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                      <span className="text-xs sm:text-sm">{i18n.language === "te" ? "డౌన్‌లోడ్ అవుతోంది..." : "Downloading..."}</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      <span className="text-xs sm:text-sm">{i18n.language === "te" ? "PNG డౌన్‌లోడ్ చేయండి" : "Download PNG"}</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

