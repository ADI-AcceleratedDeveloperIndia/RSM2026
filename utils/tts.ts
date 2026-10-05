/**
 * Shared Text-to-Speech utility for consistent Indian English voice
 * Optimized for accessibility - clear pronunciation for blind users
 */

let cachedEnglishVoice: SpeechSynthesisVoice | null = null;
let cachedTeluguVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;
let teluguVoiceAvailable = false;

/**
 * Initialize and cache the best Indian English and Telugu voices
 */
export function initializeTTS(): Promise<{ english: SpeechSynthesisVoice | null; telugu: SpeechSynthesisVoice | null; teluguAvailable: boolean }> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve({ english: null, telugu: null, teluguAvailable: false });
      return;
    }

    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const voices = synth.getVoices();
      
      if (voices.length === 0) {
        // Voices not loaded yet, try again
        setTimeout(loadVoices, 100);
        return;
      }

      voicesLoaded = true;

      // ===== ENGLISH VOICE SELECTION =====
      // Priority order for English voice:
      // 1. Indian English (en-IN) - Google TTS preferred
      // 2. British English (en-GB)
      // 3. US English (en-US)
      // 4. Any English voice

      let selectedEnglishVoice = voices.find(
        (v) =>
          v.lang === "en-IN" &&
          (v.name.toLowerCase().includes("google") ||
            v.name.toLowerCase().includes("neural") ||
            v.name.toLowerCase().includes("premium"))
      );

      if (!selectedEnglishVoice) {
        selectedEnglishVoice = voices.find((v) => v.lang === "en-IN");
      }

      if (!selectedEnglishVoice) {
        selectedEnglishVoice = voices.find(
          (v) =>
            v.lang === "en-GB" &&
            (v.name.toLowerCase().includes("google") ||
              v.name.toLowerCase().includes("neural") ||
              v.name.toLowerCase().includes("premium"))
        );
      }

      if (!selectedEnglishVoice) {
        selectedEnglishVoice = voices.find((v) => v.lang === "en-GB");
      }

      if (!selectedEnglishVoice) {
        selectedEnglishVoice = voices.find(
          (v) =>
            v.lang === "en-US" &&
            (v.name.toLowerCase().includes("google") ||
              v.name.toLowerCase().includes("neural") ||
              v.name.toLowerCase().includes("premium"))
        );
      }

      if (!selectedEnglishVoice) {
        selectedEnglishVoice = voices.find((v) => v.lang === "en-US");
      }

      if (!selectedEnglishVoice) {
        selectedEnglishVoice = voices.find((v) => v.lang.startsWith("en"));
      }

      cachedEnglishVoice = selectedEnglishVoice || null;

      // ===== TELUGU VOICE SELECTION =====
      // Look for Telugu voices (te-IN)
      let selectedTeluguVoice = voices.find(
        (v) =>
          v.lang === "te-IN" &&
          (v.name.toLowerCase().includes("google") ||
            v.name.toLowerCase().includes("neural") ||
            v.name.toLowerCase().includes("premium"))
      );

      if (!selectedTeluguVoice) {
        selectedTeluguVoice = voices.find((v) => v.lang === "te-IN");
      }

      if (!selectedTeluguVoice) {
        // Try any Telugu voice
        selectedTeluguVoice = voices.find((v) => v.lang.startsWith("te"));
      }

      cachedTeluguVoice = selectedTeluguVoice || null;
      teluguVoiceAvailable = cachedTeluguVoice !== null;

      if (cachedEnglishVoice) {
        console.log(
          "✅ English TTS Voice selected:",
          cachedEnglishVoice.name,
          `(${cachedEnglishVoice.lang})`
        );
      }

      if (cachedTeluguVoice) {
        console.log(
          "✅ Telugu TTS Voice selected:",
          cachedTeluguVoice.name,
          `(${cachedTeluguVoice.lang})`
        );
      } else {
        console.log("ℹ️ Telugu TTS Voice not available. User needs to install Telugu language pack.");
      }

      resolve({
        english: cachedEnglishVoice,
        telugu: cachedTeluguVoice,
        teluguAvailable: teluguVoiceAvailable
      });
    };

    // Try to load voices immediately
    loadVoices();

    // Also listen for voice changes (important for Chrome)
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    // Force load after delays (Chrome needs this)
    setTimeout(loadVoices, 100);
    setTimeout(loadVoices, 500);
    setTimeout(loadVoices, 1000);
  });
}

