"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateReferenceId } from "@/lib/reference";
import { Award, MapPin, Sparkles } from "lucide-react";
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

const CERTIFICATE_OPTIONS = [
  { value: "ORG", label: "ORG – Organiser Appreciation" },
  { value: "PAR", label: "PAR – Participant (Score < 60%)" },
  { value: "MERIT", label: "MERIT – Merit Certificate (Score ≥ 60% but < 80%)" },
  { value: "TOPPER", label: "TOPPER – Topper Certificate (Score ≥ 80%)" },
  { value: "VOL", label: "VOL – Volunteer" },
  { value: "SCH", label: "SCH – School Contributor" },
  { value: "COL", label: "COL – College Coordinator" },
];

const generateSchema = z.object({
  certificateType: z.enum(["ORG", "PAR", "MERIT", "TOPPER", "VOL", "SCH", "COL"]),
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
  const router = useRouter();
  const searchParams = useSearchParams();
  // Always use karimnagar for Padala Rahul photo
  const regionalAuthority = getRegionalAuthority("karimnagar");

  // Read from sessionStorage (from activity completion)
  const [activityData, setActivityData] = useState<{
    score: number | null;
    total: number | null;
    activityType: string | null;
  }>({ score: null, total: null, activityType: null });

  useEffect(() => {
    // Check sessionStorage for activity data
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
      setActivityData({
        score: parseInt(savedScore),
        total: parseInt(savedTotal),
        activityType: savedActivity || "online",
      });
    }
  }, []);

  const defaultType = useMemo(() => {
    // Auto-determine certificate type from activity score
    if (activityData.score !== null && activityData.total !== null && activityData.activityType) {
      const percentage = (activityData.score / activityData.total) * 100;
      // Certificate type based on score: < 60% = PAR, >= 60% but < 80% = MERIT, >= 80% = TOPPER
      if (percentage >= 80) {
        return "TOPPER";
      } else if (percentage >= 60) {
        return "MERIT";
      } else {
        return "PAR";
      }
    }
    // If coming from direct access (not activity), default to PAR (not ORG)
    // ORG, VOL, SCH, COL should only be available in offline certificate generation
    const fromQuery = searchParams.get("type");
    const allowed = CERTIFICATE_OPTIONS.map((opt) => opt.value);
    // Only allow PAR, MERIT, TOPPER for online activities
    const onlineAllowed = ["PAR", "MERIT", "TOPPER"];
    if (fromQuery && allowed.includes(fromQuery) && onlineAllowed.includes(fromQuery)) {
      return fromQuery;
    }
    return "PAR"; // Default to Participant for online activities
  }, [searchParams, activityData]);
  
  // Check if coming from activity (auto-determine type)
  const isFromActivity = activityData.score !== null && activityData.total !== null && activityData.activityType;

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
      district: regionalAuthority?.district || "",
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
    // Pre-fill score from activity data
    if (activityData.score !== null && activityData.total !== null) {
      const percentage = Math.round((activityData.score / activityData.total) * 100);
      setValue("score", `Scored ${activityData.score}/${activityData.total} (${percentage}%)`);
    }

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
  }, [searchParams, setValue, activityData]);

  useEffect(() => {
    if (regionalAuthority) {
      setValue("district", regionalAuthority.district);
    }
  }, [regionalAuthority, setValue]);

  const submit = async (data: GenerateForm) => {
    // Determine certificate type for API based on selected type
    let apiType: "ORGANIZER" | "PARTICIPANT" | "MERIT" = "PARTICIPANT";
    if (data.certificateType === "ORG") {
      apiType = "ORGANIZER";
    } else if (data.certificateType === "MERIT" || data.certificateType === "TOPPER") {
      apiType = "MERIT";
    } else {
      apiType = "PARTICIPANT";
    }
    
    // Get activity type (from sessionStorage or default to "online")
    const activityType = activityData.activityType || "online";

    // Extract score from activity data or score field
    let score = 0;
    let total = 100;
    if (activityData.score !== null && activityData.total !== null) {
      score = activityData.score;
      total = activityData.total;
    } else if (data.score) {
      // Try to parse score from string like "Scored 8/10 (80%)"
      const scoreMatch = data.score.match(/(\d+)\/(\d+)/);
      if (scoreMatch) {
        score = parseInt(scoreMatch[1]);
        total = parseInt(scoreMatch[2]);
      }
    }

    // Create certificate via API to get proper certificate number
    try {
      const response = await fetch("/api/certificates/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: apiType,
          fullName: data.fullName,
          institution: "",
          score: score,
          total: total,
          activityType: activityData.activityType || "online",
          userEmail: data.email || undefined,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        alert(result.error || "Failed to create certificate");
        return;
      }

      // Clear sessionStorage after successful creation
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

      // Redirect to preview with certificate ID (proper format)
      const params = new URLSearchParams();
      params.set("certId", result.certificateId);
      params.set("type", data.certificateType);
      params.set("name", data.fullName);
      params.set("district", data.district);
      params.set("date", data.issueDate);
      if (data.email) params.set("email", data.email);
      if (data.score) params.set("score", data.score);
      if (data.details) params.set("details", data.details);
      if (data.eventName) params.set("event", data.eventName);
      // Always include regional authority (Padala Rahul)
      if (regionalAuthority) {
        params.set("rta", regionalAuthority.code);
      }

      router.push(`/certificates/preview?${params.toString()}&source=online`);
    } catch (error) {
      console.error("Certificate creation error:", error);
      alert("Failed to create certificate. Please try again.");
    }
  };

  return (
    <div className="rs-container py-14 space-y-8">
      <div className="rs-card p-8 bg-gradient-to-br from-emerald-50 to-white space-y-3">
        <span className="rs-chip flex items-center gap-2">
          <Award className="h-4 w-4" /> Official certificate generator
        </span>
        <h1 className="text-3xl font-semibold text-emerald-900">Generate Certificate</h1>
        <p className="text-slate-600 max-w-2xl">
          Fill in the details below to preview and download an official Telangana Road Safety Month certificate with the
          Telangana emblem, minister signature, and your personalised information.
        </p>
      </div>

      <div className="rs-card p-8 space-y-6">
        {activityData.score !== null && activityData.total !== null && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 flex items-start gap-3">
            <Award className="h-5 w-5 text-emerald-700 flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Activity Completed</p>
              <p className="text-sm text-emerald-700">
                Your score: {activityData.score}/{activityData.total} ({Math.round((activityData.score / activityData.total) * 100)}%)
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(submit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="certificateType" className="text-sm font-semibold text-emerald-900">Certificate Type *</Label>
              {isFromActivity ? (
                <>
                  <Input
                    id="certificateType"
                    value={CERTIFICATE_OPTIONS.find(opt => opt.value === defaultType)?.label || defaultType}
                    disabled
                    className="h-11 rounded-lg border border-emerald-200 bg-slate-100"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Certificate type automatically determined based on your score.
                  </p>
                </>
              ) : (
                <>
                  <select
                    id="certificateType"
                    value={selectedType}
                    onChange={(event) => setValue("certificateType", event.target.value as GenerateForm["certificateType"])}
                    className="h-11 rounded-lg border border-emerald-200 px-3 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    {/* Only show PAR, MERIT, TOPPER for online activities */}
                    {/* ORG, VOL, SCH, COL are only available in offline certificate generation */}
                    {CERTIFICATE_OPTIONS.filter(opt => ["PAR", "MERIT", "TOPPER"].includes(opt.value)).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    For Organizer, Volunteer, School Contributor, or College Coordinator certificates, please use the Offline Certificate Generation section.
                  </p>
                  {errors.certificateType && <p className="text-xs text-red-600">{errors.certificateType.message}</p>}
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDate" className="text-sm font-semibold text-emerald-900">Issue Date *</Label>
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
            <Label htmlFor="referenceId" className="text-sm font-semibold text-emerald-900">Reference ID *</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="referenceId"
                placeholder="Auto-generated reference ID"
                className="h-11 rounded-lg border border-emerald-200"
                {...register("referenceId")}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setValue("referenceId", generateReferenceId(selectedType || "CERT"))}
                className="sm:w-auto"
              >
                Regenerate
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              Share this reference ID with recipients. They can reuse it to download or verify certificates.
            </p>
            {errors.referenceId && <p className="text-xs text-red-600">{errors.referenceId.message}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold text-emerald-900">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter full name"
                className="h-11 rounded-lg border border-emerald-200"
                {...register("fullName")}
              />
              {errors.fullName && <p className="text-xs text-red-600">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="district" className="text-sm font-semibold text-emerald-900">District *</Label>
              <select
                id="district"
                value={districtValue || ""}
                onChange={(event) => setValue("district", event.target.value)}
                className="h-11 rounded-lg border border-emerald-200 px-3 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="" disabled>
                  Select district
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
              <Label htmlFor="email" className="text-sm font-semibold text-emerald-900">Email (optional)</Label>
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
              <Label htmlFor="score" className="text-sm font-semibold text-emerald-900">Score / Achievement</Label>
              <Input
                id="score"
                placeholder="e.g. Scored 92%, Simulation Topper"
                className="h-11 rounded-lg border border-emerald-200"
                {...register("score")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventName" className="text-sm font-semibold text-emerald-900">Event / Programme Name</Label>
            <Input
              id="eventName"
              placeholder="Event or programme title"
              className="h-11 rounded-lg border border-emerald-200"
              {...register("eventName")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details" className="text-sm font-semibold text-emerald-900">Additional Notes</Label>
            <Textarea
              id="details"
              placeholder="Add any special mention, description, or appreciation message."
              rows={4}
              className="border border-emerald-200"
              {...register("details")}
            />
          </div>

          <Button type="submit" className="rs-btn-primary w-full justify-center">
            <Sparkles className="h-4 w-4" /> Preview Certificate
          </Button>
        </form>
      </div>
    </div>
  );
}
