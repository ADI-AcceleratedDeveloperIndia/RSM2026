"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateReferenceId } from "@/lib/reference";
import { Award, MapPin, Sparkles, Languages } from "lucide-react";
import { getRegionalAuthority } from "@/lib/regional";

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

const getCertificateOptions = (tc: (key: string) => string) => [
  { value: "ORG", label: `ORG – ${tc("certificateOrgTitle")}` },
  { value: "PAR", label: `PAR – ${tc("certificateParTitle")}` },
  { value: "QUIZ", label: `QUIZ – ${tc("certificateQuizTitle")}` },
  { value: "SIM", label: `SIM – ${tc("certificateSimTitle")}` },
  { value: "VOL", label: `VOL – ${tc("certificateVolTitle")}` },
  { value: "SCH", label: `SCH – ${tc("certificateSchTitle")}` },
  { value: "COL", label: `COL – ${tc("certificateColTitle")}` },
  { value: "TOPPER", label: `TOPPER – ${tc("certificateTopperTitle")}` },
];

const generateSchema = z.object({
  certificateType: z.enum(["ORG", "PAR", "QUIZ", "SIM", "VOL", "SCH", "COL", "TOPPER"]),
  fullName: z.string().min(1, "Name is required"),
  district: z.string().min(1, "District is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  email: z.string().email().optional().or(z.literal("")),
  score: z.string().optional(),
  details: z.string().optional(),
  eventName: z.string().optional(),
  referenceId: z.string().min(1, "Reference ID is required"),
});

type GenerateForm = z.infer<typeof generateSchema>;

const safeDecode = (value: string | null) => {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

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
  const { t: tc } = useTranslation("content");
  const router = useRouter();
  const searchParams = useSearchParams();
  const rtaCode = searchParams.get("rta");
  const regionalAuthority = getRegionalAuthority(rtaCode);
  const [mounted, setMounted] = useState(false);
  const [certificateLang, setCertificateLang] = useState<string>(searchParams.get("lang") || "en");

  useEffect(() => {
    setMounted(true);
    // Initialize language from localStorage or default to "en"
    const savedLang = typeof window !== "undefined" ? localStorage.getItem("i18nextLng") || "en" : "en";
    i18n.changeLanguage(savedLang);
    // Set certificate language from URL or use saved language
    const langFromUrl = searchParams.get("lang");
    if (!langFromUrl) {
      setCertificateLang(savedLang);
    }
  }, [i18n, searchParams]);

  const certificateOptions = getCertificateOptions(tc);
  
  const defaultType = useMemo(() => {
    const fromQuery = searchParams.get("type");
    const allowed = certificateOptions.map((opt) => opt.value);
    return fromQuery && allowed.includes(fromQuery) ? fromQuery : "ORG";
  }, [searchParams, certificateOptions]);

  const referenceFromQuery = searchParams.get("ref");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GenerateForm>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      certificateType: defaultType as GenerateForm["certificateType"],
      fullName: "",
      district: "",
      issueDate: new Date().toISOString().slice(0, 10),
      email: "",
      score: "",
      details: "",
      eventName: "",
      referenceId: referenceFromQuery || generateReferenceId(defaultType || "CERT"),
    },
  });

  const selectedType = watch("certificateType");
  const districtValue = watch("district");

  useEffect(() => {
    const paramsToUpdate = [
      { key: "type", setter: (val: string) => setValue("certificateType", val as GenerateForm["certificateType"]) },
      { key: "name", setter: (val: string) => setValue("fullName", safeDecode(val)) },
      { key: "district", setter: (val: string) => setValue("district", safeDecode(val)) },
      { key: "date", setter: (val: string) => setValue("issueDate", val) },
      { key: "email", setter: (val: string) => setValue("email", safeDecode(val)) },
      { key: "score", setter: (val: string) => setValue("score", safeDecode(val)) },
      { key: "details", setter: (val: string) => setValue("details", safeDecode(val)) },
      { key: "event", setter: (val: string) => setValue("eventName", safeDecode(val)) },
      { key: "ref", setter: (val: string) => setValue("referenceId", safeDecode(val)) },
    ];

    paramsToUpdate.forEach(({ key, setter }) => {
      const value = searchParams.get(key);
      if (value) {
        setter(value);
      }
    });
  }, [searchParams, setValue]);

  useEffect(() => {
    if (regionalAuthority) {
      setValue("district", regionalAuthority.district);
    }
  }, [regionalAuthority, setValue]);

  const submit = (data: GenerateForm) => {
    const params = new URLSearchParams();
    params.set("type", data.certificateType);
    params.set("name", data.fullName);
    params.set("district", data.district);
    params.set("date", data.issueDate);
    if (data.email) params.set("email", data.email);
    if (data.score) params.set("score", data.score);
    if (data.details) params.set("details", data.details);
    if (data.eventName) params.set("event", data.eventName);
    params.set("ref", data.referenceId);
    params.set("lang", certificateLang);
    if (regionalAuthority) {
      params.set("rta", regionalAuthority.code);
    }

    router.push(`/certificates/preview?${params.toString()}`);
  };

  // Prevent hydration mismatch by not rendering translated content until mounted
  if (!mounted) {
    return (
      <div className="rs-container py-14 space-y-8">
        <div className="rs-card p-8 bg-gradient-to-br from-emerald-50 to-white space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <span className="rs-chip flex items-center gap-2">
                <Award className="h-4 w-4" /> Official certificate generator
              </span>
              <h1 className="text-3xl font-semibold text-emerald-900">Generate Certificate</h1>
              <p className="text-slate-600 max-w-2xl">
                Fill in the details below to preview and download an official Telangana Road Safety Month certificate with the Telangana emblem, minister signature, and your personalised information.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-xs text-slate-500 font-medium">Certificate Language</span>
              <Button
                type="button"
                variant="outline"
                className="gap-2 border-emerald-200 hover:bg-emerald-50"
                disabled
              >
                <Languages className="h-4 w-4" />
                EN
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rs-container py-14 space-y-8">
      <div className="rs-card p-8 bg-gradient-to-br from-emerald-50 to-white space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <span className="rs-chip flex items-center gap-2">
              <Award className="h-4 w-4" /> {tc("officialCertificateGenerator") || "Official certificate generator"}
            </span>
            <h1 className="text-3xl font-semibold text-emerald-900">{t("generateCertificate")}</h1>
            <p className="text-slate-600 max-w-2xl">
              {tc("fillDetailsToPreview") || "Fill in the details below to preview and download an official Telangana Road Safety Month certificate with the Telangana emblem, minister signature, and your personalised information."}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs text-slate-500 font-medium">{tc("certificateLanguage") || "Certificate Language"}</span>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCertificateLang(certificateLang === "en" ? "te" : "en")}
              className="gap-2 border-emerald-200 hover:bg-emerald-50"
            >
              <Languages className="h-4 w-4" />
              {certificateLang === "en" ? "EN" : "TE"}
            </Button>
          </div>
        </div>
      </div>

      <div className="rs-card p-8 space-y-6">
        {regionalAuthority && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 flex items-start gap-3">
            <MapPin className="h-5 w-5 text-emerald-700 flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">{t("regionalEvent")} {t("certificates")}</p>
              <p className="text-sm text-emerald-700">
                {tc("thisCertificateWillInclude") || "This certificate will include"} {regionalAuthority.officerName} ({regionalAuthority.officerTitle}) {tc("alongsideStateLeadership") || "alongside state leadership."}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(submit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="certificateType" className="text-sm font-semibold text-emerald-900">{tc("certificateType")} *</Label>
              <select
                id="certificateType"
                value={selectedType}
                onChange={(event) => setValue("certificateType", event.target.value as GenerateForm["certificateType"])}
                className="h-11 rounded-lg border border-emerald-200 px-3 text-sm focus:border-emerald-500 focus:outline-none"
              >
                {certificateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.certificateType && <p className="text-xs text-red-600">{errors.certificateType.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDate" className="text-sm font-semibold text-emerald-900">{tc("issueDate") || "Issue Date"} *</Label>
              <Input
                type="date"
                id="issueDate"
                className="h-11 rounded-lg border border-emerald-200"
                {...register("issueDate")}
              />
              {errors.issueDate && <p className="text-xs text-red-600">{errors.issueDate.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceId" className="text-sm font-semibold text-emerald-900">{tc("referenceId")} *</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="referenceId"
                placeholder={tc("autoGeneratedReferenceId") || "Auto-generated reference ID"}
                className="h-11 rounded-lg border border-emerald-200"
                {...register("referenceId")}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setValue("referenceId", generateReferenceId(selectedType || "CERT"))}
                className="sm:w-auto"
              >
                {tc("regenerate") || "Regenerate"}
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              {tc("shareReferenceIdWithRecipients") || "Share this reference ID with recipients. They can reuse it to download or verify certificates."}
            </p>
            {errors.referenceId && <p className="text-xs text-red-600">{errors.referenceId.message}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold text-emerald-900">{tc("fullName") || "Full Name"} *</Label>
              <Input
                id="fullName"
                placeholder={tc("enterFullName") || "Enter full name"}
                className="h-11 rounded-lg border border-emerald-200"
                {...register("fullName")}
              />
              {errors.fullName && <p className="text-xs text-red-600">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="district" className="text-sm font-semibold text-emerald-900">{tc("district") || "District"} *</Label>
              <select
                id="district"
                value={districtValue || ""}
                onChange={(event) => setValue("district", event.target.value)}
                className="h-11 rounded-lg border border-emerald-200 px-3 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="" disabled>
                  {tc("selectDistrict") || "Select district"}
                </option>
                {DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              {errors.district && <p className="text-xs text-red-600">{errors.district.message}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-emerald-900">{t("email")} ({tc("optional") || "optional"})</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@example.com"
                className="h-11 rounded-lg border border-emerald-200"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="score" className="text-sm font-semibold text-emerald-900">{tc("scoreAchievement") || "Score / Achievement"}</Label>
              <Input
                id="score"
                placeholder={tc("scorePlaceholder") || "e.g. Scored 92%, Simulation Topper"}
                className="h-11 rounded-lg border border-emerald-200"
                {...register("score")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventName" className="text-sm font-semibold text-emerald-900">{tc("eventProgrammeName") || "Event / Programme Name"}</Label>
            <Input
              id="eventName"
              placeholder={tc("eventOrProgrammeTitle") || "Event or programme title"}
              className="h-11 rounded-lg border border-emerald-200"
              {...register("eventName")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details" className="text-sm font-semibold text-emerald-900">{tc("additionalNotes") || "Additional Notes"}</Label>
            <Textarea
              id="details"
              placeholder={tc("addSpecialMention") || "Add any special mention, description, or appreciation message."}
              rows={4}
              className="border border-emerald-200"
              {...register("details")}
            />
          </div>

          <Button type="submit" className="rs-btn-primary w-full justify-center">
            <Sparkles className="h-4 w-4" /> {tc("previewCertificate") || "Preview Certificate"}
          </Button>
        </form>
      </div>
    </div>
  );
}