/**
 * Get the cached English voice (call initializeTTS first)
 */
export function getCachedEnglishVoice(): SpeechSynthesisVoice | null {
  return cachedEnglishVoice;
}

/**
 * Get the cached Telugu voice (call initializeTTS first)
 */
export function getCachedTeluguVoice(): SpeechSynthesisVoice | null {
  return cachedTeluguVoice;
}

/**
 * Check if Telugu voice is available
 */
export function isTeluguVoiceAvailable(): boolean {
  return teluguVoiceAvailable;
}

/**
 * Speak text with appropriate voice based on language
 * Optimized for clarity and accessibility
 * @param text - Text to speak
 * @param lang - Language code: "en" or "te"
 * @param onStart - Callback when speech starts
 * @param onEnd - Callback when speech ends
 * @param onError - Callback on error
 */
export function speakText(
  text: string,
  lang: "en" | "te" = "en",
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (error: SpeechSynthesisErrorEvent) => void
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("⚠️ Speech synthesis not available");
    return;
  }

  const synth = window.speechSynthesis;

  // Stop any current speech
  if (synth.speaking) {
    synth.cancel();
  }

  // Wait a moment for cancellation
  setTimeout(() => {
    if (!voicesLoaded) {
      // Initialize if not done yet
      initializeTTS().then(({ english, telugu }) => {
        const voice = lang === "te" ? telugu : english;
        if (voice) {
          speakWithVoice(text, voice, lang, onStart, onEnd, onError);
        } else if (lang === "te") {
          // Telugu voice not available, fallback to English
          console.warn("⚠️ Telugu voice not available, falling back to English");
          if (english) {
            speakWithVoice(text, english, "en", onStart, onEnd, onError);
          }
        } else {
          speakWithVoice(text, english, "en", onStart, onEnd, onError);
        }
      });
    } else {
      const voice = lang === "te" ? cachedTeluguVoice : cachedEnglishVoice;
      if (voice) {
        speakWithVoice(text, voice, lang, onStart, onEnd, onError);
      } else if (lang === "te") {
        // Telugu voice not available, fallback to English
        console.warn("⚠️ Telugu voice not available, falling back to English");
        if (cachedEnglishVoice) {
          speakWithVoice(text, cachedEnglishVoice, "en", onStart, onEnd, onError);
        }
      } else {
        speakWithVoice(text, cachedEnglishVoice, "en", onStart, onEnd, onError);
      }
    }
  }, 100);
}

function speakWithVoice(
  text: string,
  voice: SpeechSynthesisVoice | null,
  lang: "en" | "te",
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (error: SpeechSynthesisErrorEvent) => void
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);

  // Set language
  utterance.lang = lang === "te" ? "te-IN" : "en-IN";

  // Optimize for clarity
  utterance.rate = 1.0; // Normal speed (not too fast for blind users)
  utterance.pitch = 1.0; // Natural pitch
  utterance.volume = 1.0; // Full volume

  // Use cached voice
  if (voice) {
    utterance.voice = voice;
  }

  // Event handlers
  utterance.onstart = () => {
    console.log(`✅ Speech started (${lang})`);
    onStart?.();
  };

  utterance.onend = () => {
    console.log(`✅ Speech ended (${lang})`);
    onEnd?.();
  };

  utterance.onerror = (event) => {
    // Ignore expected interruptions
    if (event.error === "interrupted" || event.error === "canceled") {
      return;
    }
    console.error(`❌ Speech error (${lang}):`, event.error);
    onError?.(event);
  };

  try {
    synth.speak(utterance);
  } catch (error) {
    console.error("❌ Error speaking:", error);
  }
}

/**
 * Stop current speech
 */
export function stopSpeaking(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const synth = window.speechSynthesis;
  if (synth.speaking) {
    synth.cancel();
  }
}

/**
 * Check if speech is currently active
 */
export function isSpeaking(): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  return window.speechSynthesis.speaking;
}

