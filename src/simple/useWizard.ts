import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Keeps a step-by-step flow in the address bar (?step=N) so the Back button and the browser's
 * own back both go to the previous question, and remembers answers if the page is reloaded.
 */
export function useWizard<T extends object>(key: string, initial: T) {
  const [params, setParams] = useSearchParams();
  const step = Math.max(0, Number(params.get("step") ?? 0) || 0);
  const [data, setData] = useState<T>(() => {
    try {
      return { ...initial, ...JSON.parse(sessionStorage.getItem(key) ?? "{}") };
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [key, data]);

  const go = (n: number) => setParams(n === 0 ? {} : { step: String(n) });
  const set = <K extends keyof T>(k: K, v: T[K]) => setData((d) => ({ ...d, [k]: v }));
  const reset = () => {
    setData(initial);
    try {
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
  };
  return { step, go, data, set, reset };
}
