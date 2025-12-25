"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, RotateCcw, Trophy, ArrowRight, BookOpen, Brain, Award } from "lucide-react";
import Image from "next/image";

type RoadSign = {
  id: number;
  image: string;
  name: string;
  description: string;
  hover_text: string;
  tooltip: {
    title: string;
    description: string;
    category: string;
  };
};

type Category = {
  id: string;
  name: string;
  description: string;
  count: number;
  signs: RoadSign[];
};

type RoadSignsData = {
  source: {
    name: string;
    url: string;
    attribution: string;
  };
  totalSigns: number;
  categories: {
    mandatory: Category;
    cautionary: Category;
    informatory: Category;
  };
};

type QuizQuestion = {
  sign: RoadSign;
  options: string[];
  correctAnswer: string;
  correctIndex: number;
};

export default function BasicsPage() {
  const { t, i18n } = useTranslation("common");
  const router = useRouter();
  const [signsData, setSignsData] = useState<RoadSignsData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [mode, setMode] = useState<"learn" | "quiz">("learn");
  const [quizCategory, setQuizCategory] = useState<string>("all");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [answeredCount, setAnsweredCount] = useState(0);

  useEffect(() => {
    fetch("/road_signs_paired_from_source/road_signs_paired_verified.json")
      .then((res) => res.json())
      .then((data) => {
        setSignsData(data);
      })
      .catch((err) => console.error("Failed to load road signs:", err));
  }, []);

  const allSigns = useMemo(() => {
    if (!signsData) return [];
    return [
      ...signsData.categories.mandatory.signs,
      ...signsData.categories.cautionary.signs,
      ...signsData.categories.informatory.signs,
    ];
  }, [signsData]);

  const filteredSigns = useMemo(() => {
    if (!signsData) return [];
    if (selectedCategory === "all") return allSigns;
    return signsData.categories[selectedCategory as keyof typeof signsData.categories]?.signs || [];
  }, [signsData, selectedCategory, allSigns]);

  const generateQuizOptions = (correctSign: RoadSign, allSignsInCategory: RoadSign[]): string[] => {
    const wrongSigns = allSignsInCategory.filter((s) => s.id !== correctSign.id);
    const wrongOptions = wrongSigns
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((s) => s.name);
    
    const options = [correctSign.name, ...wrongOptions].sort(() => Math.random() - 0.5);
    return options;
  };

  const startQuiz = (category: string = "all", numQuestions: number = 10) => {
    if (!signsData) return;

    let signsToUse: RoadSign[] = [];
    if (category === "all") {
      signsToUse = allSigns;
    } else {
      signsToUse = signsData.categories[category as keyof typeof signsData.categories]?.signs || [];
    }

    const shuffled = [...signsToUse].sort(() => Math.random() - 0.5).slice(0, numQuestions);
    
    const questions: QuizQuestion[] = shuffled.map((sign) => {
      const categoryId = sign.tooltip.category;
      const categorySigns = signsData.categories[categoryId as keyof typeof signsData.categories]?.signs || [];
      const options = generateQuizOptions(sign, categorySigns.length >= 4 ? categorySigns : allSigns);
      const correctIndex = options.indexOf(sign.name);

      return {
        sign,
        options,
        correctAnswer: sign.name,
        correctIndex,
      };
    });

    setQuizQuestions(questions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setAnsweredCount(0);
    setMode("quiz");
  };

  const currentQuestion = quizQuestions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setAnsweredCount(answeredCount + 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    startQuiz(quizCategory, quizQuestions.length);
  };

  const handleContinueToCertificate = () => {
    sessionStorage.setItem("basicsScore", score.toString());
    sessionStorage.setItem("basicsTotal", quizQuestions.length.toString());
    sessionStorage.setItem("activityType", "basics");
    router.push("/certificates/generate");
  };

  if (!signsData) {
    return (
      <div className="rs-container py-20 flex flex-col items-center gap-4 text-center">
        <Brain className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-slate-600">Loading road signs...</p>
      </div>
    );
  }

  // LEARN MODE
  if (mode === "learn") {
    return (
      <div className="rs-container py-6 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-900 mb-3 sm:mb-4">
              {i18n.language === "te" ? "రోడ్ సైన్‌లు - ప్రాథమికాలు" : "Road Signs - Basics"}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-4 sm:mb-6 max-w-3xl mx-auto px-4">
              {i18n.language === "te"
                ? "87 రోడ్ సైన్‌ల గురించి తెలుసుకోండి మరియు పరీక్షించండి"
                : "Learn and test your knowledge of 87 road signs"}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={() => setMode("quiz")} className="rs-btn-primary gap-2">
                <Brain className="h-4 w-4" />
                {i18n.language === "te" ? "క్విజ్ ప్రారంభించండి" : "Start Quiz"}
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
              <TabsTrigger value="all">
                All ({signsData.totalSigns})
              </TabsTrigger>
              <TabsTrigger value="mandatory">
                Mandatory ({signsData.categories.mandatory.count})
              </TabsTrigger>
              <TabsTrigger value="cautionary">
                Cautionary ({signsData.categories.cautionary.count})
              </TabsTrigger>
              <TabsTrigger value="informatory">
                Informatory ({signsData.categories.informatory.count})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Signs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {filteredSigns.map((sign) => (
              <Card 
                key={`${sign.tooltip.category}-${sign.id}-${sign.image}`} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                title={sign.hover_text}
              >
                <div className="relative h-32 sm:h-40 md:h-48 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                  <Image
                    src={`/${sign.image}`}
                    alt={sign.name}
                    fill
                    className="object-contain p-3 sm:p-4"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                </div>
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="text-xs sm:text-sm font-semibold line-clamp-2" title={sign.name}>
                    {sign.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-slate-600 line-clamp-3" title={sign.description}>
                    {sign.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Source Attribution */}
          <div className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-slate-500 border-t pt-6">
            <p>{signsData.source.attribution}</p>
          </div>
        </div>
      </div>
    );
  }

  // QUIZ MODE - RESULT SCREEN
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

          <div className="flex gap-4 justify-center mb-8 flex-wrap">
            <Button onClick={handleRestart} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              {i18n.language === "te" ? "మళ్లీ ప్రయత్నించండి" : "Try Again"}
            </Button>
            <Button onClick={handleContinueToCertificate} className="rs-btn-primary gap-2">
              <Award className="h-4 w-4" />
              {i18n.language === "te" ? "సర్టిఫికేట్ సృష్టించండి" : "Generate Certificate"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // QUIZ MODE - QUESTION SCREEN
  if (quizQuestions.length === 0) {
    return (
      <div className="rs-container py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-emerald-900 mb-2">
                {i18n.language === "te" ? "క్విజ్ సెటప్" : "Quiz Setup"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  {i18n.language === "te" ? "కేటగిరీ ఎంచుకోండి" : "Select Category"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={quizCategory === "all" ? "default" : "outline"}
                    onClick={() => setQuizCategory("all")}
                  >
                    All ({signsData.totalSigns})
                  </Button>
                  <Button
                    variant={quizCategory === "mandatory" ? "default" : "outline"}
                    onClick={() => setQuizCategory("mandatory")}
                  >
                    Mandatory ({signsData.categories.mandatory.count})
                  </Button>
                  <Button
                    variant={quizCategory === "cautionary" ? "default" : "outline"}
                    onClick={() => setQuizCategory("cautionary")}
                  >
                    Cautionary ({signsData.categories.cautionary.count})
                  </Button>
                  <Button
                    variant={quizCategory === "informatory" ? "default" : "outline"}
                    onClick={() => setQuizCategory("informatory")}
                  >
                    Informatory ({signsData.categories.informatory.count})
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={() => startQuiz(quizCategory, 10)} className="rs-btn-primary flex-1">
                  {i18n.language === "te" ? "10 ప్రశ్నలు" : "10 Questions"}
                </Button>
                <Button onClick={() => startQuiz(quizCategory, 15)} className="rs-btn-primary flex-1">
                  {i18n.language === "te" ? "15 ప్రశ్నలు" : "15 Questions"}
                </Button>
                <Button onClick={() => startQuiz(quizCategory, 20)} className="rs-btn-primary flex-1">
                  {i18n.language === "te" ? "20 ప్రశ్నలు" : "20 Questions"}
                </Button>
              </div>

              <Button onClick={() => setMode("learn")} variant="outline" className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                {i18n.language === "te" ? "లెర్న్ మోడ్‌కు తిరిగి వెళ్లండి" : "Back to Learn Mode"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="rs-container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-emerald-900">
              {i18n.language === "te" ? "రోడ్ సైన్‌ల క్విజ్" : "Road Signs Quiz"}
            </h1>
            <p className="text-sm text-slate-600">
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
            </p>
          </div>
          <Badge variant="secondary" className="text-base px-3 py-1">
            Score: {score}
          </Badge>
        </div>

        {currentQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {i18n.language === "te"
                  ? "ఈ సైన్ అంటే ఏమిటి?"
                  : "What does this road sign mean?"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex justify-center">
                <div className="relative w-full max-w-[200px] sm:max-w-[240px] md:w-48 md:h-48 aspect-square bg-slate-100 rounded-lg overflow-hidden">
                  <Image
                    src={`/${currentQuestion.sign.image}`}
                    alt="Road sign"
                    fill
                    className="object-contain p-3"
                    sizes="(max-width: 640px) 200px, (max-width: 1024px) 240px, 192px"
                  />
                </div>
              </div>

              <div className="grid gap-3">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.correctAnswer;
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
                      className={`h-auto py-4 text-left justify-start text-base ${
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
                    selectedAnswer === currentQuestion.correctAnswer
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {selectedAnswer === currentQuestion.correctAnswer ? (
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
                  <p className="text-sm font-semibold mb-1 text-slate-900">{currentQuestion.sign.name}</p>
                  <p className="text-sm text-slate-600">{currentQuestion.sign.description}</p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleNext} 
                  className="rs-btn-primary"
                  disabled={selectedAnswer === null}
                >
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
