import { useSpeech } from "../lib/useSpeech";

/** Start/stop microphone button that appends recognised speech via `onText`. */
export function VoiceRecorder({ onText, compact = false }: { onText: (text: string) => void; compact?: boolean }) {
  const { supported, listening, interim, error, start, stop } = useSpeech(onText);

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
        className={listening ? "btn bg-rose-700 text-white hover:bg-rose-800" : compact ? "btn-secondary" : "btn-warm"}
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
