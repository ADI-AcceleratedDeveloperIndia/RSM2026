"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalDistricts: 0,
    avgScore: 0,
    bestDistrict: "N/A",
    worstDistrict: "N/A",
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDistricts() {
      try {
        const res = await fetch("/api/gov/districts");
        if (res.ok) {
          const data = await res.json();
          if (data.districts && data.districts.length > 0) {
            setDistricts(
              data.districts.map((d: any, i: number) => ({
                id: d.code || i + 1,
                rank: d.rank || i + 1,
                name: d.name,
                code: d.code,
                score: d.score || 0,
                grade: d.grade || "N/A",
                participants: d.participants || 0,
                events: d.events || 0,
                actions: d.actions || 0,
                hazards: d.hazards || 0,
              }))
            );
            if (data.summary) {
              setSummary(data.summary);
            }
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Failed loading from /api/gov/districts, fetching setup list:", err);
      }

      // Secondary fallback to setup districts with real 0 stats
      try {
        const setupRes = await fetch("/api/gov/setup/districts");
        if (setupRes.ok) {
          const setupData = await setupRes.json();
          if (setupData.districts && setupData.districts.length > 0) {
            setDistricts(
              setupData.districts.map((d: any, i: number) => ({
                id: d.code || i + 1,
                rank: i + 1,
                name: d.name,
                code: d.code,
                score: 0,
                grade: "N/A",
                participants: d.totalParticipants || 0,
                events: d.totalEvents || 0,
                actions: d.totalActions || 0,
                hazards: d.totalHazards || 0,
              }))
            );
            setSummary({
              totalDistricts: setupData.districts.length,
              avgScore: 0,
              bestDistrict: setupData.districts[0]?.name || "N/A",
              worstDistrict: "N/A",
            });
          }
        }
      } catch (e) {
        console.error("Districts load failure:", e);
      } finally {
        setLoading(false);
      }
    }
    loadDistricts();
  }, []);

  const filteredDistricts = districts.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.code && d.code.toLowerCase().includes(search.toLowerCase()))
  );

  const getGradeColor = (grade: string) => {
    if (grade.includes("A")) return "bg-green-100 text-green-800";
    if (grade.includes("B")) return "bg-blue-100 text-blue-800";
    if (grade.includes("C")) return "bg-yellow-100 text-yellow-800";
    if (grade.includes("D")) return "bg-orange-100 text-orange-800";
    return "bg-slate-100 text-slate-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">District Performance</h2>
          <p className="text-slate-500 mt-1">
            Monitor real-time safety metrics across all {districts.length > 0 ? districts.length : ""} administrative districts
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 font-medium">Total Districts</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{summary.totalDistricts}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 font-medium">State Avg Score</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{summary.avgScore}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 font-medium">Top Performer</p>
            <p className="text-lg font-bold text-slate-900 mt-1 truncate">
              {summary.bestDistrict || districts[0]?.name || "-"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500 font-medium">Needs Attention</p>
            <p className="text-lg font-bold text-red-600 mt-1 truncate">
              {summary.worstDistrict || districts[districts.length - 1]?.name || "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-200 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search districts by name or code..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-slate-300"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">
                  <div className="flex items-center gap-1">Rank <ArrowUpDown size={14} /></div>
                </th>
                <th className="px-6 py-3 font-medium">District</th>
                <th className="px-6 py-3 font-medium">
                  <div className="flex items-center gap-1">Score <ArrowUpDown size={14} /></div>
                </th>
                <th className="px-6 py-3 font-medium">Grade</th>
                <th className="px-6 py-3 font-medium text-right">Participants</th>
                <th className="px-6 py-3 font-medium text-right">Events</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
                <th className="px-6 py-3 font-medium text-right">Hazards</th>
              </tr>
            </thead>
            <tbody>
              {filteredDistricts.map((d) => (
                <tr 
                  key={d.id} 
                  className="bg-white border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">#{d.rank}</td>
                  <td className="px-6 py-4 font-medium text-indigo-600 hover:underline">
                    <Link href={`/gov/districts/${d.code || d.name}`}>
                      {d.name} {d.code ? `(${d.code})` : ""}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{d.score}</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full">
                        <div 
                          className={cn("h-1.5 rounded-full", d.score >= 80 ? "bg-green-500" : d.score >= 60 ? "bg-yellow-500" : d.score > 0 ? "bg-red-500" : "bg-slate-300")} 
                          style={{ width: `${d.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2.5 py-1 rounded-md font-bold text-xs", getGradeColor(d.grade))}>
                      {d.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600 font-mono">{(d.participants || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-slate-600 font-mono">{(d.events || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-slate-600 font-mono">{(d.actions || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-slate-600 font-mono">{(d.hazards || 0).toLocaleString()}</td>
                </tr>
              ))}
              {filteredDistricts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    {loading ? "Loading live district metrics..." : `No districts found matching "${search}"`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
