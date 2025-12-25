"use client";

import { Suspense, useEffect, useMemo } from "react";
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
  { value: "PAR", label: "PAR – Participant (Quiz score < 60%)" },
  { value: "QUIZ", label: "QUIZ – Quiz Merit (Score ≥ 60%)" },
  { value: "SIM", label: "SIM – Simulation Completion" },
  { value: "VOL", label: "VOL – Volunteer" },
  { value: "SCH", label: "SCH – School Contributor" },
  { value: "COL", label: "COL – College Coordinator" },
  { value: "TOPPER", label: "TOPPER – Simulation Topper" },
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const rtaCode = searchParams.get("rta");
  const regionalAuthority = getRegionalAuthority(rtaCode);

  const defaultType = useMemo(() => {
    const fromQuery = searchParams.get("type");
    const allowed = CERTIFICATE_OPTIONS.map((opt) => opt.value);
    return fromQuery && allowed.includes(fromQuery) ? fromQuery : "ORG";
  }, [searchParams]);

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
    if (regionalAuthority) {
      params.set("rta", regionalAuthority.code);
    }

    router.push(`/certificates/preview?${params.toString()}`);
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
        {regionalAuthority && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 flex items-start gap-3">
            <MapPin className="h-5 w-5 text-emerald-700 flex-shrink-0 mt-1" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Regional Event Certificate</p>
              <p className="text-sm text-emerald-700">
                This certificate will include {regionalAuthority.officerName} ({regionalAuthority.officerTitle}) alongside state
                leadership.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(submit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="certificateType" className="text-sm font-semibold text-emerald-900">Certificate Type *</Label>
              <select
                id="certificateType"
                value={selectedType}
                onChange={(event) => setValue("certificateType", event.target.value as GenerateForm["certificateType"])}
                className="h-11 rounded-lg border border-emerald-200 px-3 text-sm focus:border-emerald-500 focus:outline-none"
              >
                {CERTIFICATE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.certificateType && <p className="text-xs text-red-600">{errors.certificateType.message}</p>}
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

