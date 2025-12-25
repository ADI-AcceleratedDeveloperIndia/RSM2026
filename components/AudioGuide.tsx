"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { initializeTTS, speakText, stopSpeaking, isSpeaking } from "@/utils/tts";
import { useTranslation } from "react-i18next";

interface AudioGuideProps {
  content: string | (() => string); // Content to read - can be string or function that returns string
  label?: string; // Button label (default: "Audio Guide")
  className?: string; // Additional CSS classes
}

export default function AudioGuide({ content, label = "Audio Guide", className = "" }: AudioGuideProps) {
  const { i18n } = useTranslation("common");
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Initialize TTS on mount
    if (!initializedRef.current) {
      initializedRef.current = true;
      initializeTTS();
    }

    // Cleanup: stop speaking when component unmounts
    return () => {
      if (isActive) {
        stopSpeaking();
      }
    };
  }, []);

  useEffect(() => {
    // Stop speaking when isActive becomes false
    if (!isActive) {
      stopSpeaking();
    }
  }, [isActive]);

  const handleToggle = () => {
    if (isActive) {
      // Stop speaking
      stopSpeaking();
      setIsActive(false);
    } else {
      // Start speaking
      setIsLoading(true);
      const textToSpeak = typeof content === "function" ? content() : content;
      
      if (!textToSpeak || textToSpeak.trim() === "") {
        setIsLoading(false);
        return;
      }

      setIsActive(true);
      setIsLoading(false);

      // Use current language from i18n
      const lang = i18n.language === "te" ? "te" : "en";
      
      speakText(
        textToSpeak,
        lang,
        () => {
          // onStart
          setIsActive(true);
        },
        () => {
          // onEnd
          setIsActive(false);
        },
        (error) => {
          // onError
          console.error("Audio Guide error:", error);
          setIsActive(false);
          const errorMsg = lang === "te" 
            ? "ఆడియో ప్లేబ్యాక్ విఫలమైంది. దయచేసి మీ బ్రౌజర్ యొక్క స్పీచ్ సింథసిస్ మద్దతును తనిఖీ చేయండి."
            : "Audio playback failed. Please check your browser's speech synthesis support.";
          alert(errorMsg);
        }
      );
    }
  };

  // Check if currently speaking (in case it was started elsewhere)
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const speaking = isSpeaking();
      if (speaking !== isActive) {
        setIsActive(speaking);
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, [isActive]);

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      className={`gap-2 ${className}`}
      variant={isActive ? "default" : "outline"}
      aria-label={isActive ? "Stop Audio Guide" : "Start Audio Guide"}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : isActive ? (
        <>
          <VolumeX className="h-4 w-4" />
          <span>Stop Audio</span>
        </>
      ) : (
        <>
          <Volume2 className="h-4 w-4" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}

