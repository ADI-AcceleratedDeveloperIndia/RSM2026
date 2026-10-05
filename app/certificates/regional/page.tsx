"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Award, MapPin, User, Building2, Loader2, CheckCircle2 } from "lucide-react";
import { getRegionalAuthority } from "@/lib/regional";
import Image from "next/image";

export default function RegionalCertificatesPage() {
  const { t, i18n } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  const router = useRouter();
  const regionalAuthority = getRegionalAuthority("karimnagar");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    institution: "",
    organizerReferenceId: "",
    userEmail: "",
  });

  if (!regionalAuthority) {
    return (
      <div className="rs-container py-20 flex flex-col items-center gap-4 text-center">
        <p className="text-slate-600">Regional authority not found</p>
        <Button onClick={() => router.push("/")}>Go to Home</Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create certificate with regional authority info
      const response = await fetch("/api/certificates/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PARTICIPANT", // Regional events are participant certificates
          fullName: formData.fullName,
          institution: formData.institution || undefined,
          score: 100, // Regional events get full score
          total: 100,
          activityType: "online", // Regional event participation
          organizerReferenceId: formData.organizerReferenceId || undefined,
          userEmail: formData.userEmail || undefined,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        // Redirect to preview with certificate ID and regional authority info
        router.push(
          `/certificates/preview?certId=${result.certificateId}&regional=true`
        );
      } else {
        alert(result.error || "Failed to create certificate");
      }
    } catch (error) {
      alert("Failed to create certificate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rs-container py-14 space-y-8">
      <div className="rs-card p-8 bg-gradient-to-br from-emerald-50 to-white">
        <div className="space-y-3">
          <span className="rs-chip flex items-center gap-2">
            <Award className="h-4 w-4" /> {i18n.language === "te" ? "ప్రాంతీయ సర్టిఫికేట్‌లు" : "Regional Event Certificates"}
          </span>
          <h1 className="text-3xl font-semibold text-emerald-900">
            {i18n.language === "te"
              ? "ప్రాంతీయ రోడ్ సేఫ్టీ ఈవెంట్ సర్టిఫికేట్‌లు"
              : "Regional Road Safety Event Certificates"}
          </h1>
          <p className="text-slate-600 max-w-2xl">
            {i18n.language === "te"
              ? "కరీంనగర్ జిల్లా రోడ్ సేఫ్టీ మాస్ కార్యక్రమాలలో పాల్గొన్నవారికి అధికారిక సర్టిఫికేట్‌లు. ఈ సర్టిఫికేట్‌లు ప్రాంతీయ రవాణా అధికారి (RTA) సంతకంతో జారీ చేయబడతాయి."
              : "Official certificates for participants in Karimnagar district Road Safety Month events. These certificates are issued with the Regional Transport Authority (RTA) member signature."}
          </p>
        </div>
      </div>

      {/* Regional Authority Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            {regionalAuthority.district}
          </CardTitle>
          <CardDescription>{regionalAuthority.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {regionalAuthority.photo && (
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-100">
                <Image
                  src={regionalAuthority.photo}
                  alt={regionalAuthority.officerName}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <p className="font-semibold text-emerald-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                {regionalAuthority.officerName}
              </p>
              <p className="text-sm text-slate-600">{regionalAuthority.officerTitle}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Generation Form */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {i18n.language === "te"
              ? "ప్రాంతీయ సర్టిఫికేట్ సృష్టించండి"
              : "Generate Regional Certificate"}
          </CardTitle>
          <CardDescription>
            {i18n.language === "te"
              ? "మీ వివరాలను నమోదు చేసి ప్రాంతీయ ఈవెంట్ సర్టిఫికేట్‌ను సృష్టించండి"
              : "Enter your details to create a regional event certificate"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold text-emerald-900">
                {i18n.language === "te" ? "పూర్తి పేరు" : "Full Name"} *
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="h-11 rounded-lg border border-emerald-200"
                placeholder={i18n.language === "te" ? "మీ పూర్తి పేరు నమోదు చేయండి" : "Enter your full name"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution" className="text-sm font-semibold text-emerald-900">
                {i18n.language === "te" ? "సంస్థ" : "Institution"} (Optional)
              </Label>
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="h-11 rounded-lg border border-emerald-200"
                placeholder={i18n.language === "te" ? "సంస్థ/పాఠశాల/కళాశాల" : "School/College/Organization"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizerReferenceId" className="text-sm font-semibold text-emerald-900">
                {i18n.language === "te" ? "ఈవెంట్ రిఫరెన్స్ ID" : "Event Reference ID"} (Optional)
              </Label>
              <Input
                id="organizerReferenceId"
                value={formData.organizerReferenceId}
                onChange={(e) => setFormData({ ...formData, organizerReferenceId: e.target.value })}
                className="h-11 rounded-lg border border-emerald-200 font-mono text-xs"
                placeholder="KRMR-RSM-2026-PDL-RHL-EVT-00001"
              />
              <p className="text-xs text-slate-500">
                {i18n.language === "te"
                  ? "మీరు పాల్గొన్న ఈవెంట్ యొక్క రిఫరెన్స్ ID (ఉంటే)"
                  : "Reference ID of the event you participated in (if applicable)"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userEmail" className="text-sm font-semibold text-emerald-900">
                {i18n.language === "te" ? "ఇమెయిల్" : "Email"} (Optional)
              </Label>
              <Input
                id="userEmail"
                type="email"
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                className="h-11 rounded-lg border border-emerald-200"
                placeholder="email@example.com"
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {i18n.language === "te" ? "సర్టిఫికేట్ వివరాలు" : "Certificate Details"}
              </p>
              <ul className="text-xs text-emerald-800 space-y-1 list-disc list-inside">
                <li>
                  {i18n.language === "te"
                    ? "ప్రాంతీయ రవాణా అధికారి (RTA) సంతకం"
                    : "Regional Transport Authority (RTA) Member signature"}
                </li>
                <li>
                  {i18n.language === "te"
                    ? "మంత్రి మరియు ప్రధాన కార్యదర్శి సంతకాలు"
                    : "Minister and Principal Secretary signatures"}
                </li>
                <li>
                  {i18n.language === "te"
                    ? "తెలంగాణ ఎంబ్లెమ్"
                    : "Telangana Emblem"}
                </li>
                <li>
                  {i18n.language === "te"
                    ? "ధృవీకరణ QR కోడ్"
                    : "Verification QR Code"}
                </li>
              </ul>
            </div>

            <Button type="submit" className="rs-btn-primary w-full justify-center" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                  {i18n.language === "te" ? "సృష్టిస్తోంది..." : "Creating..."}
                </>
              ) : (
                <>
                  <Award className="mr-2 h-5 w-5" />{" "}
                  {i18n.language === "te"
                    ? "సర్టిఫికేట్ సృష్టించండి"
                    : "Create Certificate"}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


