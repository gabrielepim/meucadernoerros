import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getStoredUser, getToken, type ApiUser } from "@/integrations/api/client";

interface AuthContextValue {
  user: ApiUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      api.auth.me()
        .then(u => { setUser(u); setLoading(false); })
        .catch(() => { api.auth.logout(); setUser(null); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await api.auth.login(email, password);
      setUser(res.user);
      return { error: null };
    } catch (e: any) {
      return { error: e.message ?? "Erro ao fazer login" };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const res = await api.auth.register(email, password);
      setUser(res.user);
      return { error: null };
    } catch (e: any) {
      return { error: e.message ?? "Erro ao criar conta" };
    }
  };

  const signOut = () => {
    api.auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
