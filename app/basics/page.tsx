"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, RotateCcw, Trophy, ArrowRight } from "lucide-react";
import Image from "next/image";

type RoadSign = {
  id: number;
  image: string;
  name: string;
  description: string;
};

type Category = {
  id: string;
  name: string;
  description: string;
  count: number;
  signs: RoadSign[];
};

type RoadSignsData = {
  categories: {
    mandatory: Category;
    cautionary: Category;
    informatory: Category;
  };
};

export default function BasicsPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const [signsData, setSignsData] = useState<RoadSignsData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [quizMode, setQuizMode] = useState<"learn" | "quiz">("learn");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<RoadSign[]>([]);
  const [allOptions, setAllOptions] = useState<string[][]>([]);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetch("/road_signs_data.json")
      .then((res) => res.json())
      .then((data) => {
        setSignsData(data);
        // Initialize quiz with random 10 signs
        const allSigns = [
          ...data.categories.mandatory.signs,
          ...data.categories.cautionary.signs,
          ...data.categories.informatory.signs,
        ];
        const shuffled = [...allSigns].sort(() => Math.random() - 0.5).slice(0, 10);
        setQuizQuestions(shuffled);
        // Generate options for each question
        const options = shuffled.map((sign) => {
          if (!signsData) {
            // Fallback if signsData is null
            const wrongAnswers = allSigns
              .filter((s) => s.id !== sign.id)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3)
              .map((s) => s.name);
            return [sign.name, ...wrongAnswers].sort(() => Math.random() - 0.5);
          }
          // Get wrong answers from same category first, then others
          const signCategory = signsData.categories.mandatory.signs.find(ms => ms.id === sign.id) ? "mandatory" :
                             signsData.categories.cautionary.signs.find(cs => cs.id === sign.id) ? "cautionary" : "informatory";
          const sameCategory = allSigns.filter((s) => {
            const sCategory = signsData.categories.mandatory.signs.find(ms => ms.id === s.id) ? "mandatory" :
                             signsData.categories.cautionary.signs.find(cs => cs.id === s.id) ? "cautionary" : "informatory";
            return signCategory === sCategory && s.id !== sign.id;
          });
          const wrongAnswers = (sameCategory.length >= 3 ? sameCategory : allSigns)
            .filter((s) => s.id !== sign.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map((s) => s.name);
          const allOpts = [sign.name, ...wrongAnswers].sort(() => Math.random() - 0.5);
          return allOpts;
        });
        setAllOptions(options);
      })
      .catch((err) => console.error("Failed to load road signs:", err));
  }, []);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const currentOptions = allOptions[currentQuestionIndex] || [];

  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion.name;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setAnsweredQuestions(new Set([...answeredQuestions, currentQuestion.id]));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    if (!signsData) return;
    const allSigns = [
      ...signsData.categories.mandatory.signs,
      ...signsData.categories.cautionary.signs,
      ...signsData.categories.informatory.signs,
    ];
    const shuffled = [...allSigns].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuizQuestions(shuffled);
    const options = shuffled.map((sign) => {
      const wrongAnswers = allSigns
        .filter((s) => s.id !== sign.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((s) => s.name);
      return [sign.name, ...wrongAnswers].sort(() => Math.random() - 0.5);
    });
    setAllOptions(options);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnsweredQuestions(new Set());
    setShowResult(false);
    setCompleted(false);
  };

  const handleContinueToCertificate = () => {
    // Store score in sessionStorage for certificate page
    sessionStorage.setItem("basicsScore", score.toString());
    sessionStorage.setItem("basicsTotal", quizQuestions.length.toString());
    sessionStorage.setItem("activityType", "basics");
    router.push("/certificates/generate?type=participant&score=" + score + "&total=" + quizQuestions.length);
  };

  if (!signsData) {
    return (
      <div className="rs-container py-12">
        <div className="text-center">Loading road signs...</div>
      </div>
    );
  }

  const allSigns = [
    ...signsData.categories.mandatory.signs,
    ...signsData.categories.cautionary.signs,
    ...signsData.categories.informatory.signs,
  ];

  const filteredSigns =
    selectedCategory === "all"
      ? allSigns
      : selectedCategory === "mandatory"
      ? signsData.categories.mandatory.signs
      : selectedCategory === "cautionary"
      ? signsData.categories.cautionary.signs
      : signsData.categories.informatory.signs;

  if (quizMode === "learn") {
    return (
      <div className="rs-container py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-900 mb-3 sm:mb-4 px-4">
              {i18n.language === "te" ? "రోడ్ సైన్‌లు - ప్రాథమికాలు" : "Road Signs - Basics"}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-4 sm:mb-6 px-4">
              {i18n.language === "te"
                ? "87 రోడ్ సైన్‌ల గురించి తెలుసుకోండి మరియు పరీక్షించండి"
                : "Learn and test your knowledge of 87 road signs"}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setQuizMode("quiz")} className="rs-btn-primary">
                {i18n.language === "te" ? "క్విజ్ ప్రారంభించండి" : "Start Quiz"}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 mb-6">
            <div className="flex gap-2 flex-wrap justify-center">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
              >
                All ({allSigns.length})
              </Button>
              <Button
                variant={selectedCategory === "mandatory" ? "default" : "outline"}
                onClick={() => setSelectedCategory("mandatory")}
              >
                Mandatory ({signsData.categories.mandatory.count})
              </Button>
              <Button
                variant={selectedCategory === "cautionary" ? "default" : "outline"}
                onClick={() => setSelectedCategory("cautionary")}
              >
                Cautionary ({signsData.categories.cautionary.count})
              </Button>
              <Button
                variant={selectedCategory === "informatory" ? "default" : "outline"}
                onClick={() => setSelectedCategory("informatory")}
              >
                Informatory ({signsData.categories.informatory.count})
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
            {filteredSigns.map((sign, index) => (
              <Card key={`${sign.image}-${index}`} className="overflow-hidden">
                <div className="relative h-32 sm:h-40 md:h-48 bg-slate-100">
                  <Image
                    src={`/${sign.image}`}
                    alt={sign.name}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">{sign.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-600">{sign.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    return (
      <div className="rs-container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <Trophy className="h-20 w-20 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-emerald-900 mb-4">
              {i18n.language === "te" ? "క్విజ్ పూర్తి!" : "Quiz Complete!"}
            </h2>
            <div className="text-4xl font-bold text-emerald-600 mb-2">
              {score} / {quizQuestions.length}
            </div>
            <div className="text-2xl text-slate-600 mb-6">{percentage}%</div>
          </div>

          <div className="flex gap-4 justify-center mb-8">
            <Button onClick={handleRestart} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              {i18n.language === "te" ? "మళ్లీ ప్రయత్నించండి" : "Try Again"}
            </Button>
            <Button onClick={handleContinueToCertificate} className="rs-btn-primary gap-2">
              {i18n.language === "te" ? "సర్టిఫికేట్‌కు కొనసాగించండి" : "Continue to Certificate"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rs-container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-900">
              {i18n.language === "te" ? "రోడ్ సైన్‌ల క్విజ్" : "Road Signs Quiz"}
            </h1>
            <p className="text-sm text-slate-600">
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
            </p>
          </div>
          <Badge variant="secondary">Score: {score}</Badge>
        </div>

        {currentQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {i18n.language === "te"
                  ? "ఈ సైన్ అంటే ఏమిటి?"
                  : "What does this sign mean?"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 sm:mb-6 flex justify-center">
                <div className="relative w-full max-w-xs sm:max-w-sm md:w-64 md:h-64 aspect-square bg-slate-100 rounded-lg overflow-hidden">
                  <Image
                    src={`/${currentQuestion.image}`}
                    alt="Road sign"
                    fill
                    className="object-contain p-3 sm:p-4"
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:gap-3">
                {currentOptions.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.name;
                  const showFeedback = selectedAnswer !== null;

                  return (
                    <Button
                      key={idx}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedAnswer !== null}
                      variant={
                        showFeedback
                          ? isCorrect
                            ? "default"
                            : isSelected
                            ? "destructive"
                            : "outline"
                          : "outline"
                      }
                      className={`h-auto py-3 sm:py-4 text-left justify-start text-sm sm:text-base ${
                        showFeedback && isCorrect
                          ? "bg-emerald-600 hover:bg-emerald-700 border-2 border-emerald-700"
                          : showFeedback && isSelected
                          ? "bg-red-600 hover:bg-red-700 border-2 border-red-700"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        {showFeedback && (
                          isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-white flex-shrink-0" />
                          ) : isSelected ? (
                            <XCircle className="h-5 w-5 text-white flex-shrink-0" />
                          ) : null
                        )}
                        <span className="flex-1">{option}</span>
                        {showFeedback && isCorrect && (
                          <span className="text-xs font-semibold text-white">✓ Correct</span>
                        )}
                        {showFeedback && isSelected && !isCorrect && (
                          <span className="text-xs font-semibold text-white">✗ Wrong</span>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>

              {selectedAnswer && (
                <div
                  className={`mt-4 p-4 rounded-lg border-2 ${
                    selectedAnswer === currentQuestion.name
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {selectedAnswer === currentQuestion.name ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <p className="text-sm font-semibold text-emerald-900">
                          {i18n.language === "te" ? "సరైన సమాధానం!" : "Correct Answer!"}
                        </p>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <p className="text-sm font-semibold text-red-900">
                          {i18n.language === "te" ? "తప్పు సమాధానం" : "Incorrect Answer"}
                        </p>
                      </>
                    )}
                  </div>
                  <p className="text-sm font-semibold mb-1 text-slate-900">{currentQuestion.name}</p>
                  <p className="text-sm text-slate-600">{currentQuestion.description}</p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button onClick={handleNext} className="rs-btn-primary">
                  {currentQuestionIndex < quizQuestions.length - 1
                    ? i18n.language === "te"
                      ? "తదుపరి"
                      : "Next"
                    : i18n.language === "te"
                    ? "ఫలితాలు చూడండి"
                    : "View Results"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

