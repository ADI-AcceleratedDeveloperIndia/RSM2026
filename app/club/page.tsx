"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users } from "lucide-react";

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

const TELUGU_CONTENT = `క్లబ్

తెలంగాణ రాష్ట్రంలో ప్రతి పాఠశాల రోడ్డు భద్రతపై అవగాహన పెంచే బాధ్యత వహించాలని ప్రభుత్వం కోరుతోంది.
ఈ క్లబ్ ద్వారా విద్యార్థులు, తల్లిదండ్రులు మరియు సమాజంలో
రోడ్డు భద్రతా నియమాలపై అవగాహన కల్పించవచ్చు.

పాఠశాలలు తమ Organizer ID ఉపయోగించి
ఈ క్లబ్‌లో చేరి రోడ్డు భద్రతా కార్యక్రమాల్లో భాగస్వాములు కావచ్చు.`;

const ENGLISH_CONTENT = `Road Safety Club

The Government of Telangana encourages every school to take responsibility for raising road safety awareness.
Through this Club, schools can create awareness about road safety rules among students, parents, and the community.

Schools can join this Club using their Organizer ID and become partners in road safety programs.`;

export default function ClubPage() {
  const { i18n } = useTranslation("common");
  const [formData, setFormData] = useState({
    institutionName: "",
    district: "",
    pointOfContact: "",
    organizerId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.institutionName.trim() || !formData.district || 
        !formData.pointOfContact.trim() || !formData.organizerId.trim()) {
      setError(i18n.language === "te" ? "దయచేసి అన్ని ఫీల్డ్‌లను పూరించండి" : "Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/club/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to join club");
      }

      setSuccess(true);
      setFormData({
        institutionName: "",
        district: "",
        pointOfContact: "",
        organizerId: "",
      });
    } catch (err: any) {
      setError(err?.message || (i18n.language === "te" ? "చేరిక విఫలమైంది" : "Failed to join club"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rs-container py-14 space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-emerald-600" />
            <CardTitle className="text-2xl text-emerald-900">
              {i18n.language === "te" ? "క్లబ్" : "Road Safety Club"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Section */}
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <div className="space-y-4">
                <div className="whitespace-pre-line text-slate-700 text-sm leading-relaxed">
                  {i18n.language === "te" ? TELUGU_CONTENT : ENGLISH_CONTENT}
                </div>
              </div>
            </div>
          </div>

          {/* Join Club Form */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-emerald-900 mb-4">
              {i18n.language === "te" ? "క్లబ్‌లో చేరండి" : "Join the Club"}
            </h3>

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg mb-4">
                {i18n.language === "te" 
                  ? "క్లబ్‌లో విజయవంతంగా చేరారు! ధన్యవాదాలు." 
                  : "Successfully joined the Club! Thank you."}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="institutionName" className="text-sm font-semibold text-emerald-900">
                    {i18n.language === "te" ? "సంస్థ పేరు *" : "Institution Name *"}
                  </Label>
                  <Input
                    id="institutionName"
                    value={formData.institutionName}
                    onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district" className="text-sm font-semibold text-emerald-900">
                    {i18n.language === "te" ? "జిల్లా పేరు *" : "District Name *"}
                  </Label>
                  <select
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    required
                    className="h-11 w-full rounded-lg border border-emerald-200 px-3 text-sm focus:border-emerald-500 focus:outline-none"
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

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pointOfContact" className="text-sm font-semibold text-emerald-900">
                    {i18n.language === "te" ? "సంప్రదింపు వ్యక్తి పేరు *" : "Point of Contact Name *"}
                  </Label>
                  <Input
                    id="pointOfContact"
                    value={formData.pointOfContact}
                    onChange={(e) => setFormData({ ...formData, pointOfContact: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizerId" className="text-sm font-semibold text-emerald-900">
                    {i18n.language === "te" ? "ఆర్గనైజర్ ID *" : "Organizer ID *"}
                  </Label>
                  <Input
                    id="organizerId"
                    value={formData.organizerId}
                    onChange={(e) => setFormData({ ...formData, organizerId: e.target.value })}
                    placeholder="KRMR-RSM-2026-PDL-RHL-ORGANIZER-00001"
                    required
                    className="h-11 font-mono text-xs"
                  />
                  <p className="text-xs text-slate-500">
                    {i18n.language === "te" 
                      ? "మీ ఈవెంట్ సృష్టించేటప్పుడు పొందిన ఆర్గనైజర్ ID" 
                      : "Organizer ID received when creating events"}
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto rs-btn-primary h-12"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    {i18n.language === "te" ? "సమర్పిస్తోంది..." : "Submitting..."}
                  </>
                ) : (
                  i18n.language === "te" ? "క్లబ్‌లో చేరండి" : "Join Club"
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

