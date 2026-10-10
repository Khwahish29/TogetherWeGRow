import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { currentUser } from "./store";
import type { User } from "./types";

interface AuthState {
  user: User | null;
  loading: boolean;
  /** The id of the person the current `user` was loaded for. */
  loadedFor: string | null;
}

const AuthContext = createContext<AuthState>({ user: null, loading: true, loadedFor: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, loadedFor: null });

  useEffect(() => {
    let active = true;
    const load = () =>
      currentUser().then((user) => {
        if (active) setState({ user, loading: false, loadedFor: user?.id ?? null });
      });
    load();
    window.addEventListener("twg:change", load);
    window.addEventListener("focus", load);
    return () => {
      active = false;
      window.removeEventListener("twg:change", load);
      window.removeEventListener("focus", load);
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
