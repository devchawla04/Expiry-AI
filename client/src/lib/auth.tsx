import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, TOKEN_KEY } from "./api";
import type { User } from "./types";

type Session = { token: string; user: User };

type AuthValue = {
  user: User | null;
  loading: boolean;
  applySession: (session: Session) => void;
  setUser: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setLoading(false);
      return;
    }
    api<User>("/api/auth/me")
      .then(setUserState)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUserState(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      applySession: (session) => {
        localStorage.setItem(TOKEN_KEY, session.token);
        setUserState(session.user);
      },
      setUser: setUserState,
      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        setUserState(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
