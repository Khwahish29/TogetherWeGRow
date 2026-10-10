import { useEffect, useState } from "react";

/** Loads data from the store and reloads whenever the store changes. */
export function useStore<T>(loader: () => Promise<T>, initial: T): T {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    let active = true;
    const load = () => loader().then((v) => active && setValue(v));
    load();
    window.addEventListener("twg:change", load);
    return () => {
      active = false;
      window.removeEventListener("twg:change", load);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}
