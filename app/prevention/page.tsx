"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { generateReferenceId } from "@/lib/reference";

type PreventionSection = {
  id: string;
  title: string;
  description: string;
  steps: { prompt: string; reinforcement: string }[];
};

const PREVENTION_SECTIONS: PreventionSection[] = [
  {
    id: "journey",
    title: "Plan Before You Start",
    description: "Prevention begins even before the ignition. Pre-plan to avoid risky improvisations on the move.",
    steps: [
      {
        prompt: "Do you check weather, road closures, and festival diversions a day in advance?",
        reinforcement:
          "Anticipating diversions helps you avoid sudden U-turns that cause pile-ups near flyovers and junctions.",
      },
      {
        prompt: "Do you ensure vehicle papers and PUC are easily accessible?",
        reinforcement:
          "Keeping documents handy speeds up checks and keeps you calm — stress-free driving itself reduces errors.",
      },
      {
        prompt: "Do you plan hydration and rest stops for journeys more than two hours?",
        reinforcement:
          "Scheduled breaks prevent fatigue-induced micro-sleeps, a leading cause of highway crashes.",
      },
    ],
  },
  {
    id: "people",
    title: "People First Mindset",
    description: "Safer roads come from anticipating how fellow road users behave and responding kindly.",
    steps: [
      {
        prompt: "Do you scan for school vans, senior citizens, and differently-abled persons near crossings?",
        reinforcement:
          "Acknowledging vulnerable users early gives you time to slow down, wave them across, and prevent panic stops.",
      },
      {
        prompt: "Do you keep space for cyclists and delivery riders when you overtake?",
        reinforcement:
          "A generous buffer shields them from wind blasts and keeps them upright on uneven surfaces.",
      },
      {
        prompt: "Do you avoid honking continuously in narrow lanes and near hospitals?",
        reinforcement:
          "Excessive honking startles pedestrians and animals, creating unpredictable moves that trigger accidents.",
      },
    ],
  },
  {
    id: "vehicle-care",
    title: "Vehicle Health",
    description: "A well-maintained vehicle prevents incidents before they even appear.",
    steps: [
      {
        prompt: "Do you run a monthly check on brake pads, wipers, and fluid levels?",
        reinforcement:
          "Preventive maintenance catches wear before it becomes a roadside emergency or loss of control.",
      },
      {
        prompt: "Do you disinfect and declutter the dashboard and floor?",
        reinforcement:
          "Loose bottles and clutter become projectiles during sudden braking and obstruct safe pedal movement.",
      },
      {
        prompt: "Do you keep tyre tread depth above the wear indicator?",
        reinforcement:
          "Healthy tread clears water, keeping aquaplaning and skids away during Telangana’s sudden showers.",
      },
    ],
  },
  {
    id: "after-incident",
    title: "If Something Goes Wrong",
    description: "How you respond after an incident can prevent secondary crashes and speed up help.",
    steps: [
      {
        prompt: "Do you switch on hazards only after guiding the vehicle to the side?",
        reinforcement:
          "Hazards warn people. Moving out of the lane first ensures you don’t block traffic behind you unnecessarily.",
      },
      {
        prompt: "Do you place reflective triangles 50 metres behind your vehicle at night?",
        reinforcement:
          "Giving drivers advance warning prevents secondary collisions, which are common after breakdowns.",
      },
      {
        prompt: "Do you record incident details calmly and call for medical help before sharing on social media?",
        reinforcement:
          "Accurate reports and quick medical calls save lives; unverified forwards create chaos and delay responders.",
      },
    ],
  },
];

type PreventionProgress = Record<string, boolean[]>;

export default function PreventionPage() {
  const { t } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  
  const [progress, setProgress] = useState<PreventionProgress>(() =>
    PREVENTION_SECTIONS.reduce((acc, section) => {
      acc[section.id] = section.steps.map(() => false);
      return acc;
    }, {} as PreventionProgress)
  );
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const totalSteps = useMemo(
    () => PREVENTION_SECTIONS.reduce((total, section) => total + section.steps.length, 0),
    []
  );

  const completedSteps = useMemo(
    () => Object.values(progress).reduce((total, steps) => total + steps.filter(Boolean).length, 0),
    [progress]
  );

  const handleYes = (sectionId: string, stepIndex: number) => {
    setProgress((prev) => {
      const sectionProgress = prev[sectionId];
      if (!sectionProgress || sectionProgress[stepIndex]) {
        return prev;
      }

      const updatedSection = sectionProgress.map((value, idx) => (idx === stepIndex ? true : value));
      const updated = { ...prev, [sectionId]: updatedSection };

      const updatedCompleted = Object.values(updated).reduce(
        (total, stepsArray) => total + stepsArray.filter(Boolean).length,
        0
      );

      if (updatedCompleted === totalSteps && !referenceId) {
        setReferenceId(generateReferenceId("PREVENT"));
      }

      return updated;
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-green-800 mb-3">{tc("preventionGreaterThanCure") || "Prevention > Cure"}</h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          {tc("safetyIsChainOfDecisions") || "Safety is a chain of small decisions. Confirm each prevention step with \"Yes\" to reveal why it matters. Finish every section to receive a reference ID acknowledging your commitment."}
        </p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <p className="text-sm font-medium text-gray-700">
          {tc("progress") || "Progress"}: <span className="text-green-700">{completedSteps} / {totalSteps}</span>
        </p>
        {!referenceId && (
          <p className="text-xs text-gray-500">{tc("completeAllPromptsPrevention") || "Complete all prompts to unlock your prevention reference ID."}</p>
        )}
      </div>

      <div className="space-y-8">
        {PREVENTION_SECTIONS.map((section) => {
          const sectionProgress = progress[section.id] || [];
          const sectionCompleted = sectionProgress.every(Boolean);
          return (
            <Card key={section.id}>
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
                {sectionCompleted && <Badge variant="default">{tc("sectionCompleted") || "Section completed"}</Badge>}
              </CardHeader>
              <CardContent className="space-y-4">
                {section.steps.map((step, index) => {
                  const acknowledged = sectionProgress[index];
                  return (
                    <div
                      key={`${section.id}-${index}`}
                      className="rounded-md border border-amber-100 bg-white p-4 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <p className="font-medium text-gray-800">{step.prompt}</p>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleYes(section.id, index)}
                          disabled={acknowledged}
                        >
                          {acknowledged ? (tc("noted") || "Noted") : (tc("yes") || "Yes")}
                        </Button>
                      </div>
                      {acknowledged && (
                        <p className="text-sm text-amber-800 bg-amber-50 border-l-4 border-amber-400 px-3 py-2 rounded-md">
                          {step.reinforcement}
                        </p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {referenceId && (
        <Card className="mt-10 bg-amber-50 border-amber-200">
          <CardContent className="py-6 text-center space-y-2">
            <p className="text-lg font-semibold text-amber-900">
              {tc("thankYouForPledging") || "Thank you for pledging to prevent incidents before they occur."}
            </p>
            <p className="text-sm text-amber-900">
              {tc("preventionReferenceIdCanBeShared") || "Your prevention reference ID can be shared with campaign coordinators or event leads."}
            </p>
            <Badge variant="secondary" className="text-base px-4 py-2">
              {referenceId}
            </Badge>
          </CardContent>
        </Card>
      )}
    </div>
  );
}








