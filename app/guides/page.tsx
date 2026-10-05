"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { generateReferenceId } from "@/lib/reference";
import { Trophy, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import AudioGuide from "@/components/AudioGuide";

type GuideSection = {
  id: string;
  title: string;
  description: string;
  steps: { prompt: string; reinforcement: string }[];
};

const GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "two-wheeler",
    title: "Two-Wheeler Readiness",
    description: "Small routines before you ride make the biggest difference on Telangana’s busy roads.",
    steps: [
      {
        prompt: "Do you inspect tyre pressure, chain slack, and brake feel before every long ride?",
        reinforcement:
          "A one-minute inspection keeps grip predictable, prevents wobble, and saves you from roadside breakdowns.",
      },
      {
        prompt: "Do you set mirrors so your shoulders sit just outside the frame?",
        reinforcement:
          "Wide-angle mirrors erase blind spots and help you catch fast-moving cabs and delivery riders early.",
      },
      {
        prompt: "Do you carry reflective rain gear during early mornings and late evenings?",
        reinforcement:
          "Weather turns quickly in Telangana. High-visibility gear keeps you seen when drizzle or dust hits.",
      },
      {
        prompt: "Do you brief your pillion to mount only after your signal?",
        reinforcement:
          "Controlled mounting keeps the bike balanced and avoids low-speed slips near parking exits and signals.",
      },
    ],
  },
  {
    id: "commuter",
    title: "Urban Commute Habits",
    description: "Structure your daily travel so you never rely on risky last-second reactions.",
    steps: [
      {
        prompt: "Do you map potholes, school zones, and ongoing works on your regular route?",
        reinforcement:
          "Knowing hot-spots upfront helps you slow down earlier and keeps everyone calmer around choke points.",
      },
      {
        prompt: "Do you build a five-minute buffer before office or school runs?",
        reinforcement:
          "Starting a little early removes the urge to weave or jump queues — courtesy spreads faster than you think.",
      },
      {
        prompt: "Do you merge into the correct lane at least 100 metres before a turn?",
        reinforcement:
          "Early lane discipline cuts side-swipes and gives heavy vehicles enough time to react to your move.",
      },
      {
        prompt: "Do you practise engine braking instead of sudden pedal slams?",
        reinforcement:
          "Progressive slowing alerts drivers behind and prevents the chain of rear-end bumps common in rush hour.",
      },
    ],
  },
  {
    id: "night-weather",
    title: "Night & Weather Awareness",
    description: "Evening visibility and changing weather demand their own playbook.",
    steps: [
      {
        prompt: "Do you wipe headlamps, tail-lamps, and number plates before a night ride?",
        reinforcement:
          "Clean lenses improve throw by nearly 40%, ensuring others spot you well before junctions.",
      },
      {
        prompt: "Do you flip to low beam the moment you sight reflective signboards or approaching vehicles?",
        reinforcement:
          "Timed dipping avoids glare and keeps everyone — including you — able to read road cues in time.",
      },
      {
        prompt: "Do you slow to walking pace when the first rain dots hit the road?",
        reinforcement:
          "The initial drizzle lifts oil and dust, making the surface glassy. Slowing keeps tyres in control.",
      },
      {
        prompt: "Do you keep a microfiber cloth to reset visor clarity at signals?",
        reinforcement:
          "A quick wipe prevents eye strain and keeps your attention on pedestrians stepping off the curb.",
      },
    ],
  },
  {
    id: "emergency",
    title: "Emergency Preparedness",
    description: "Being calm and equipped is the best support you can offer yourself and others.",
    steps: [
      {
        prompt: "Do you store ICE (In Case of Emergency) contacts with country code on your phone?",
        reinforcement:
          "Emergency responders scan for ICE entries first. Having them saves coordination time during incidents.",
      },
      {
        prompt: "Do you carry a compact first-aid pouch and one pair of gloves in your vehicle?",
        reinforcement:
          "Simple supplies let you help safely while waiting for professional support — even for strangers.",
      },
      {
        prompt: "Do you remember highway helplines 1033 and 112 without looking them up?",
        reinforcement:
          "Dialling the right number instantly mobilises cranes, ambulances, and patrols on national highways.",
      },
      {
        prompt: "Do you rehearse placing reflective triangles or hazard lights during breakdowns?",
        reinforcement:
          "Practising once ensures your instincts put warning devices first, protecting oncoming traffic.",
      },
    ],
  },
];

type GuideProgress = Record<string, boolean[]>;

