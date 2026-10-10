import { Mic, Square } from "lucide-react";
import { useSpeech } from "../lib/useSpeech";

/** Start/stop microphone button that appends recognised speech via `onText`. */
export function VoiceRecorder({
  onText,
  compact = false,
  large = false,
}: {
  onText: (text: string) => void;
  compact?: boolean;
  /** A big, centred microphone for the main voice-first screens. */
  large?: boolean;
}) {
  const { supported, listening, interim, error, start, stop } = useSpeech(onText);

  if (large) {
    if (!supported) {
      return (
        <div className="rounded-2xl bg-warm-100/70 p-5 text-center text-muted">
          Voice input isn't available in this browser. Typing below works just as well. (Chrome and Edge support voice.)
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <button
          type="button"
          onClick={listening ? stop : start}
          aria-pressed={listening}
          aria-label={listening ? "Stop recording" : "Start recording"}
          className={`relative flex h-28 w-28 items-center justify-center rounded-full text-white shadow-[0_18px_40px_-16px_rgba(20,43,33,0.6)] transition ${
            listening ? "bg-warm-600 hover:bg-warm-700" : "bg-brand-700 hover:bg-brand-800"
          }`}
        >
          {listening && <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-warm-500/40 motion-reduce:hidden" />}
          {listening ? <Square aria-hidden="true" className="relative h-9 w-9 fill-current" /> : <Mic aria-hidden="true" className="h-11 w-11" />}
        </button>
        <p className="text-lg font-semibold text-brand-900">{listening ? "Listening. Tap to stop." : "Tap to speak"}</p>
        <p aria-live="polite" className="min-h-[3em] max-w-md text-muted">
          {listening ? (interim ? `“${interim}”` : "Speak naturally and take your time. Pauses are fine.") : "Your words will appear in the box below."}
        </p>
        {error && (
          <p role="alert" className="font-semibold text-rose-800">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (!supported) {
    return compact ? null : (
      <p className="hint">Voice input isn't available in this browser. Typing works just as well. (Chrome and Edge support voice.)</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={listening ? stop : start}
        aria-pressed={listening}
        className={listening ? "btn bg-warm-600 text-white hover:bg-warm-700" : compact ? "btn-secondary" : "btn-warm"}
      >
        <span aria-hidden="true" className={`inline-block h-3 w-3 rounded-full ${listening ? "animate-pulse bg-white" : "bg-current"}`} />
        {listening ? "Stop recording" : compact ? "Speak" : "Start recording"}
      </button>
      <p aria-live="polite" className="hint min-h-[1.5em]">
        {listening ? (interim ? `Hearing: “${interim}”` : "Listening… speak naturally, take your time.") : ""}
      </p>
      {error && (
        <p role="alert" className="text-sm font-bold text-rose-800">
          {error}
        </p>
      )}
    </div>
  );
}
