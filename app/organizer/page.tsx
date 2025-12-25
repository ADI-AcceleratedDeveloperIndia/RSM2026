"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock, XCircle, Copy, Check } from "lucide-react";

type OrganizerStatus = "pending" | "approved" | "rejected" | null;

export default function OrganizerPage() {
  const { t, i18n } = useTranslation("common");
  const [mode, setMode] = useState<"register" | "check">("register");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    institution: "",
    designation: "",
  });
  const [temporaryId, setTemporaryId] = useState<string | null>(null);
  const [checkId, setCheckId] = useState("");
  const [status, setStatus] = useState<OrganizerStatus>(null);
  const [finalId, setFinalId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/organizer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setTemporaryId(data.temporaryId);
        setMode("check");
        setCheckId(data.temporaryId);
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (error) {
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!checkId.trim()) {
      alert("Please enter your Temporary Organizer ID");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/organizer/status?temporaryId=${checkId}`);
      const data = await response.json();
      if (response.ok) {
        setStatus(data.status);
        setFinalId(data.finalId || null);
      } else {
        alert(data.error || "Failed to check status");
      }
    } catch (error) {
      alert("Failed to check status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (temporaryId && mode === "check") {
    return (
      <div className="rs-container py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>
                {i18n.language === "te"
                  ? "రిజిస్ట్రేషన్ విజయవంతం!"
                  : "Registration Successful!"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>
                    {i18n.language === "te"
                      ? "తాత్కాలిక ఆర్గనైజర్ ID"
                      : "Temporary Organizer ID"}
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input value={temporaryId} readOnly />
                    <Button
                      onClick={() => copyToClipboard(temporaryId)}
                      variant="outline"
                      size="icon"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    {i18n.language === "te"
                      ? "ఈ ID ని సేవ్ చేసుకోండి. స్టేటస్ తనిఖీ చేయడానికి ఉపయోగించండి."
                      : "Please save this ID. Use it to check your approval status."}
                  </p>
                </div>
                <Button onClick={handleCheckStatus} className="w-full">
                  {i18n.language === "te" ? "స్టేటస్ తనిఖీ చేయండి" : "Check Status Now"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "approved" && finalId) {
    return (
      <div className="rs-container py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
                {i18n.language === "te"
                  ? "ఆమోదించబడింది!"
                  : "Approved!"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>
                    {i18n.language === "te"
                      ? "ఫైనల్ ఆర్గనైజర్ ID"
                      : "Final Organizer ID"}
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input value={finalId} readOnly />
                    <Button
                      onClick={() => copyToClipboard(finalId)}
                      variant="outline"
                      size="icon"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-emerald-600">
                  {i18n.language === "te"
                    ? "మీరు ఇప్పుడు ఈవెంట్‌లను సృష్టించవచ్చు."
                    : "You can now create events."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="rs-container py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <Clock className="h-5 w-5" />
                {i18n.language === "te"
                  ? "సమీక్షలో"
                  : "Under Review"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                {i18n.language === "te"
                  ? "మీ అప్లికేషన్ అడ్మిన్ సమీక్షలో ఉంది. దయచేసి కొంత సమయం తర్వాత మళ్లీ తనిఖీ చేయండి."
                  : "Your application is under admin review. Please check back later."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="rs-container py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                {i18n.language === "te"
                  ? "తిరస్కరించబడింది"
                  : "Rejected"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                {i18n.language === "te"
                  ? "క్షమించండి, మీ అప్లికేషన్ ఆమోదించబడలేదు."
                  : "Sorry, your application was not approved."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="rs-container py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">
            {i18n.language === "te"
              ? "ఆర్గనైజర్ రిజిస్ట్రేషన్"
              : "Organizer Registration"}
          </h1>
          <p className="text-slate-600">
            {i18n.language === "te"
              ? "ఈవెంట్‌లను నిర్వహించడానికి ఆర్గనైజర్ గా నమోదు చేసుకోండి"
              : "Register as an organizer to manage events"}
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            variant={mode === "register" ? "default" : "outline"}
            onClick={() => setMode("register")}
          >
            {i18n.language === "te" ? "నమోదు" : "Register"}
          </Button>
          <Button
            variant={mode === "check" ? "default" : "outline"}
            onClick={() => setMode("check")}
          >
            {i18n.language === "te" ? "స్టేటస్ తనిఖీ" : "Check Status"}
          </Button>
        </div>

        {mode === "register" ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {i18n.language === "te"
                  ? "ఆర్గనైజర్ స్వీయ-నమోదు"
                  : "Organizer Self-Registration"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">
                    {i18n.language === "te" ? "పూర్తి పేరు" : "Full Name"} *
                  </Label>
                  <Input
                    id="fullName"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">
                    {i18n.language === "te" ? "ఇమెయిల్" : "Email"} *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="phone">
                    {i18n.language === "te" ? "ఫోన్" : "Phone"} *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="institution">
                    {i18n.language === "te" ? "సంస్థ" : "Institution"} *
                  </Label>
                  <Input
                    id="institution"
                    required
                    value={formData.institution}
                    onChange={(e) =>
                      setFormData({ ...formData, institution: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="designation">
                    {i18n.language === "te" ? "హోదా" : "Designation"} *
                  </Label>
                  <Input
                    id="designation"
                    required
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({ ...formData, designation: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? i18n.language === "te"
                      ? "నమోదు చేస్తోంది..."
                      : "Registering..."
                    : i18n.language === "te"
                    ? "నమోదు చేయండి"
                    : "Register"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>
                {i18n.language === "te"
                  ? "స్టేటస్ తనిఖీ"
                  : "Check Status"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>
                    {i18n.language === "te"
                      ? "తాత్కాలిక ఆర్గనైజర్ ID"
                      : "Temporary Organizer ID"}
                  </Label>
                  <Input
                    value={checkId}
                    onChange={(e) => setCheckId(e.target.value)}
                    placeholder="TEMP-ORG-..."
                    className="mt-2"
                  />
                </div>
                <Button onClick={handleCheckStatus} className="w-full" disabled={loading}>
                  {loading
                    ? i18n.language === "te"
                      ? "తనిఖీ చేస్తోంది..."
                      : "Checking..."
                    : i18n.language === "te"
                    ? "తనిఖీ చేయండి"
                    : "Check Status"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


