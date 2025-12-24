"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Loader2, Trophy, Copy, Sparkles, Target, Award, Volume2, VolumeX } from "lucide-react";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

export default function QuizPage() {
  const { t, i18n } = useTranslation("common");
  const { t: tc } = useTranslation("content");
  const router = useRouter();
  
  // Get current language for speech synthesis
  const getCurrentLang = () => {
    const lang = i18n.language || "en";
    // Handle language codes like "te-IN" or "te"
    if (lang.startsWith("te")) {
      return "te";
    }
    return "en";
  };
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    passed: boolean;
    referenceId?: string | null;
    attemptId?: string | null;
    certificateType?: "QUIZ" | "PAR";
    meritCutoff?: number;
  } | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [questionResults, setQuestionResults] = useState<Map<number, boolean>>(new Map()); // questionId -> isCorrect
  const [copiedRefId, setCopiedRefId] = useState(false);
  const [virtualQuizMaster, setVirtualQuizMaster] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voicesLoadedRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Appreciation words in both languages - arranged from low to high degree of appreciation (15 words for 15 questions)
  const appreciationWords = {
    en: ["Good", "Well done", "Great", "Super", "Fantastic", "Excellent", "Perfect", "Brilliant", "Outstanding", "Amazing", "Wonderful", "Extraordinary", "Incredible", "Phenomenal", "Legendary"],
    te: [
      "సరియైనది",      // Level 1: That is correct
      "భలే",            // Level 2: Good/Nice
      "భేష్",            // Level 2: Bravo/Fine
      "శభాష్",          // Level 3: Well done
      "వహ్వా",           // Level 3: Wow
      "అదిరింది",        // Level 4: Fantastic
      "కేక",             // Level 4: Awesome
      "రచ్చ",             // Level 4: Sensation
      "అద్భుతం",         // Level 5: Wonderful
      "అమోఘం",           // Level 5: Excellent
      "అసాధారణం",        // Level 5: Extraordinary
      "చింపేశావు",       // Level 6: You nailed it
      "పరిపూర్ణం",       // Level 6: Perfect
      "తిరుగులేదు",      // Level 6: Unbeatable
      "తోపు"              // Level 7: Legend/Expert
    ]
  };

  useEffect(() => {
    const lang = getCurrentLang();
    console.log("🔄 Loading questions in language:", lang);
    fetch(`/api/quiz/submit?lang=${lang}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Questions loaded:", data.questions.length);
        console.log("📝 First question preview:", data.questions[0]?.question?.substring(0, 50));
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(-1));
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error loading questions:", error);
        setLoading(false);
      });
  }, []);

  // Reload questions when language changes
  useEffect(() => {
    if (!loading && questions.length > 0) {
      const lang = getCurrentLang();
      fetch(`/api/quiz/submit?lang=${lang}`)
        .then((res) => res.json())
        .then((data) => {
          setQuestions(data.questions);
          // Preserve existing answers when language changes
          const currentAnswers = [...answers];
          setAnswers(currentAnswers);
        });
    }
  }, [i18n.language]);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      
      // Cancel any existing speech
      synthRef.current.cancel();
      
      // Load voices
      const loadVoices = () => {
        if (synthRef.current) {
          const voices = synthRef.current.getVoices();
          console.log("🔊 Voices loaded:", voices.length);
          if (voices.length > 0) {
            voicesLoadedRef.current = true;
            console.log("📢 Sample voices:", voices.slice(0, 5).map(v => `${v.name} (${v.lang})`));
            
            // Log Telugu voices specifically
            const teluguVoices = voices.filter(v => 
              v.lang.startsWith("te") || 
              v.name.toLowerCase().includes("telugu")
            );
            if (teluguVoices.length > 0) {
              console.log("✅ Telugu voices found:", teluguVoices.map(v => `${v.name} (${v.lang})`));
            } else {
              console.warn("⚠️ No Telugu voices found. Available languages:", 
                [...new Set(voices.map(v => v.lang))].slice(0, 10)
              );
            }
          }
        }
      };
      
      // Try to load voices immediately
      loadVoices();
      
      // Also listen for voice changes (important for Chrome)
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
      
      // Force load voices after delays (Chrome needs this)
      setTimeout(() => {
        loadVoices();
      }, 500);
      
      setTimeout(() => {
        loadVoices();
      }, 1000);
      
      return () => {
        if (synthRef.current) {
          synthRef.current.cancel();
        }
      };
    } else {
      console.error("❌ Speech synthesis not supported in this browser");
    }
  }, []);

  const stopSpeaking = () => {
    if (synthRef.current && synthRef.current.speaking) {
      // Cancel gracefully - "interrupted" error is expected and normal
      synthRef.current.cancel();
    }
  };

  const speakText = (text: string, lang: string = "en") => {
    // Only speak if Virtual Quiz Master is ON
    if (!virtualQuizMaster) {
      console.log("Virtual Quiz Master is OFF, not speaking");
      return;
    }
    
    if (!synthRef.current) {
      console.error("Speech synthesis not available");
      return;
    }
    
    console.log("Speaking text:", text.substring(0, 50) + "...");
    console.log("Language:", lang);
    
    // Cancel any ongoing speech
    stopSpeaking();
    
    // Wait a bit for cancellation to complete
    setTimeout(() => {
      if (!synthRef.current) {
        console.log("Speech synthesis not available after timeout");
        return;
      }
      
      // Check state again (might have changed)
      if (!virtualQuizMaster) {
        console.log("Virtual Quiz Master turned OFF, cancelling speech");
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      // Use proper language codes
      if (lang === "te") {
        // Try te-IN first, fallback to te if not available
        utterance.lang = "te-IN"; // Telugu India
        console.log("🎤 Setting utterance language to te-IN for Telugu");
      } else {
        utterance.lang = "en-US"; // English US (works better than en-IN)
        console.log("🎤 Setting utterance language to en-US for English");
      }
      utterance.rate = 0.8; // Slightly slower for Telugu
      utterance.pitch = 1;
      utterance.volume = 1;
      
      console.log("📢 Utterance properties:", {
        lang: utterance.lang,
        rate: utterance.rate,
        textLength: text.length,
        textPreview: text.substring(0, 80) + "..."
      });
      
      // Add event listeners for debugging
      utterance.onstart = () => {
        console.log("✅ Speech started successfully");
      };
      
      utterance.onend = () => {
        console.log("✅ Speech ended");
      };
      
      utterance.onerror = (event) => {
        // "interrupted" and "canceled" are expected when stopping speech, not real errors
        if (event.error === "interrupted" || event.error === "canceled") {
          console.log("ℹ️ Speech interrupted (expected when stopping)");
          return;
        }
        
        // Handle language-not-supported error (check error as string since TypeScript types may not include all browser-specific errors)
        if ((event.error as string) === "language-not-supported" && lang === "te") {
          console.warn("⚠️ Telugu TTS not supported in this browser.");
          console.warn("💡 English TTS works without setup. Telugu may require OS language pack.");
          // Try falling back to English if Telugu fails
          if (text.includes("ప్రశ్న") || text.includes("ఎంపిక")) {
            console.log("🔄 Telugu TTS failed - this browser may not support Telugu voices");
          }
        }
        
        // Only log actual errors
        console.error("❌ Speech error:", event.error, event.type);
      };
      
      // Try to get Indian voice
      const voices = synthRef.current.getVoices();
      console.log("Available voices:", voices.length);
      
      if (voices.length > 0) {
        let selectedVoice = null;
        
        if (lang === "te") {
          console.log("🔍 Searching for Telugu voice...");
          console.log("📋 All available voices:", voices.map(v => `${v.name} (${v.lang})`));
          
          // Look for Telugu voice - try multiple patterns (most specific first)
          selectedVoice = voices.find(voice => 
            voice.lang === "te-IN" ||
            voice.lang.startsWith("te-IN") ||
            voice.lang === "te"
          );
          
          if (!selectedVoice) {
            selectedVoice = voices.find(voice => 
              voice.lang.startsWith("te") || 
              voice.name.toLowerCase().includes("telugu")
            );
          }
          
          // If no Telugu voice found, try any Indian voice
          if (!selectedVoice) {
            console.log("⚠️ No Telugu voice found, trying Indian voices...");
            selectedVoice = voices.find(voice => 
              voice.lang.includes("IN") || 
              voice.name.includes("India")
            );
          }
          
          // Last resort: use any available voice (better than nothing)
          if (!selectedVoice && voices.length > 0) {
            console.log("⚠️ No Telugu/Indian voice found, using default voice:", voices[0].name);
            selectedVoice = voices[0];
            // Still set language to Telugu so browser tries to pronounce Telugu text
            utterance.lang = "te-IN";
          }
          
          if (selectedVoice) {
            console.log("✅ Using voice:", selectedVoice.name, "(" + selectedVoice.lang + ")");
            utterance.voice = selectedVoice;
            // Force Telugu language even if voice language is different
            utterance.lang = "te-IN";
          } else {
            console.warn("⚠️ No Telugu voice found! Browser will try to use default voice with Telugu language setting.");
            console.warn("💡 Note: Telugu TTS may not be available in all browsers. English voices work without any setup.");
            // Still try to speak with Telugu language setting - browser will attempt pronunciation
            utterance.lang = "te-IN";
            // Try to use any available voice that might handle Telugu
            if (voices.length > 0) {
              utterance.voice = voices[0];
              console.log("🔄 Using default voice:", voices[0].name, "- may not pronounce Telugu correctly");
            }
          }
        } else {
          // Look for Indian English voice, fallback to any English
          selectedVoice = voices.find(voice => 
            voice.lang.includes("IN") || 
            voice.name.includes("India") || 
            voice.name.includes("Indian") ||
            voice.name.includes("Ravi")
          );
          
          // Fallback to any English voice if Indian not found
          if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.lang.startsWith("en"));
          }
          
          console.log("Looking for English voice");
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log("✅ Using voice:", selectedVoice.name, selectedVoice.lang);
        } else {
          console.log("⚠️ No matching voice found, using default");
        }
      } else {
        console.log("⚠️ No voices available");
      }
      
      try {
        // Check if already speaking and cancel first
        if (synthRef.current.speaking) {
          synthRef.current.cancel();
          // Wait a moment before starting new speech
          setTimeout(() => {
            if (synthRef.current && virtualQuizMaster) {
              synthRef.current.speak(utterance);
              console.log("✅ Speech synthesis triggered - check your speakers/volume");
            }
          }, 100);
        } else {
          synthRef.current.speak(utterance);
          console.log("✅ Speech synthesis triggered - check your speakers/volume");
        }
      } catch (error) {
        console.error("❌ Error speaking:", error);
        // Don't show alert for expected interruptions
        if (error instanceof Error && !error.message.includes("interrupted")) {
          console.warn("Speech synthesis warning:", error);
        }
      }
    }, 200);
  };

  // Stop speaking when Virtual Quiz Master is turned OFF
  useEffect(() => {
    if (!virtualQuizMaster) {
      stopSpeaking();
    }
  }, [virtualQuizMaster]);

  // Function to read a question
  const readQuestion = (questionIndex: number) => {
    if (!virtualQuizMaster) {
      console.log("Virtual Quiz Master is OFF, not reading question");
      return;
    }
    
    if (questionIndex < 0 || questionIndex >= questions.length) {
      console.error("Invalid question index:", questionIndex);
      return;
    }
    
    // Skip if question is already answered
    if (answeredQuestions.has(questionIndex)) {
      console.log("Question already answered, finding next unanswered");
      const nextUnanswered = answers.findIndex((ans, idx) => idx > questionIndex && !answeredQuestions.has(idx));
      if (nextUnanswered !== -1) {
        readQuestion(nextUnanswered);
      }
      return;
    }
    
    if (!synthRef.current) {
      console.error("Speech synthesis not initialized");
      return;
    }
    
    const question = questions[questionIndex];
    const lang = getCurrentLang();
    
    console.log("📖 Reading question", questionIndex + 1);
    console.log("🌐 Current i18n language:", i18n.language);
    console.log("🔤 Detected language for speech:", lang);
    console.log("❓ Question text preview:", question.question.substring(0, 50));
    
    // Check if question is actually in Telugu
    const isQuestionInTelugu = /[\u0C00-\u0C7F]/.test(question.question);
    console.log("Is question in Telugu script?", isQuestionInTelugu);
    console.log("Question text:", question.question);
    
    // Use Telugu labels only if language is Telugu AND question is in Telugu
    const useTeluguLabels = lang === "te" && isQuestionInTelugu;
    
    const questionLabel = useTeluguLabels ? "ప్రశ్న" : "Question";
    const optionLabel = useTeluguLabels ? "ఎంపిక" : "Option";
    
    // Construct question text - use Telugu number words if in Telugu
    let questionNumberText = "";
    if (useTeluguLabels) {
      // Use Telugu number words
      const teluguNumbers = ["", "ఒకటి", "రెండు", "మూడు", "నాలుగు", "అయిదు", "ఆరు", "ఏడు", "ఎనిమిది", "తొమ్మిది", "పది", "పదకొండు", "పన్నెండు", "పదమూడు", "పద్నాలుగు", "పదిహేను"];
      const num = questionIndex + 1;
      questionNumberText = num <= 15 ? teluguNumbers[num] : num.toString();
    } else {
      questionNumberText = (questionIndex + 1).toString();
    }
    
    const questionText = `${questionLabel} ${questionNumberText}. ${question.question}`;
    const optionsText = question.options
      .map((opt, idx) => {
        const optNum = useTeluguLabels && idx < 4 
          ? ["ఒకటి", "రెండు", "మూడు", "నాలుగు"][idx]
          : (idx + 1).toString();
        return `${optionLabel} ${optNum}. ${opt}`;
      })
      .join(". ");
    
    const fullText = `${questionText}. ${optionsText}`;
    console.log("Full text to speak (first 150 chars):", fullText.substring(0, 150) + "...");
    console.log("Language code for speech synthesis:", lang);
    console.log("Full text length:", fullText.length);
    
    speakText(fullText, lang);
  };

  // Handle Virtual Quiz Master toggle
  const handleToggleQuizMaster = () => {
    const newState = !virtualQuizMaster;
    console.log("🔄 Toggling Virtual Quiz Master:", newState ? "ON" : "OFF");
    
    if (!newState) {
      // Turning OFF - stop speaking first
      console.log("🛑 Stopping speech");
      stopSpeaking();
      setVirtualQuizMaster(false);
      return;
    }
    
    // Turning ON - set state first
    setVirtualQuizMaster(true);
    
    // Find first unanswered question - ALWAYS start from question 0 (index 0)
    let firstUnanswered = -1;
    for (let i = 0; i < questions.length; i++) {
      if (!answeredQuestions.has(i)) {
        firstUnanswered = i;
        break;
      }
    }
    
    console.log("📋 First unanswered question index:", firstUnanswered);
    console.log("📊 Questions available:", questions.length);
    console.log("📝 Answers array:", answers);
    console.log("✅ Answered questions:", Array.from(answeredQuestions));
    console.log("🌐 Current language:", i18n.language);
    
    if (firstUnanswered !== -1 && questions.length > 0) {
      // Start reading IMMEDIATELY - use newState to avoid stale closure
      setTimeout(() => {
        // Check if still ON (use newState from closure, not state)
        if (newState && synthRef.current) {
          console.log("🎤 Starting to read question", firstUnanswered + 1);
          readQuestion(firstUnanswered);
        } else {
          console.error("❌ Speech synthesis not available or Quiz Master turned OFF");
        }
      }, 200); // Minimal delay for immediate start
    } else if (firstUnanswered === -1 && questions.length > 0) {
      console.log("✅ All questions answered");
    } else {
      console.log("⚠️ No questions loaded yet");
    }
  };

  // Play sound effect
  const playSound = (type: "correct" | "wrong") => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      
      if (type === "correct") {
        // Success sound - two-tone chime (pleasant)
        const oscillator1 = audioContext.createOscillator();
        const oscillator2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator1.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator2.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator1.start(audioContext.currentTime);
        oscillator2.start(audioContext.currentTime);
        oscillator1.stop(audioContext.currentTime + 0.3);
        oscillator2.stop(audioContext.currentTime + 0.3);
      } else {
        // Wrong sound - low "uh-oh" descending tone (less harsh than buzzer)
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Use sine wave for softer sound, descending tone
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.25);
        
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.25);
      }
    } catch (error) {
      console.log("Audio not available:", error);
    }
  };

  const handleAnswerChange = (questionIdx: number, optionIdx: number) => {
    // Don't allow changing answer if already answered
    if (answeredQuestions.has(questionIdx)) {
      return;
    }
    
    const question = questions[questionIdx];
    const isCorrect = optionIdx === question.correct;
    
    // Mark question as answered
    setAnsweredQuestions(prev => new Set(prev).add(questionIdx));
    
    // Store result
    setQuestionResults(prev => {
      const newMap = new Map(prev);
      newMap.set(questionIdx, isCorrect);
      return newMap;
    });
    
    // Play sound effect
    playSound(isCorrect ? "correct" : "wrong");
    
    const newAnswers = [...answers];
    newAnswers[questionIdx] = optionIdx;
    setAnswers(newAnswers);
    
    // If correct, say appreciation word
    if (isCorrect && virtualQuizMaster) {
      const lang = getCurrentLang();
      const words = appreciationWords[lang as "en" | "te"] || appreciationWords.en;
      const randomWord = words[Math.floor(Math.random() * words.length)];
      
      setTimeout(() => {
        if (virtualQuizMaster && synthRef.current) {
          speakText(randomWord + "!", lang);
        }
      }, 500);
    }
    
    // Note: Celebration will show after quiz submission, not here
    
    // If Virtual Quiz Master is ON, read next unanswered question
    if (virtualQuizMaster) {
      stopSpeaking();
      
      // Find next unanswered question
      const nextUnanswered = newAnswers.findIndex((ans, idx) => idx > questionIdx && !answeredQuestions.has(idx));
      if (nextUnanswered !== -1) {
        setTimeout(() => {
          readQuestion(nextUnanswered);
        }, isCorrect ? 2000 : 800); // Wait longer if correct (for appreciation)
      }
    }
  };

  const answeredCount = useMemo(() => answeredQuestions.size, [answeredQuestions]);
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredCount = questions.length - answeredQuestions.size;
    if (unansweredCount > 0) {
      alert(tc("pleaseAnswerAllQuestions") || `Please answer all ${unansweredCount} remaining question(s).`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Quiz Participant", // Temporary name, will be collected in certificate generation
          institution: "",
          answers,
        }),
      });

      const data = await response.json();
      setResult(data);
      
      // Show celebration animation
      setShowCelebration(true);
      const lang = getCurrentLang();
      const congratsText = lang === "te" 
        ? "అభినందనలు! మీరు క్విజ్ పూర్తి చేశారు!" 
        : "Congratulations! You have completed the quiz!";
      
      if (virtualQuizMaster && synthRef.current) {
        setTimeout(() => {
          speakText(congratsText, lang);
        }, 500);
      }
      
      // Store score for certificate generation
      if (data.score !== undefined && data.total !== undefined) {
        sessionStorage.setItem("quizScore", data.score.toString());
        sessionStorage.setItem("quizTotal", data.total.toString());
        sessionStorage.setItem("activityType", "quiz");
      }
      
      // Hide celebration after 3 seconds and redirect to certificate generation
      setTimeout(() => {
        setShowCelebration(false);
        // Redirect to certificate generation after showing results briefly
        setTimeout(() => {
          router.push("/certificates/generate");
        }, 2000);
      }, 3000);
    } catch (error) {
      console.error("Error:", error);
      alert(tc("failedToSubmitQuiz"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyReference = async () => {
    if (!result?.referenceId) return;
    try {
      await navigator.clipboard.writeText(result.referenceId);
      setCopiedRefId(true);
      setTimeout(() => setCopiedRefId(false), 2000);
    } catch {
      alert(tc("copyFailed"));
    }
  };


  if (loading) {
    return (
      <div className="rs-container py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-700" />
      </div>
    );
  }

  if (result) {
    const meritCutoff = result.meritCutoff ?? Math.ceil(result.total * 0.6);
    const isMerit = (result.certificateType ?? (result.passed ? "QUIZ" : "PAR")) === "QUIZ";
    const percentage = Math.round((result.score / result.total) * 100);

    return (
      <div className="rs-container py-14 max-w-3xl space-y-6">
        <div className="rs-card p-8 space-y-4 bg-gradient-to-br from-emerald-50 to-white text-center">
          <div className="flex flex-col items-center gap-4">
            <Trophy className="h-16 w-16 text-yellow-500" />
            <div>
              <h1 className="text-3xl font-bold text-emerald-900 mb-2">
                {getCurrentLang() === "te" ? "అభినందనలు!" : "Congratulations!"}
              </h1>
              <p className="text-lg text-slate-600 mb-4">
                {getCurrentLang() === "te" 
                  ? "మీరు క్విజ్ పూర్తి చేశారు!" 
                  : "You have completed the quiz!"}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-emerald-100">
              <p className="text-sm text-emerald-600 font-semibold">{tc("yourScore")}</p>
              <p className="text-3xl font-bold text-emerald-900">{result.score} / {result.total}</p>
              <p className="text-sm text-slate-500">{percentage}% {tc("correctAnswers")}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-emerald-100">
              <p className="text-sm text-emerald-600 font-semibold">{tc("certificateType")}</p>
              <p className="text-lg font-bold text-emerald-900">{isMerit ? tc("certificateTypes.merit") : tc("certificateTypes.participant")}</p>
              <p className="text-sm text-slate-500">{isMerit ? tc("eligibleForMeritCertificate") : tc("participantCertificateGenerated")}</p>
            </div>
          </div>

          {result.referenceId && (
            <div className="rounded-2xl border border-emerald-100 bg-white/90 p-5">
              <p className="text-xs uppercase tracking-wide text-emerald-600 mb-2">{tc("referenceId")}</p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="font-semibold text-emerald-900 font-mono">{result.referenceId}</span>
                <Button variant="outline" size="sm" onClick={handleCopyReference} type="button" className="gap-2">
                  <Copy className="h-4 w-4" /> {tc("copy")}
                </Button>
              </div>
              {copiedRefId && <p className="mt-2 text-xs text-emerald-600">{tc("referenceIdCopiedToClipboard")}</p>}
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            <p className="text-base text-slate-700">
              {getCurrentLang() === "te" 
                ? "మీ సర్టిఫికేట్‌ను సృష్టించడానికి క్రింది బటన్‌ను క్లిక్ చేయండి"
                : "Click the button below to generate your certificate"}
            </p>
            <Button 
              onClick={() => {
                // Store score for certificate generation
                if (result.score !== undefined && result.total !== undefined) {
                  sessionStorage.setItem("quizScore", result.score.toString());
                  sessionStorage.setItem("quizTotal", result.total.toString());
                  sessionStorage.setItem("activityType", "quiz");
                }
                router.push("/certificates/generate");
              }} 
              className="rs-btn-primary text-base gap-2 px-8 py-6"
            >
              <Award className="h-5 w-5" /> {getCurrentLang() === "te" ? "సర్టిఫికేట్ సృష్టించండి" : "Generate Certificate"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rs-container py-14 space-y-10">
      <div className="rs-card p-8 bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="rs-chip">{tc("gamifiedQuizArena")}</span>
            <h1 className="text-3xl font-semibold text-emerald-900 mt-2">{t("quiz")}</h1>
            <p className="text-slate-600 max-w-xl">
              {tc("quizDescription")}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-sm text-emerald-700 flex flex-col gap-2">
              <p className="font-semibold flex items-center gap-2"><Target className="h-4 w-4" /> {tc("progressTracker")}</p>
              <div className="rs-progress-track">
                <div className="rs-progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <p>{answeredCount}/{questions.length} {tc("questionsMarked")}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                onClick={handleToggleQuizMaster}
                variant={virtualQuizMaster ? "default" : "outline"}
                className={`flex items-center gap-2 ${virtualQuizMaster ? "bg-emerald-600 text-white" : ""}`}
              >
                {virtualQuizMaster ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {virtualQuizMaster ? (tc("virtualQuizMasterOn") || "Virtual Quiz Master: ON") : (tc("virtualQuizMasterOff") || "Virtual Quiz Master: OFF")}
            </Button>
            {getCurrentLang() === "te" && (
              <p className="text-xs text-amber-600 text-center bg-amber-50 p-2 rounded">
                {tc("teluguTTSNote") || "Note: Telugu voice may require OS language pack. English works without setup."}
              </p>
            )}
            <Button
              type="button"
              onClick={() => {
                if (synthRef.current) {
                  const lang = getCurrentLang();
                  const testText = lang === "te" 
                    ? "టెస్ట్ స్పీచ్ సింథసిస్. మీరు దీన్ని వినగలరా?" 
                    : "Testing speech synthesis. Can you hear this?";
                  const testUtterance = new SpeechSynthesisUtterance(testText);
                  testUtterance.lang = lang === "te" ? "te-IN" : "en-US";
                  testUtterance.onstart = () => console.log("✅ Test speech started");
                  testUtterance.onerror = (e) => {
                    console.error("❌ Test speech error:", e);
                    if (lang === "te" && ((e.error as string) === "language-not-supported" || e.error === "synthesis-failed")) {
                      alert("Telugu TTS not available in this browser. Please:\n1. Install Telugu language pack in Windows Settings\n2. Or use English language for Quiz Master");
                    }
                  };
                  synthRef.current.speak(testUtterance);
                } else {
                  alert("Speech synthesis not available. Please use Chrome or Edge browser.");
                }
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              {getCurrentLang() === "te" ? "టెస్ట్ వాయిస్" : "Test Voice"}
            </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white rounded-3xl p-8 md:p-12 max-w-md mx-4 text-center shadow-2xl animate-slide-up overflow-hidden">
            {/* Confetti effect */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 5)],
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
            
            <div className="relative z-10">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl font-bold text-emerald-900 mb-2">
                {getCurrentLang() === "te" ? "అభినందనలు!" : "Congratulations!"}
              </h2>
              <p className="text-lg text-slate-600 mb-4">
                {getCurrentLang() === "te" 
                  ? "మీరు క్విజ్ పూర్తి చేశారు!" 
                  : "You have completed the quiz!"}
              </p>
              {(() => {
                const currentResult = result as { referenceId?: string | null } | null;
                if (!currentResult || !currentResult.referenceId) return null;
                return (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-emerald-600 mb-1">{tc("referenceId")}</p>
                    <p className="font-mono font-semibold text-emerald-900">{currentResult.referenceId}</p>
                  </div>
                );
              })()}
              <Button
                onClick={() => setShowCelebration(false)}
                className="rs-btn-primary"
              >
                {tc("continue") || "Continue"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={submitting || answeredCount < questions.length}
            className="rs-btn-primary"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {getCurrentLang() === "te" ? "సమర్పిస్తోంది..." : "Submitting..."}
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4 mr-2" />
                {getCurrentLang() === "te" ? "క్విజ్ పూర్తి చేయండి" : "Complete Quiz"}
              </>
            )}
          </Button>
        </div>
        {questions.map((q, idx) => {
          const isAnswered = answeredQuestions.has(idx);
          const isCorrect = questionResults.get(idx);
          const selectedOption = answers[idx];
          const correctOption = q.correct;
          
          return (
            <div 
              key={q.id} 
              className={`rs-card p-6 transition-all ${
                isAnswered 
                  ? isCorrect 
                    ? "border-2 border-green-500 bg-green-50/30" 
                    : "border-2 border-red-500 bg-red-50/30"
                  : "border border-emerald-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <h2 className="text-lg font-semibold text-emerald-900">
                    {getCurrentLang() === "te" ? `ప్రశ్న ${idx + 1}.` : `Q${idx + 1}.`} {q.question}
                  </h2>
                  {isAnswered && (
                    <div className={`flex-shrink-0 ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                      {isCorrect ? (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-xs font-semibold">{tc("correct") || "Correct"}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                          <span className="text-xs font-semibold">{tc("incorrect") || "Incorrect"}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span className="rs-badge-success">+4 {tc("points") || "pts"}</span>
              </div>
              <div className="mt-4 grid gap-2">
                {q.options.map((opt, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const isCorrectOption = optIdx === correctOption;
                  const showCorrectIndicator = isAnswered && isCorrectOption;
                  const showWrongIndicator = isAnswered && isSelected && !isCorrect;
                  
                  return (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-3 rounded-xl border-2 transition-all p-3 ${
                        isAnswered
                          ? "cursor-not-allowed opacity-70"
                          : "cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/70"
                      } ${
                        showCorrectIndicator
                          ? "border-green-500 bg-green-50 text-green-900 shadow-sm"
                          : showWrongIndicator
                          ? "border-red-500 bg-red-50 text-red-900 shadow-sm animate-buzz"
                          : isSelected
                          ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
                          : "border-emerald-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={optIdx}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(idx, optIdx)}
                        disabled={isAnswered}
                        required={!isAnswered}
                        className="disabled:cursor-not-allowed"
                      />
                      <span className="text-sm flex-1">{opt}</span>
                      {showCorrectIndicator && (
                        <span className="text-green-600 font-bold text-lg">✓</span>
                      )}
                      {showWrongIndicator && (
                        <span className="text-red-600 font-bold text-lg">✗</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleSubmit}
            size="lg"
            disabled={submitting || answeredCount < questions.length}
            className="rs-btn-primary text-base px-10"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {tc("submitting")}
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-5 w-5" /> {getCurrentLang() === "te" ? "క్విజ్ పూర్తి చేయండి" : "Complete Quiz"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}








