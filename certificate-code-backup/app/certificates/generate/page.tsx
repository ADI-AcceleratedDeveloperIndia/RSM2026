"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Award, Sparkles, Loader2, CheckCircle2 } from "lucide-react";

const generateSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  institution: z.string().optional(),
  organizerReferenceId: z.string().optional(), // Optional organizer/event reference ID
  userEmail: z.string().email().optional().or(z.literal("")),
});

type GenerateForm = z.infer<typeof generateSchema>;

export default function CertificateGeneratePage() {
  return (
    <Suspense
      fallback={
        <div className="rs-container py-20 flex flex-col items-center gap-4 text-center">
          <Sparkles className="h-6 w-6 animate-spin text-emerald-600" />
          <p className="text-slate-600">Loading certificate generator...</p>
        </div>
      }
    >
      <CertificateGenerateContent />
    </Suspense>
  );
}

function CertificateGenerateContent() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [activityType, setActivityType] = useState<string | null>(null);
  const [certificateType, setCertificateType] = useState<"PARTICIPANT" | "MERIT">("PARTICIPANT");

  useEffect(() => {
    // Get score from sessionStorage (set by activity pages)
    const savedScore = sessionStorage.getItem("basicsScore") || 
                      sessionStorage.getItem("simulationScore") ||
                      sessionStorage.getItem("quizScore") ||
                      sessionStorage.getItem("guidesScore") ||
                      sessionStorage.getItem("preventionScore");
    const savedTotal = sessionStorage.getItem("basicsTotal") ||
                      sessionStorage.getItem("simulationTotal") ||
                      sessionStorage.getItem("quizTotal") ||
                      sessionStorage.getItem("guidesTotal") ||
                      sessionStorage.getItem("preventionTotal");
    const savedActivity = sessionStorage.getItem("activityType");

    if (savedScore && savedTotal) {
      setScore(parseInt(savedScore));
      setTotal(parseInt(savedTotal));
      setActivityType(savedActivity || "online");
      
      // Determine certificate type based on score
      const percentage = (parseInt(savedScore) / parseInt(savedTotal)) * 100;
      setCertificateType(percentage >= 60 ? "MERIT" : "PARTICIPANT");
    } else {
      // No activity completed, redirect to home
      router.push("/");
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GenerateForm>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      fullName: "",
      institution: "",
      organizerReferenceId: "",
      userEmail: "",
    },
  });

  const onSubmit = async (data: GenerateForm) => {
    if (score === null || total === null || activityType === null) {
      alert("Score data missing. Please complete an activity first.");
      return;
    }

    setLoading(true);
    try {
      // Add timeout to fetch (30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch("/api/certificates/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: certificateType,
          fullName: data.fullName,
          institution: data.institution || undefined,
          score: score,
          total: total,
          activityType: activityType,
          organizerReferenceId: data.organizerReferenceId || undefined,
          userEmail: data.userEmail || undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await response.json();
      if (response.ok) {
        // Clear sessionStorage
        sessionStorage.removeItem("basicsScore");
        sessionStorage.removeItem("basicsTotal");
        sessionStorage.removeItem("simulationScore");
        sessionStorage.removeItem("simulationTotal");
        sessionStorage.removeItem("quizScore");
        sessionStorage.removeItem("quizTotal");
        sessionStorage.removeItem("guidesScore");
        sessionStorage.removeItem("guidesTotal");
        sessionStorage.removeItem("preventionScore");
        sessionStorage.removeItem("preventionTotal");
        sessionStorage.removeItem("activityType");

        // Redirect to preview with certificate ID
        router.push(`/certificates/preview?certId=${result.certificateId}&eventTitle=${encodeURIComponent(result.eventTitle || "")}`);
      } else {
        const errorMsg = result.error || "Failed to create certificate";
        alert(errorMsg);
        console.error("Certificate creation error:", result);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        alert("Certificate creation timed out. Please check your connection and try again.");
      } else {
        console.error("Certificate creation error:", error);
        alert("Failed to create certificate. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (score === null || total === null) {
    return (
      <div className="rs-container py-20 flex flex-col items-center gap-4 text-center">
        <p className="text-slate-600">No activity completed. Please complete an activity first.</p>
        <Button onClick={() => router.push("/")}>Go to Home</Button>
      </div>
    );
  }

  const percentage = Math.round((score / total) * 100);

  return (
    <div className="rs-container py-14 space-y-8">
      <div className="rs-card p-8 bg-gradient-to-br from-emerald-50 to-white space-y-3">
        <div className="space-y-3">
          <span className="rs-chip flex items-center gap-2">
            <Award className="h-4 w-4" /> {i18n.language === "te" ? "సర్టిఫికేట్ జెనరేటర్" : "Certificate Generator"}
          </span>
          <h1 className="text-3xl font-semibold text-emerald-900">
            {i18n.language === "te" ? "సర్టిఫికేట్ సృష్టించండి" : "Create Certificate"}
          </h1>
          <p className="text-slate-600 max-w-2xl">
            {i18n.language === "te"
              ? "మీ వివరాలను నమోదు చేసి మీ సర్టిఫికేట్‌ను సృష్టించండి"
              : "Enter your details to create your certificate"}
          </p>
        </div>
      </div>

      {/* Score Display */}
      <div className="rs-card p-6 bg-emerald-50 border border-emerald-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">
              {i18n.language === "te" ? "మీ స్కోర్" : "Your Score"}
            </p>
            <p className="text-3xl font-bold text-emerald-900 mt-1">
              {score} / {total} ({percentage}%)
            </p>
            <p className="text-xs text-slate-600 mt-1 capitalize">
              {i18n.language === "te" ? "కార్యకలాపం" : "Activity"}: {activityType}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">
              {i18n.language === "te" ? "సర్టిఫికేట్ రకం" : "Certificate Type"}
            </p>
            <p className="text-lg font-semibold text-emerald-900 mt-1">
              {certificateType === "MERIT"
                ? i18n.language === "te"
                  ? "మెరిట్"
                  : "Merit"
                : i18n.language === "te"
                ? "పాల్గొనేవారు"
                : "Participant"}
            </p>
          </div>
        </div>
      </div>

      <div className="rs-card p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-semibold text-emerald-900">
              {i18n.language === "te" ? "పూర్తి పేరు" : "Full Name"} *
            </Label>
            <Input
              id="fullName"
              {...register("fullName")}
              required
              className="h-11 rounded-lg border border-emerald-200"
            />
            {errors.fullName && (
              <p className="text-xs text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution" className="text-sm font-semibold text-emerald-900">
              {i18n.language === "te" ? "సంస్థ" : "Institution"} (Optional)
            </Label>
            <Input
              id="institution"
              {...register("institution")}
              className="h-11 rounded-lg border border-emerald-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organizerReferenceId" className="text-sm font-semibold text-emerald-900">
              {i18n.language === "te" ? "ఆర్గనైజర్ రిఫరెన్స్ ID" : "Organizer Reference ID"} (Optional)
            </Label>
            <Input
              id="organizerReferenceId"
              {...register("organizerReferenceId")}
              placeholder="KRMR-RSM-2026-PDL-RHL-EVT-00001"
              className="h-11 rounded-lg border border-emerald-200 font-mono text-xs"
            />
            <p className="text-xs text-slate-500">
              {i18n.language === "te"
                ? "మీరు ఈవెంట్‌లో పాల్గొన్నట్లయితే, ఈవెంట్ రిఫరెన్స్ ID ను నమోదు చేయండి"
                : "If you participated in an event, enter the event reference ID"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userEmail" className="text-sm font-semibold text-emerald-900">
              {i18n.language === "te" ? "ఇమెయిల్" : "Email"} (Optional)
            </Label>
            <Input
              id="userEmail"
              type="email"
              {...register("userEmail")}
              className="h-11 rounded-lg border border-emerald-200"
            />
            {errors.userEmail && (
              <p className="text-xs text-red-600">{errors.userEmail.message}</p>
            )}
          </div>

          <Button type="submit" className="rs-btn-primary w-full justify-center" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                {i18n.language === "te" ? "సృష్టిస్తోంది..." : "Creating..."}
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />{" "}
                {i18n.language === "te" ? "సర్టిఫికేట్ సృష్టించండి" : "Create Certificate"}
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
