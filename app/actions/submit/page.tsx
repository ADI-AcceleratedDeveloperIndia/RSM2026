"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Target, ArrowLeft, CheckCircle2, 
  GraduationCap, Wrench, Shield, Siren, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DISTRICT_NAMES } from "@/lib/districts";
import { FOUR_E_CATEGORIES, FourECategory } from "@/lib/fourE";

export default function SubmitActionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fourECategory: "education" as FourECategory,
    actionType: "individual",
    priority: "medium",
    submittedBy: "",
    district: "Hyderabad",
    targetDate: "",
    estimatedBeneficiaries: 25,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/actions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit action commitment");
      }

      setSuccess(data.actionId);
      setTimeout(() => {
        router.push(`/actions/${data.actionId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rs-container py-12 max-w-3xl">
      <Link href="/actions" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-700 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Action Tracker
      </Link>

      <div className="space-y-6">
        <div>
          <span className="rs-chip bg-emerald-100 text-emerald-800">Action Commitment</span>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">Commit to a Road Safety Action</h1>
          <p className="text-slate-600 text-sm mt-1">
            Commit to a tangible road safety initiative. Once registered, you will receive an official Action Reference ID to log milestones and upload evidence.
          </p>
        </div>

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold">Action Commitment Registered!</p>
              <p className="text-sm font-mono mt-0.5">Reference ID: {success}. Redirecting to action dashboard...</p>
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
            <CardTitle>Action Details</CardTitle>
            <CardDescription>Select the 4E pillar and describe your safety initiative</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 4E Category Selector */}
              <div className="space-y-2">
                <Label>Choose 4E Category</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {FOUR_E_CATEGORIES.map((cat) => {
                    const isSelected = formData.fourECategory === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setFormData({ ...formData, fourECategory: cat.id })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <p className="font-semibold text-xs text-slate-900">{cat.label}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{cat.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Action Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Helmet Awareness Drive at School Gate, Pothole Escalation on MG Road"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="border-slate-300"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Explain what action you plan to execute, key steps, and how you will document evidence..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-slate-300"
                />
              </div>

              {/* Initiator & District */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="submittedBy">Your Name / Organization *</Label>
                  <Input
                    id="submittedBy"
                    placeholder="Full Name or Institution Name"
                    value={formData.submittedBy}
                    onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })}
                    required
                    className="border-slate-300"
                  />
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

              {/* Action Type, Priority & Beneficiaries */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actionType">Action Type</Label>
                  <select
                    id="actionType"
                    value={formData.actionType}
                    onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
                    className="w-full border border-slate-300 rounded-md text-sm p-2 bg-white text-slate-700 h-10"
                  >
                    <option value="individual">Individual Citizen</option>
                    <option value="institutional">School / College</option>
                    <option value="government">Department / NGO</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full border border-slate-300 rounded-md text-sm p-2 bg-white text-slate-700 h-10"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beneficiaries">Est. Beneficiaries</Label>
                  <Input
                    id="beneficiaries"
                    type="number"
                    min={1}
                    value={formData.estimatedBeneficiaries}
                    onChange={(e) => setFormData({ ...formData, estimatedBeneficiaries: parseInt(e.target.value, 10) || 1 })}
                    className="border-slate-300"
                  />
                </div>
              </div>

              {/* Target Date */}
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Completion Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="border-slate-300"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <Link href="/actions">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={loading} className="rs-btn-primary">
                  {loading ? "Registering Commitment..." : "Submit Action Commitment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
