"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import HelmetPrototype from "./HelmetPrototype";
import TripleRidingSimulation from "./TripleRidingSimulation";
import DrunkDriveSimulation from "./DrunkDriveSimulation";
import { BrainCircuit, Sparkles, ShieldCheck, WineOff } from "lucide-react";

export default function SimulationPage() {
  const { t } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  
  return (
    <div className="rs-container py-12 space-y-12">
      <div className="rs-card p-8 bg-gradient-to-br from-emerald-50 to-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-4">
          <span className="rs-chip flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" /> {tc("simulationLab")}
          </span>
          <h1 className="text-3xl font-semibold text-emerald-900">{tc("spotTheViolationFixIt") || "Spot the Violation → Fix It!"}</h1>
          <p className="text-slate-600 max-w-2xl">
            {tc("dragAndDropLearning") || "Drag-and-drop micro learning challenges that help you identify and correct common road safety violations. Earn completion reference IDs for every simulation you master."}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-emerald-100 p-5 shadow-sm text-sm text-emerald-700 space-y-3">
          <p className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4" /> {tc("completionRewards") || "Completion Rewards"}</p>
          <ul className="space-y-2 list-disc list-inside">
            <li>{tc("referenceIdForEachSimulation") || "Reference ID for each simulation completion"}</li>
            <li>{tc("instantFeedbackOnSafeDecisions") || "Instant feedback on safe decisions"}</li>
            <li>{tc("supportsQuizCertificateProgress") || "Supports quiz & certificate progress"}</li>
          </ul>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto shadow-none border-none">
        <CardHeader className="text-center">
          <CardTitle>{tc("interactiveRoadSafetySimulations") || "Interactive Road Safety Simulations"}</CardTitle>
          <CardDescription>
            {tc("chooseViolationScenario") || "Choose a violation scenario and drag the suggested solutions onto the violation to transform the scene into a safe one."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="helmet" className="w-full">
            <div className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 gap-2 bg-transparent p-0">
                <TabsTrigger
                  value="helmet"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg flex items-center justify-center gap-2 rounded-lg border-2 border-emerald-200 bg-white px-3 py-3 text-sm font-semibold text-emerald-700 transition-all hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <ShieldCheck className="h-5 w-5" />
                  <span className="hidden sm:inline">Violation 1</span>
                  <span className="sm:hidden">V1</span>
                </TabsTrigger>
                <TabsTrigger
                  value="triple"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg flex items-center justify-center gap-2 rounded-lg border-2 border-emerald-200 bg-white px-3 py-3 text-sm font-semibold text-emerald-700 transition-all hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <ShieldCheck className="h-5 w-5" />
                  <span className="hidden sm:inline">Violation 2</span>
                  <span className="sm:hidden">V2</span>
                </TabsTrigger>
                <TabsTrigger
                  value="drunk"
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg flex items-center justify-center gap-2 rounded-lg border-2 border-emerald-200 bg-white px-3 py-3 text-sm font-semibold text-emerald-700 transition-all hover:border-emerald-400 hover:bg-emerald-50"
                >
                  <WineOff className="h-5 w-5" />
                  <span className="hidden sm:inline">Violation 3</span>
                  <span className="sm:hidden">V3</span>
                </TabsTrigger>
              </TabsList>
              <p className="text-xs text-slate-500 text-center">{tc("tapViolationToSwitch") || "Tap a violation above to switch the scenario."}</p>
            </div>

            <TabsContent value="helmet" className="mt-6">
              <HelmetPrototype />
            </TabsContent>

            <TabsContent value="triple" className="mt-6">
              <TripleRidingSimulation />
            </TabsContent>

            <TabsContent value="drunk" className="mt-6">
              <DrunkDriveSimulation />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="rs-card p-6">
        <h3 className="text-lg font-semibold text-emerald-900 mb-3">{tc("moreScenariosArrivingSoon") || "More scenarios arriving soon"}</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-slate-600">
          <span>• {tc("scenarioWrongSideBike") || "Wrong-side bike riding"}</span>
          <span>• {tc("scenarioSignalJumping") || "Signal jumping (bike)"}</span>
          <span>• {tc("scenarioDrunkRiding") || "Drunk riding (bike)"}</span>
          <span>• {tc("scenarioGiveWayAmbulance") || "Give way to ambulance (car)"}</span>
          <span>• {tc("scenarioBlockedZebra") || "Blocked zebra crossing (car)"}</span>
          <span>• {tc("scenarioParkingFootpath") || "Parking on footpath (car)"}</span>
          <span>• {tc("scenarioOverspeedSchoolZone") || "Overspeed in school zone (car)"}</span>
          <span>• {tc("scenarioTailgating") || "Tailgating (car)"}</span>
          <span>• {tc("scenarioJaywalking") || "Jaywalking (pedestrian)"}</span>
          <span>• {tc("scenarioPhoneWhileCrossing") || "Using phone while crossing"}</span>
          <span>• {tc("scenarioCrossingDuringGreen") || "Crossing during green"}</span>
          <span>• {tc("scenarioWalkingOnRoad") || "Walking on road instead of footpath"}</span>
          <span>• {tc("scenarioWrongSideAuto") || "Wrong-side auto driving"}</span>
          <span>• {tc("scenarioBlockingFireTruck") || "Blocking fire truck (vehicles)"}</span>
          <span>• {tc("scenarioZigZagOvertaking") || "Zig-zag/rash overtaking (bike)"}</span>
        </div>
      </div>
    </div>
  );
}
