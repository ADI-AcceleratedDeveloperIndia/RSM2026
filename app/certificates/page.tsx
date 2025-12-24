"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Award, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CertificateInfo {
  code: string;
  title: string;
  purpose: string;
}

const getCertificateList = (tc: (key: string) => string): CertificateInfo[] => [
  { code: "ORG", title: tc("certificateOrgTitle"), purpose: tc("certificateOrgPurpose") },
  { code: "PAR", title: tc("certificateParTitle"), purpose: tc("certificateParPurpose") },
  { code: "QUIZ", title: tc("certificateQuizTitle"), purpose: tc("certificateQuizPurpose") },
  { code: "SIM", title: tc("certificateSimTitle"), purpose: tc("certificateSimPurpose") },
  { code: "VOL", title: tc("certificateVolTitle"), purpose: tc("certificateVolPurpose") },
  { code: "SCH", title: tc("certificateSchTitle"), purpose: tc("certificateSchPurpose") },
  { code: "COL", title: tc("certificateColTitle"), purpose: tc("certificateColPurpose") },
  { code: "TOPPER", title: tc("certificateTopperTitle"), purpose: tc("certificateTopperPurpose") },
];

export default function CertificatesPage() {
  const { t, i18n } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [institution, setInstitution] = useState("");
  const [eventRef, setEventRef] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOfflineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim() || !eventRef.trim()) {
      setError(i18n.language === "te" ? "పేరు మరియు ఈవెంట్ ID అవసరం" : "Name and Event Reference ID are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/certificates/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PARTICIPANT",
          fullName: fullName.trim(),
          institution: institution.trim() || undefined,
          score: 100,
          total: 100,
          activityType: "online",
          organizerReferenceId: eventRef.trim(),
          userEmail: userEmail.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create certificate");
      }
      if (!data.certificateId) {
        throw new Error("Missing certificate ID");
      }
      // Redirect to preview page for client-side PDF download
      router.push(`/certificates/preview?certId=${data.certificateId}&regional=true`);
    } catch (err: any) {
      setError(err?.message || "Failed to create certificate");
      setLoading(false);
    }
  };

  return (
    <div className="rs-container py-14 space-y-10">
      <div className="rs-card p-8 md:p-10 bg-gradient-to-br from-emerald-50 to-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <span className="rs-chip flex items-center gap-2">
              <Award className="h-4 w-4" /> {tc("certificatesHub")}
            </span>
            <h1 className="text-3xl font-semibold text-emerald-900">{t("certificates")}</h1>
            <p className="text-slate-600 max-w-2xl">
              {tc("certificatesDescription") || "Telangana Road Safety Month issues official certificates in eight categories. Each template carries the Telangana emblem, minister signature, dynamic personalisation, and a verification-ready reference ID."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/certificates/regional" className="rs-btn-primary">
              <Sparkles className="h-4 w-4" /> {i18n.language === "te" ? "కరీంనగర్ ప్రాంతీయ సర్టిఫికేట్" : "Karimnagar Regional Certificate"}
            </Link>
          </div>
        </div>
      </div>

      <div className="rs-table-wrapper">
        <table className="rs-table text-sm min-w-[640px]">
          <thead>
            <tr>
              <th className="text-left">{tc("code") || "Code"}</th>
              <th className="text-left">{tc("certificateTitle") || "Certificate Title"}</th>
              <th className="text-left">{tc("purposeEligibleRecipient") || "Purpose / Eligible Recipient"}</th>
            </tr>
          </thead>
          <tbody>
            {getCertificateList(tc).map((item) => (
              <tr key={item.code}>
                <td className="font-semibold text-emerald-700">{item.code}</td>
                <td className="font-medium text-emerald-900">{item.title}</td>
                <td className="text-slate-600">{item.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500 sm:hidden">
        {tc("tipDragSideways") || "Tip: drag sideways to view the full certificate table."}
      </p>

      <div className="rs-card p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-emerald-900">
              {i18n.language === "te" ? "ఆఫ్లైన్ ఈవెంట్ సర్టిఫికేట్" : "Offline Event Certificate"}
            </h2>
            <p className="text-sm text-slate-600">
              {i18n.language === "te"
                ? "ఆర్గనైజర్ ఈవెంట్ రిఫరెన్స్ IDతో ఆఫ్లైన్ ఈవెంట్లకు సర్టిఫికేట్‌ను సృష్టించండి."
                : "Create a certificate for offline events using the organizer's event reference ID."}
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleOfflineSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="fullName" className="text-sm font-semibold text-emerald-900">
              {i18n.language === "te" ? "పూర్తి పేరు *" : "Full Name *"}
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={i18n.language === "te" ? "పాల్గొనేవారి పేరు" : "Participant name"}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="institution" className="text-sm font-semibold text-emerald-900">
              {i18n.language === "te" ? "సంస్థ (ఐచ్చికం)" : "Institution (optional)"}
            </Label>
            <Input
              id="institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder={i18n.language === "te" ? "పాఠశాల / కళాశాల / సంస్థ" : "School / College / Organization"}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="eventRef" className="text-sm font-semibold text-emerald-900">
              {i18n.language === "te" ? "ఈవెంట్ రిఫరెన్స్ ID *" : "Event Reference ID *"}
            </Label>
            <Input
              id="eventRef"
              value={eventRef}
              onChange={(e) => setEventRef(e.target.value)}
              placeholder="KRMR-RSM-2026-PDL-RHL-EVT-00001"
              required
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="userEmail" className="text-sm font-semibold text-emerald-900">
              {i18n.language === "te" ? "ఇమెయిల్ (ఐచ్చికం)" : "Email (optional)"}
            </Label>
            <Input
              id="userEmail"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="md:col-span-2">
            <Button
              type="submit"
              className="rs-btn-primary w-full md:w-auto"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                  {i18n.language === "te" ? "సృష్టిస్తోంది..." : "Generating..."}
                </>
              ) : (
                <>
                  <Award className="h-4 w-4" /> {i18n.language === "te" ? "సర్టిఫికేట్ సృష్టించండి" : "Generate & Download"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="rs-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-emerald-900">{tc("needToVerifyCertificate") || "Need to verify a certificate?"}</h2>
          <p className="text-sm text-slate-600">{tc("useReferenceIdToVerify") || "Use the reference ID printed on the certificate to confirm its authenticity."}</p>
        </div>
        <Link href="/certificates/generate" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
          {tc("generateOrVerifyNow") || "Generate or verify now"} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}





