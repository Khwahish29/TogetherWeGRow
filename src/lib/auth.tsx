import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { currentUser, currentUserId } from "./store";
import type { User } from "./types";

interface AuthState {
  user: User | null;
  loading: boolean;
  /** The session id the current `user` was loaded for. */
  loadedFor: string | null;
}

const AuthContext = createContext<AuthState>({ user: null, loading: true, loadedFor: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, loadedFor: null });

  useEffect(() => {
    const load = () => {
      const sessionId = currentUserId();
      currentUser().then((user) => setState({ user, loading: false, loadedFor: user ? sessionId : null }));
    };
    load();
    window.addEventListener("twg:change", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("twg:change", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
