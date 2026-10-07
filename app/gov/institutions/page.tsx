"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Building2, CheckCircle, Search, MapPin, 
  Users, Award, Eye, Check, X, PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DISTRICT_NAMES } from "@/lib/districts";

function InstitutionsContent() {
  const searchParams = useSearchParams();
  const districtParam = searchParams.get("district");

  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState(districtParam || "all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  useEffect(() => {
    if (districtParam) {
      setDistrictFilter(districtParam);
    }
  }, [districtParam]);

  useEffect(() => {
    loadInstitutions();
  }, [statusFilter, districtFilter, typeFilter]);

  const loadInstitutions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (districtFilter !== "all") params.set("district", districtFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/institutions/list?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInstitutions(data.institutions || []);
      }
    } catch (err) {
      console.error("Error loading gov institutions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (institutionId: string) => {
    if (!confirm("Accredit this institution for Road Safety Month?")) return;
    setVerifyingId(institutionId);
    try {
      const res = await fetch(`/api/institutions/${institutionId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verifiedBy: "Government Mission Control Officer" }),
      });
      if (!res.ok) throw new Error("Failed to verify institution");
      loadInstitutions();
    } catch (err: any) {
      alert(err.message || "Error verifying institution");
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Institutions & Road Safety Clubs</h2>
          <p className="text-sm text-slate-500">
            Oversee educational institution compliance, approve Safety Club accreditations, and track student outreach.
          </p>
        </div>
        <Link href="/institution/register" target="_blank">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-xs">
            <PlusCircle className="h-4 w-4" /> Enroll New Institution
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            placeholder="Search by school/college name, ID, or POC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadInstitutions()}
            className="pl-9 bg-white border-slate-300"
          />
        </div>
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="border border-slate-300 rounded-md text-sm p-2 bg-white text-slate-700 min-w-[150px]"
        >
          <option value="all">All Districts</option>
          {DISTRICT_NAMES.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-slate-300 rounded-md text-sm p-2 bg-white text-slate-700 min-w-[130px]"
        >
          <option value="all">All Types</option>
          <option value="school">School</option>
          <option value="college">College</option>
          <option value="university">University</option>
          <option value="ngo">NGO</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-slate-300 rounded-md text-sm p-2 bg-white text-slate-700 min-w-[130px]"
        >
          <option value="all">All Statuses</option>
          <option value="active">Pending Review</option>
          <option value="verified">Verified</option>
        </select>
        <Button onClick={loadInstitutions} variant="outline">Filter</Button>
      </div>

      {/* Institutions Table */}
      <Card className="border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Institution ID & Name</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">District</th>
                <th className="px-6 py-3 font-medium">Coordinator Contact</th>
                <th className="px-6 py-3 font-medium text-center">Participants</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Loading institutions...
                  </td>
                </tr>
              ) : institutions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No institutions match the current filters.
                  </td>
                </tr>
              ) : (
                institutions.map((inst) => (
                  <tr key={inst._id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold text-indigo-700 block">{inst.institutionId}</span>
                      <span className="font-semibold text-slate-900 mt-0.5 block">{inst.name}</span>
                    </td>
                    <td className="px-6 py-4 capitalize text-xs font-semibold text-slate-700">
                      {inst.type}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{inst.district}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      <p className="font-medium text-slate-800">{inst.contactPerson}</p>
                      <p className="text-slate-400">{inst.contactEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-800">
                      {inst.totalParticipants || 0}
                    </td>
                    <td className="px-6 py-4">
                      {inst.status === "verified" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                          <CheckCircle className="h-3 w-3 text-green-600" /> Accredited
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 w-fit block">
                          Active (Pending)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/institution/${inst.institutionId}`} target="_blank">
                        <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs">
                          <Eye className="h-3.5 w-3.5 mr-1" /> Profile
                        </Button>
                      </Link>
                      {inst.status !== "verified" && (
                        <Button
                          size="sm"
                          disabled={verifyingId === inst.institutionId}
                          onClick={() => handleVerify(inst.institutionId)}
                          className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Accredit
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function GovInstitutionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading institutions directory...</div>}>
      <InstitutionsContent />
    </Suspense>
  );
}
