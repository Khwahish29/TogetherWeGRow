import { useCallback, useEffect, useRef, useState } from "react";

// Minimal typing for the browser Web Speech API (not in TS's DOM lib).
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as (new () => SpeechRecognitionLike) | null;
}

/**
 * Speech-to-text in the browser. Audio is processed by the browser and never stored by us.
 * `onFinal` receives each finished phrase.
 */
export function useSpeech(onFinal: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;
  const supported = typeof window !== "undefined" && getRecognitionCtor() !== null;

  const stop = useCallback(() => {
    recRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    setError(null);
    const rec = new Ctor();
    rec.lang = navigator.language || "en-GB";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let pending = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) onFinalRef.current(result[0].transcript.trim());
        else pending += result[0].transcript;
      }
      setInterim(pending);
    };
    rec.onerror = (e) => {
      setError(
        e.error === "not-allowed"
          ? "Microphone access was blocked. You can allow it in your browser settings, or type instead."
          : "We couldn't hear that clearly. Please try again, or type instead.",
      );
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
    };
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, []);

  useEffect(() => () => recRef.current?.stop(), []);

  return { supported, listening, interim, error, start, stop };
}