export default function GuidesPage() {
  const { t } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  const router = useRouter();
  
  const [progress, setProgress] = useState<GuideProgress>(() =>
    GUIDE_SECTIONS.reduce((acc, section) => {
      acc[section.id] = section.steps.map(() => false);
      return acc;
    }, {} as GuideProgress)
  );
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<{ question: string; options: string[]; correct: number }[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const totalSteps = useMemo(
    () => GUIDE_SECTIONS.reduce((total, section) => total + section.steps.length, 0),
    []
  );

  const completedSteps = useMemo(
    () => Object.values(progress).reduce((total, sectionSteps) => total + sectionSteps.filter(Boolean).length, 0),
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
        (total, steps) => total + steps.filter(Boolean).length,
        0
      );

      if (updatedCompleted === totalSteps && !referenceId) {
        setReferenceId(generateReferenceId("GUIDE"));
      }

      return updated;
    });
  };

  const startQuiz = () => {
    // Create quiz questions from guide content
    const questions = [
      {
        question: "What should you inspect before every long ride?",
        options: ["Tyre pressure, chain slack, and brake feel", "Only tyre pressure", "Only brake feel", "Nothing"],
        correct: 0,
      },
      {
        question: "How should mirrors be set?",
        options: ["So shoulders sit just outside the frame", "Completely inside frame", "Doesn't matter", "Only left mirror"],
        correct: 0,
      },
      {
        question: "When should you use low beam?",
        options: ["When you sight reflective signboards or approaching vehicles", "Always", "Never", "Only at night"],
        correct: 0,
      },
      {
        question: "What should you do when first rain hits?",
        options: ["Slow to walking pace", "Speed up", "Continue normal speed", "Stop immediately"],
        correct: 0,
      },
      {
        question: "What are the highway helplines?",
        options: ["1033 and 112", "100 and 101", "911", "108"],
        correct: 0,
      },
    ];
    setQuizQuestions(questions);
    setQuizMode(true);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
  };

  const handleQuizAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    if (answerIndex === quizQuestions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const handleContinueToCertificate = () => {
    sessionStorage.setItem("guidesScore", score.toString());
    sessionStorage.setItem("guidesTotal", quizQuestions.length.toString());
    sessionStorage.setItem("activityType", "guides");
    router.push("/certificates/generate");
  };

  // Generate full page content for Audio Guide
  const getGuidesPageContent = () => {
    let content = "Safety Guides. ";
    content += GUIDE_SECTIONS.map(section => {
      let sectionContent = `${section.title}. ${section.description}. `;
      section.steps.forEach((step, idx) => {
        sectionContent += `Step ${idx + 1}. ${step.prompt}. ${step.reinforcement}. `;
      });
      return sectionContent;
    }).join("");
    return content;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Audio Guide Button */}
      <div className="flex justify-end mb-4">
        <AudioGuide 
          content={getGuidesPageContent}
          label="Audio Guide"
          className="rs-btn-secondary"
        />
      </div>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-green-800 mb-3">{tc("safetyGuides") || "Safety Guides"}</h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          {tc("tapYesToConfirmHabit") || "Tap \"Yes\" to confirm each habit. Only after you respond will the reinforcement appear — helping you actively remember the point. A reference ID unlocks once you acknowledge every habit across all sections."}
        </p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <p className="text-sm font-medium text-gray-700">
          {tc("progress") || "Progress"}: <span className="text-green-700">{completedSteps} / {totalSteps}</span>
        </p>
        {!referenceId && (
          <p className="text-xs text-gray-500">
            {tc("keepGoingCompletionId") || "Keep going! The completion ID appears automatically after all prompts are acknowledged."}
          </p>
        )}
      </div>

      <div className="space-y-8">
        {GUIDE_SECTIONS.map((section) => {
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
                      className="rounded-md border border-green-100 bg-white p-4 shadow-sm space-y-3"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <p className="font-medium text-gray-800">{step.prompt}</p>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleYes(section.id, index)}
                          disabled={acknowledged}
                        >
                          {acknowledged ? (tc("noted") || "Noted") : (tc("yes") || "Yes")}
                        </Button>
                      </div>
                      {acknowledged && (
                        <p className="text-sm text-green-700 bg-green-50 border-l-4 border-green-500 px-3 py-2 rounded-md">
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

      {referenceId && !quizMode && (
        <Card className="mt-10 bg-green-50 border-green-200">
          <CardContent className="py-6 text-center space-y-4">
            <p className="text-lg font-semibold text-green-800">
              {tc("fantasticRevisitedHabits") || "Fantastic! You consciously revisited every habit in this guide."}
            </p>
            <p className="text-sm text-green-800">
              {tc("noteCompletionReferenceId") || "Now test your knowledge with a quiz to earn a certificate."}
            </p>
            <Button onClick={startQuiz} className="rs-btn-primary gap-2">
              Start Quiz
            </Button>
          </CardContent>
        </Card>
      )}

      {quizMode && !showResult && quizQuestions.length > 0 && (
        <Card className="mt-10">
          <CardHeader>
            <CardTitle>Quiz: Test Your Knowledge</CardTitle>
            <CardDescription>Question {currentQuestion + 1} of {quizQuestions.length}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-semibold">{quizQuestions[currentQuestion].question}</p>
            <div className="space-y-2">
              {quizQuestions[currentQuestion].options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === quizQuestions[currentQuestion].correct;
                const showFeedback = selectedAnswer !== null;

                return (
                  <Button
                    key={idx}
                    onClick={() => handleQuizAnswer(idx)}
                    disabled={selectedAnswer !== null}
                    variant={isSelected ? (isCorrect ? "default" : "destructive") : "outline"}
                    className="w-full text-left justify-start h-auto py-3"
                  >
                    <div className="flex items-center gap-3 w-full">
                      {showFeedback && isSelected && (
                        isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-white flex-shrink-0" />
                        )
                      )}
                      <span className="flex-1">{option}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
            {selectedAnswer !== null && (
              <Button onClick={handleNextQuestion} className="w-full rs-btn-primary">
                {currentQuestion < quizQuestions.length - 1 ? "Next Question" : "View Results"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {showResult && (
        <Card className="mt-10 bg-emerald-50 border-emerald-200">
          <CardContent className="py-6 text-center space-y-4">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
            <p className="text-2xl font-bold text-emerald-900">
              Quiz Complete!
            </p>
            <p className="text-3xl font-bold text-emerald-600">
              {score} / {quizQuestions.length}
            </p>
            <p className="text-lg text-slate-600">
              {Math.round((score / quizQuestions.length) * 100)}%
            </p>
            <Button onClick={handleContinueToCertificate} className="rs-btn-primary gap-2">
              Continue to Certificate
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}








