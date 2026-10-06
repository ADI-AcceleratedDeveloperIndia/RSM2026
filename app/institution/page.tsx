"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building2, PlusCircle, Search, MapPin, 
  CheckCircle2, Users, Calendar, Target, ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DISTRICT_NAMES } from "@/lib/districts";

interface InstitutionItem {
  _id: string;
  institutionId: string;
  name: string;
  type: string;
  district: string;
  contactPerson: string;
  status: "active" | "inactive" | "verified";
  totalParticipants: number;
  totalEvents: number;
  totalActions: number;
  createdAt: string;
}

export default function InstitutionsDirectoryPage() {
  const [institutions, setInstitutions] = useState<InstitutionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    loadInstitutions();
  }, [selectedDistrict, selectedType]);

  const loadInstitutions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDistrict !== "all") params.set("district", selectedDistrict);
      if (selectedType !== "all") params.set("type", selectedType);
      if (search) params.set("search", search);

      const res = await fetch(`/api/institutions/list?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInstitutions(data.institutions || []);
      }
    } catch (err) {
      console.error("Error loading institutions:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rs-container py-12 space-y-8">
      {/* Header */}
      <div className="rs-card p-8 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 border border-indigo-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rs-chip bg-indigo-100 text-indigo-800">Institutions Portal</span>
              <span className="rs-chip bg-emerald-100 text-emerald-800">Schools & Colleges</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Institutions & Road Safety Clubs</h1>
            <p className="text-slate-600 max-w-2xl text-sm sm:text-base">
              Educational institutions and universities leading road safety campaigns, safety pledges, and verified community interventions across all districts.
            </p>
          </div>
          <Link href="/institution/register" className="shrink-0">
            <Button className="rs-btn-primary gap-2 text-base px-6 py-6 shadow-lg shadow-emerald-700/20">
              <PlusCircle className="h-5 w-5" />
              Register Institution
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Search by school, college, or coordinator name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadInstitutions()}
            className="pl-9 bg-white border-slate-300"
          />
        </div>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="border border-slate-300 rounded-md text-sm p-2 bg-white text-slate-700 min-w-[160px]"
        >
          <option value="all">All Districts</option>
          {DISTRICT_NAMES.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="border border-slate-300 rounded-md text-sm p-2 bg-white text-slate-700 min-w-[140px]"
        >
          <option value="all">All Types</option>
          <option value="school">School</option>
          <option value="college">College</option>
          <option value="university">University</option>
          <option value="ngo">NGO</option>
          <option value="corporate">Corporate</option>
        </select>
        <Button onClick={loadInstitutions} variant="outline" className="shrink-0">
          Search
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">Loading participating institutions...</div>
      ) : institutions.length === 0 ? (
        <div className="rs-card p-12 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">No institutions registered yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Enroll your school or college to participate in Road Safety Month, receive recognition, and track club activities.
          </p>
          <Link href="/institution/register">
            <Button className="rs-btn-primary mt-2">Register Your Institution</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {institutions.map((inst) => (
            <Link key={inst._id} href={`/institution/${inst.institutionId}`} className="block group">
              <div className="rs-card p-5 h-full flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-indigo-300 group-hover:-translate-y-0.5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="capitalize text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                      {inst.type}
                    </span>
                    {inst.status === "verified" ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600" /> Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-2">
                    {inst.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" /> {inst.district} District
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-indigo-700 font-medium">{inst.institutionId}</span>
                    <span className="text-slate-400">POC: {inst.contactPerson}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 pt-1">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Users className="h-3.5 w-3.5 text-slate-400" /> {inst.totalParticipants || 0} participants
                    </span>
                    <span className="text-indigo-600 font-medium flex items-center gap-1 group-hover:underline">
                      View profile <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
