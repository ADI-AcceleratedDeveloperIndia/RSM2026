"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import HelmetPrototype from "./HelmetPrototype";
import TripleRidingSimulation from "./TripleRidingSimulation";
import DrunkDriveSimulation from "./DrunkDriveSimulation";
import OverspeedSimulation from "./OverspeedSimulation";
import { BrainCircuit, Sparkles, ShieldCheck, WineOff, Trophy, ArrowRight, Gauge, Check, Users } from "lucide-react";

export default function SimulationPage() {
  const { t, i18n } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  const router = useRouter();
  const [completedSims, setCompletedSims] = useState<Set<string>>(new Set());
  const [allCompleted, setAllCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState("helmet");

  useEffect(() => {
    // Check sessionStorage for completed simulations
    const helmet = sessionStorage.getItem("sim_helmet_completed");
    const triple = sessionStorage.getItem("sim_triple_completed");
    const drunk = sessionStorage.getItem("sim_drunk_completed");
    const overspeed = sessionStorage.getItem("sim_overspeed_completed");
    
    const completed = new Set<string>();
    if (helmet) completed.add("helmet");
    if (triple) completed.add("triple");
    if (drunk) completed.add("drunk");
    if (overspeed) completed.add("overspeed");
    
    setCompletedSims(completed);
    setAllCompleted(completed.size === 4);
  }, []);

  const handleSimComplete = (simId: string) => {
    const updated = new Set(completedSims);
    updated.add(simId);
    setCompletedSims(updated);
    
    // Save to sessionStorage
    sessionStorage.setItem(`sim_${simId}_completed`, "true");
    
    if (updated.size === 4) {
      setAllCompleted(true);
      // Set score for certificate (4/4 = 100%)
      sessionStorage.setItem("simulationScore", "4");
      sessionStorage.setItem("simulationTotal", "4");
      sessionStorage.setItem("activityType", "simulation");
    }
  };

  const handleContinueToCertificate = () => {
    router.push("/certificates/generate");
  };
  
  return (
    <div className="rs-container py-6 sm:py-12 space-y-8 sm:space-y-12">
      {/* Header Banner */}
      <div className="rs-card p-6 sm:p-8 bg-gradient-to-br from-emerald-50 via-teal-50/30 to-white flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-2 border-emerald-100 rounded-3xl">
        <div className="space-y-3">
          <span className="rs-chip flex items-center gap-2 w-fit">
            <BrainCircuit className="h-4 w-4" /> {tc("simulationLab") || "Gamified Simulation Lab"}
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-950 tracking-tight">
            Spot the Violation → Fix It!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            {tc("dragAndDropLearning") || "Interactive micro-challenges designed for students & youth. Identify lethal road violations and apply the scientific fix to generate your certified state credential."}
          </p>
        </div>

        {/* Progress Pill Card */}
        <div className="rounded-2xl bg-white border border-emerald-100 p-4 sm:p-5 shadow-sm text-sm text-emerald-800 space-y-2.5 shrink-0 min-w-[240px]">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-xs text-slate-700">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>Lab Completion</span>
            </span>
            <span className="font-black text-sm text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {completedSims.size} / 4 Done
            </span>
          </div>
          
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(completedSims.size / 4) * 100}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 text-center font-medium">
            {completedSims.size === 4 
              ? "🎉 Ready for Official Certificate!"
              : `Complete ${4 - completedSims.size} more scenario${4 - completedSims.size > 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Main Simulation Tabs Engine */}
      <Card className="max-w-4xl mx-auto shadow-none border-none bg-transparent">
        <CardHeader className="text-center px-2 pb-4">
          <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900">
            Interactive Safety Scenarios
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-500">
            Select a violation below. Tap the corrective tool to inspect or tap to rectify.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 sm:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Mobile-First Responsive Violation Switcher */}
            <div className="space-y-3 mb-6">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 bg-transparent p-0 h-auto">
                {/* 1. Helmet */}
                <TabsTrigger
                  value="helmet"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md flex items-center justify-between rounded-2xl border-2 border-emerald-100 bg-white px-3 py-3 text-xs font-bold text-slate-700 transition-all hover:border-emerald-300 min-h-[48px]"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>1. Helmet</span>
                  </div>
                  {completedSims.has("helmet") && (
                    <span className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shrink-0">
                      ✓
                    </span>
                  )}
                </TabsTrigger>

                {/* 2. Triple Riding */}
                <TabsTrigger
                  value="triple"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md flex items-center justify-between rounded-2xl border-2 border-emerald-100 bg-white px-3 py-3 text-xs font-bold text-slate-700 transition-all hover:border-emerald-300 min-h-[48px]"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>2. Overload</span>
                  </div>
                  {completedSims.has("triple") && (
                    <span className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shrink-0">
                      ✓
                    </span>
                  )}
                </TabsTrigger>

                {/* 3. Drunk Driving */}
                <TabsTrigger
                  value="drunk"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md flex items-center justify-between rounded-2xl border-2 border-emerald-100 bg-white px-3 py-3 text-xs font-bold text-slate-700 transition-all hover:border-emerald-300 min-h-[48px]"
                >
                  <div className="flex items-center gap-2">
                    <WineOff className="h-4 w-4 shrink-0" />
                    <span>3. DUI / Alcohol</span>
                  </div>
                  {completedSims.has("drunk") && (
                    <span className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shrink-0">
                      ✓
                    </span>
                  )}
                </TabsTrigger>

                {/* 4. Overspeeding */}
                <TabsTrigger
                  value="overspeed"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md flex items-center justify-between rounded-2xl border-2 border-emerald-100 bg-white px-3 py-3 text-xs font-bold text-slate-700 transition-all hover:border-emerald-300 min-h-[48px]"
                >
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 shrink-0" />
                    <span>4. Speed</span>
                  </div>
                  {completedSims.has("overspeed") && (
                    <span className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shrink-0">
                      ✓
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Scenarios */}
            <TabsContent value="helmet" className="mt-2 focus-visible:outline-none">
              <HelmetPrototype onComplete={() => handleSimComplete("helmet")} />
            </TabsContent>

            <TabsContent value="triple" className="mt-2 focus-visible:outline-none">
              <TripleRidingSimulation onComplete={() => handleSimComplete("triple")} />
            </TabsContent>

            <TabsContent value="drunk" className="mt-2 focus-visible:outline-none">
              <DrunkDriveSimulation onComplete={() => handleSimComplete("drunk")} />
            </TabsContent>

            <TabsContent value="overspeed" className="mt-2 focus-visible:outline-none">
              <OverspeedSimulation onComplete={() => handleSimComplete("overspeed")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Completion Banner */}
      {allCompleted && (
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-none shadow-2xl rounded-3xl animate-in fade-in duration-300">
          <CardContent className="py-8 px-6 text-center space-y-4">
            <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Trophy className="h-9 w-9 text-yellow-300" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Simulation Lab Successfully Completed!
            </h3>
            <p className="text-sm sm:text-base text-emerald-100 max-w-xl mx-auto">
              You have rectified all 4 critical road safety violations (4/4). Your knowledge is verified under the State Road Safety Action Framework.
            </p>
            <div className="pt-2">
              <Button
                onClick={handleContinueToCertificate}
                className="bg-white text-emerald-900 hover:bg-emerald-50 font-black text-sm h-12 px-8 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <span>Generate Official Certificate</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Forthcoming Scenarios Info */}
      <div className="rs-card p-6 rounded-3xl border border-slate-200">
        <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
          <span>Upcoming National Curriculum Scenarios</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Additional practical interactive scenarios expanding to colleges and commercial drivers:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600">
          <span className="p-2 rounded-lg bg-slate-50 border border-slate-100">• Wrong-side driving</span>
          <span className="p-2 rounded-lg bg-slate-50 border border-slate-100">• Traffic signal jumping</span>
          <span className="p-2 rounded-lg bg-slate-50 border border-slate-100">• Giving way to 108 Ambulance</span>
          <span className="p-2 rounded-lg bg-slate-50 border border-slate-100">• Pedestrian zebra crossing</span>
          <span className="p-2 rounded-lg bg-slate-50 border border-slate-100">• School zone deceleration</span>
          <span className="p-2 rounded-lg bg-slate-50 border border-slate-100">• High-beam dazzle hazard</span>
          <span className="p-2 rounded-lg bg-slate-50 border border-slate-100">• Phone distraction while riding</span>
          <span className="p-2 rounded-lg bg-slate-50 border border-slate-100">• Blind spot lane switching</span>
        </div>
      </div>
    </div>
  );
}
