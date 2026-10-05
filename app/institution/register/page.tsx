"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DISTRICT_NAMES } from "@/lib/districts";

export default function RegisterInstitutionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "school",
    district: "Hyderabad",
    address: "",
    pincode: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    organizerId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/institutions/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register institution");
      }

      setSuccess(data.institutionId);
      setTimeout(() => {
        router.push(`/institution/${data.institutionId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rs-container py-12 max-w-2xl">
      <Link href="/institution" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-700 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Institutions Directory
      </Link>

      <div className="space-y-6">
        <div>
          <span className="rs-chip bg-indigo-100 text-indigo-800">Onboarding</span>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">Register Educational Institution</h1>
          <p className="text-slate-600 text-sm mt-1">
            Enlist your school, college, or university to participate in statewide road safety activities, establish a Road Safety Club, and earn official accreditation.
          </p>
        </div>

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold">Institution Registered Successfully!</p>
              <p className="text-sm font-mono mt-0.5">Assigned Institution ID: {success}. Redirecting to profile...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Institution Information</CardTitle>
            <CardDescription>Provide institutional and contact coordinator details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Institution Full Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Hyderabad Public School, JNTU Hyderabad"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="border-slate-300"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Institution Category *</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border border-slate-300 rounded-md text-sm p-2 bg-white text-slate-700 h-10"
                    required
                  >
                    <option value="school">School (High School)</option>
                    <option value="college">Junior / Degree College</option>
                    <option value="university">University / Engineering</option>
                    <option value="ngo">NGO / Social Organization</option>
                    <option value="corporate">Corporate / Transport Firm</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <select
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full border border-slate-300 rounded-md text-sm p-2 bg-white text-slate-700 h-10"
                    required
                  >
                    {DISTRICT_NAMES.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="address">Campus Address</Label>
                  <Input
                    id="address"
                    placeholder="Campus street address, locality"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    placeholder="e.g. 500001"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Safety Coordinator / Point of Contact</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Coordinator Name *</Label>
                    <Input
                      id="contactPerson"
                      placeholder="Principal / Physical Director / Club Lead"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      required
                      className="border-slate-300"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Official Email *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="coordinator@school.edu.in"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        required
                        className="border-slate-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone *</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        required
                        className="border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <Link href="/institution">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={loading} className="rs-btn-primary">
                  {loading ? "Registering..." : "Submit Institutional Registration"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
