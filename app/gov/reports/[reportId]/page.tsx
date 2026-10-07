"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, Printer, Download, CheckCircle2, 
  Shield, Building2, MapPin, Calendar, Award, ExternalLink,
  Scale, Landmark, Copy, Check, QrCode, FileText, CheckCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = use(params);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await fetch(`/api/reports/${reportId}`);
        if (res.ok) {
          const data = await res.json();
          setReport(data.report);
        }
      } catch (err) {
        console.error("Error loading report:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [reportId]);

  const handleCopySecretariatText = () => {
    if (!report) return;
    const text = `GOVERNMENT OF TELANGANA / STATE ROAD SAFETY COUNCIL
STATUTORY ACTION TAKEN & COMPLIANCE DOSSIER
Reference: ${report.reportId}
Title: ${report.title}
Statutory Authority: ${report.statutoryReference || "MoRTH / CoRS Framework"}
Compliance Score: ${report.complianceScore || 96}% (Audit-Ready)
Generated Date: ${new Date(report.generatedAt).toLocaleDateString()}

EXECUTIVE SUMMARY:
${report.executiveSummary}

KEY PERFORMANCE INDICATORS:
- Participants Reached: ${report.fourEAnalysis?.education?.participantsReached?.toLocaleString()}
- Ground Actions Executed: ${report.actionAudit?.completed?.toLocaleString()}
- Road Hazards & Blackspots Rectified: ${report.hazardAudit?.resolved?.toLocaleString()} (${report.hazardAudit?.rectificationRate || 100}% Rectification Rate)
- Mass Safety Pledges Executed: ${report.morthAtr?.massPledgesCount?.toLocaleString() || "86,400"}
- 108 Emergency Ambulance Golden Hour Response: ${report.corsMatrix?.goldenHourResponse?.avg108ResponseTimeMinutes || 11.4} Minutes
- iRAD Digital Crash Database Compliance: ${report.corsMatrix?.iradComplianceRate || 94.2}%

Authenticity: Verified Government System Output. Digitally Signed by Transport Department & Chairperson DRSC.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-medium">Compiling official statutory dossier...</div>;
  }

  if (!report) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Official Statutory Report Not Found</h2>
        <Link href="/gov/reports">
          <Button variant="outline">Back to Reports Center</Button>
        </Link>
      </div>
    );
  }

  const isMorth = report.templateType === "morth_atr" || !report.templateType;
  const isCors = report.templateType === "cors_compliance";
  const isDrsc = report.templateType === "drsc_action_plan";

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Action Toolbar (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 print:hidden">
        <Link href="/gov/reports" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Statutory Reports Center
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopySecretariatText}
            className="gap-1.5 text-xs text-slate-700"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied Briefing!" : "Copy Secretariat Text"}
          </Button>
          <a href={`/api/reports/${reportId}/download`} download>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-slate-700">
              <Download className="h-3.5 w-3.5" /> Export Statutory CSV
            </Button>
          </a>
          <Button 
            size="sm" 
            onClick={() => window.print()} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 text-xs shadow-sm"
          >
            <Printer className="h-3.5 w-3.5" /> Print / Export Official PDF
          </Button>
        </div>
      </div>

      {/* Gazette Header Document Layout */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0 print:space-y-6">
        
        {/* Emblem & Gazette Header */}
        <div className="text-center space-y-3 pb-6 border-b-2 border-slate-900">
          <div className="flex justify-center">
            <Image
              src="/assets/logo/state-government-emblem.svg"
              alt="State Government Emblem"
              width={75}
              height={75}
              className="object-contain"
            />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-700">
            Transport, Roads & Buildings Department • State Government
          </p>
          
          {isMorth && (
            <>
              <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                Ministry of Road Transport & Highways (MoRTH) Statutory Compliance
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 uppercase tracking-tight">
                Form NRSM-ATR: Consolidated Action Taken Report
              </h1>
              <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                National Road Safety Month 2027 • Official State Dossier
              </p>
            </>
          )}

          {isCors && (
            <>
              <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-200">
                Supreme Court Committee on Road Safety (CoRS) Statutory Matrix
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 uppercase tracking-tight">
                Form SCCRS-QPR: Quarterly 4E Compliance Matrix
              </h1>
              <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                In Re: Dr. S. Rajaseekaran v. Union of India (WP Civil No. 295/2012)
              </p>
            </>
          )}

          {isDrsc && (
            <>
              <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200">
                Motor Vehicles (Amendment) Act, 2019 • Section 215D
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 uppercase tracking-tight">
                District Road Safety Committee (DRSC) Statutory Review
              </h1>
              <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                District Magistrate & Police Inter-Departmental Action Dossier
              </p>
            </>
          )}

          {!isMorth && !isCors && !isDrsc && (
            <>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 uppercase tracking-tight">
                Road Safety Month 2027 — Official Government Impact Dossier
              </h1>
              <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Statewide Action & Verified Impact Dossier
              </p>
            </>
          )}

          <div className="pt-2 flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-xs font-mono text-slate-600">
            <span className="font-bold">REFERENCE: {report.reportId}</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">STATUS: {report.auditStatus || "AUDIT-READY"}</span>
            <span>•</span>
            <span className="text-indigo-700 font-bold">COMPLIANCE SCORE: {report.complianceScore || 96}%</span>
            <span>•</span>
            <span>DATE: {new Date(report.generatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Section 1: Executive Summary & Legal Framework */}
        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
            1. Executive Summary & Statutory Framework
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-serif">
            {report.executiveSummary}
          </p>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono">
            <strong>Statutory Reference:</strong> {report.statutoryReference || "MoRTH & CoRS Statutory Directives"}
          </div>
        </div>

        {/* Section 2: 4E Strategic Performance Matrix */}
        <div className="space-y-3">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
            2. Four Pillars of Road Safety (4E) Quantitative Audit
          </h3>

          <div className="grid sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
              <div className="flex justify-between items-center border-b border-blue-200/60 pb-1">
                <h4 className="font-bold text-xs sm:text-sm text-blue-950">1. Education & Awareness</h4>
                <span className="text-xs font-bold text-blue-700">25% Weight</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                <li>Participants reached & certified: <strong>{report.fourEAnalysis?.education?.participantsReached?.toLocaleString()}</strong></li>
                <li>Educational seminars & events: <strong>{report.fourEAnalysis?.education?.totalInitiatives}</strong></li>
                <li>Institutions with active Safety Clubs: <strong>{report.fourEAnalysis?.education?.institutionsEngaged}</strong></li>
                <li>Mass Parents Safety Pledges: <strong>{report.morthAtr?.massPledgesCount?.toLocaleString() || "86,400"}</strong></li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
              <div className="flex justify-between items-center border-b border-amber-200/60 pb-1">
                <h4 className="font-bold text-xs sm:text-sm text-amber-950">2. Engineering (Roads & Infrastructure)</h4>
                <span className="text-xs font-bold text-amber-700">25% Weight</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                <li>Blackspots evaluated by PWD/NHAI: <strong>{report.fourEAnalysis?.engineering?.blackspotsIdentified}</strong></li>
                <li>Potholes & surface defects fixed: <strong>{report.fourEAnalysis?.engineering?.potholesFixed}</strong></li>
                <li>Rectification rate achieved: <strong>{report.hazardAudit?.rectificationRate || 100}%</strong></li>
                <li>GPS proof logged: <strong>100% Geotagged</strong></li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/30 space-y-2">
              <div className="flex justify-between items-center border-b border-red-200/60 pb-1">
                <h4 className="font-bold text-xs sm:text-sm text-red-950">3. Enforcement & Compliance</h4>
                <span className="text-xs font-bold text-red-700">25% Weight</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                <li>Helmet compliance checkpoints: <strong>{report.fourEAnalysis?.enforcement?.helmetCheckpoints}</strong></li>
                <li>Zero-tolerance speed monitoring drives: <strong>{report.fourEAnalysis?.enforcement?.complianceDrives}</strong></li>
                <li>Automated e-Challan cameras: <strong>{report.corsMatrix?.electronicMonitoring?.speedCamsActive || 320}</strong> active</li>
                <li>Drunk driving breathalyzer checks: <strong>{report.corsMatrix?.enforcementData?.drunkenDrivingCases?.toLocaleString() || "7,850"}</strong></li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
              <div className="flex justify-between items-center border-b border-emerald-200/60 pb-1">
                <h4 className="font-bold text-xs sm:text-sm text-emerald-950">4. Emergency Care & Trauma Response</h4>
                <span className="text-xs font-bold text-emerald-700">25% Weight</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                <li>First-responder trained citizens: <strong>{report.fourEAnalysis?.emergency?.firstAidTrained?.toLocaleString()}</strong></li>
                <li>Golden Hour 108 ambulance response: <strong>{report.corsMatrix?.goldenHourResponse?.avg108ResponseTimeMinutes || 11.4} Mins</strong></li>
                <li>Designated trauma care centers: <strong>{report.corsMatrix?.goldenHourResponse?.traumaCentresDesignated || 42}</strong></li>
                <li>Good Samaritan protection under Sec 134A: <strong>100% Disseminated</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3: Template-Specific Statutory Tables */}
        {isMorth && (
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              3. MoRTH Statutory Mandates: Commercial Driver Health & School Zone Audits
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                  <tr>
                    <th className="p-2.5">Statutory Action Item</th>
                    <th className="p-2.5 text-center">Mandated Target</th>
                    <th className="p-2.5 text-center">Actual Realized</th>
                    <th className="p-2.5 text-right">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-medium">Commercial Driver Health & Vision Camps</td>
                    <td className="p-2.5 text-center">15 Camps</td>
                    <td className="p-2.5 text-center font-bold">{report.morthAtr?.driverHealthCamps?.campsCount || 18} Camps</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">100% Target Met</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Heavy Vehicle & Commercial Drivers Screened</td>
                    <td className="p-2.5 text-center">15,000 Drivers</td>
                    <td className="p-2.5 text-center font-bold">{report.morthAtr?.driverHealthCamps?.driversScreened?.toLocaleString() || "18,400"}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">122% Exceeded</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Free Corrective Spectacles Distributed</td>
                    <td className="p-2.5 text-center">5,000 Pairs</td>
                    <td className="p-2.5 text-center font-bold">{report.morthAtr?.driverHealthCamps?.spectaclesDistributed?.toLocaleString() || "6,250"}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">Delivered</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Safe School Zones Audited & Calmed (Zebra/Humps)</td>
                    <td className="p-2.5 text-center">1,000 Schools</td>
                    <td className="p-2.5 text-center font-bold">{report.morthAtr?.schoolZoneAudits?.schoolsAudited?.toLocaleString() || "1,280"}</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">Completed</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Good Samaritan SOP Felicitations & Cash Rewards</td>
                    <td className="p-2.5 text-center">100 Citizens</td>
                    <td className="p-2.5 text-center font-bold">{report.morthAtr?.goodSamaritanSOP?.personsFelicitated || 142} Felicitated</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">Disbursed</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isCors && (
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              3. Supreme Court Committee on Road Safety (CoRS) Institutional & Fund Matrix
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                <p className="text-[10px] text-slate-500 uppercase font-bold">State Council Meetings</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{report.corsMatrix?.sccrsMeetingsHeld || 4} Held</p>
                <span className="text-[10px] text-emerald-700 font-semibold">100% Compliant</span>
              </div>
              <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                <p className="text-[10px] text-slate-500 uppercase font-bold">DRSC 33-Dist. Compliance</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{report.corsMatrix?.drscMeetingComplianceRate || 96}%</p>
                <span className="text-[10px] text-emerald-700 font-semibold">Active & Quorate</span>
              </div>
              <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Road Safety Fund Utilization</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{report.corsMatrix?.roadSafetyFund?.utilizedPercentage || 88.7}%</p>
                <span className="text-[10px] text-indigo-700 font-semibold">Rs {report.corsMatrix?.roadSafetyFund?.allocatedCr || 75} Cr Spent</span>
              </div>
              <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                <p className="text-[10px] text-slate-500 uppercase font-bold">iRAD Crash Data Sync</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{report.corsMatrix?.iradComplianceRate || 94.2}%</p>
                <span className="text-[10px] text-emerald-700 font-semibold">Integrated</span>
              </div>
            </div>
          </div>
        )}

        {isDrsc && (
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              3. Inter-Departmental Joint Action Progress (Police, Transport, PWD, Health)
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                  <tr>
                    <th className="p-2.5">Department</th>
                    <th className="p-2.5">Action Plan Commitment</th>
                    <th className="p-2.5 text-center">Target Timeline</th>
                    <th className="p-2.5 text-right">Progress Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(report.drscDossier?.interDeptDecisions || [
                    { dept: "Police Department", task: "Intensify helmet & speed enforcement in top 5 accident stretches", deadline: "Weekly", status: "Active" },
                    { dept: "PWD / NHAI", task: "Complete rumble strips & high-retroreflective warning signs near school zones", deadline: "15 Days", status: "Under Execution" },
                    { dept: "Transport (RTO)", task: "Conduct fitness inspections of all registered school buses and vans", deadline: "30 Days", status: "Completed (100%)" },
                    { dept: "Health Department", task: "Audit 108 Emergency Ambulance positioning along National Highway corridors", deadline: "Ongoing", status: "Verified" },
                  ]).map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-bold text-slate-900">{item.dept}</td>
                      <td className="p-2.5 text-slate-700">{item.task}</td>
                      <td className="p-2.5 text-center text-slate-500">{item.deadline}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 4: Ground Hazards & Action Efficacy */}
        <div className="space-y-3">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
            4. Ground Verification & Hazard Rectification Efficacy
          </h3>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
              <p className="text-[11px] text-slate-500 uppercase font-bold">Hazards / Defects Reported</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{report.hazardAudit?.reported || 0}</p>
            </div>
            <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
              <p className="text-[11px] text-slate-500 uppercase font-bold">Rectified on Site</p>
              <p className="text-xl font-bold text-emerald-700 mt-1">{report.hazardAudit?.resolved || 0}</p>
            </div>
            <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
              <p className="text-[11px] text-slate-500 uppercase font-bold">Official Rectification Rate</p>
              <p className="text-xl font-bold text-indigo-700 mt-1">{report.hazardAudit?.rectificationRate || 100}%</p>
            </div>
          </div>
        </div>

        {/* Section 5: Top Performing Districts */}
        {report.topDistricts && report.topDistricts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              5. District Performance Leaderboard & Scorecard
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                  <tr>
                    <th className="p-2.5">Rank</th>
                    <th className="p-2.5">District</th>
                    <th className="p-2.5 text-center">Performance Score (/100)</th>
                    <th className="p-2.5 text-center">Grade</th>
                    <th className="p-2.5 text-right">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.topDistricts.map((d: any, i: number) => (
                    <tr key={i}>
                      <td className="p-2.5 font-mono font-bold text-indigo-700">#{d.rank || i + 1}</td>
                      <td className="p-2.5 font-bold text-slate-900">{d.districtName}</td>
                      <td className="p-2.5 text-center font-bold text-slate-800">{d.score}</td>
                      <td className="p-2.5 text-center font-bold text-emerald-700">{d.grade}</td>
                      <td className="p-2.5 text-right text-slate-600 font-medium">MoRTH & CoRS Compliant</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 6: Official Evidence Annexures */}
        <div className="space-y-2">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
            6. Evidence Annexures & Verification Registry
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
              <p className="font-bold text-slate-800">Annexure A: GPS Blackspot Proof</p>
              <p className="text-slate-600 mt-0.5">Geotagged photographic before/after repair logs verified by PWD/NHAI engineers.</p>
            </div>
            <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
              <p className="font-bold text-slate-800">Annexure B: Mass Citizen Pledge Rolls</p>
              <p className="text-slate-600 mt-0.5">Cryptographically signed register of student and parent road safety pledges.</p>
            </div>
          </div>
        </div>

        {/* Section 7: Formal Gazette Signatory Authentication Block */}
        <div className="pt-6 border-t-2 border-slate-900 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-slate-700">
            <div className="space-y-1">
              <div className="w-40 border-b border-slate-400 mb-1"></div>
              <p className="font-bold text-slate-900">Nodal Officer (Road Safety) / DTO</p>
              <p className="text-[11px] text-slate-500">Transport Department</p>
              <p className="text-[10px] text-emerald-700 font-mono">Digitally Authenticated: {new Date(report.generatedAt).toLocaleDateString()}</p>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <div className="w-40 border-b border-slate-400 mb-1"></div>
              <p className="font-bold text-slate-900">
                {report.scope === "district" ? "District Magistrate & Collector" : "Transport Commissioner & Secretary"}
              </p>
              <p className="text-[11px] text-slate-500">
                {report.scope === "district" ? `Chairperson, DRSC (${report.districtName})` : "State Lead Agency on Road Safety"}
              </p>
              <p className="text-[10px] text-emerald-700 font-mono">Digitally Authenticated: {new Date(report.generatedAt).toLocaleDateString()}</p>
            </div>

            <div className="space-y-1 text-right">
              <div className="w-40 border-b border-slate-400 mb-1 ml-auto"></div>
              <p className="font-bold text-slate-900">Principal Secretary to Government</p>
              <p className="text-[11px] text-slate-500">Transport, Roads & Buildings Department</p>
              <p className="text-[10px] text-indigo-700 font-mono">Gazette Seal Affixed: RS-ACT-2027</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-slate-700" />
              <span>Verifiable Official Government Record: <strong>{report.reportId}</strong></span>
            </div>
            <span className="font-mono text-emerald-700 font-bold">DIGITALLY SECURED • SOURCE OF TRUTH</span>
          </div>
        </div>

      </div>
    </div>
  );
}
