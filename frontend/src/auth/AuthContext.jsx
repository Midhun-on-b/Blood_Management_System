import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clearSession,
  getAccessToken,
  getAuthUser,
  setSession,
} from "./session";
import { apiFetch } from "../services/http";

const AuthContext = createContext(null);

function readJsonSafe(res) {
  return res.text().then((raw) => {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getAuthUser());
  const [accessToken, setAccessToken] = useState(getAccessToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = () => {
      setUser(getAuthUser());
      setAccessToken(getAccessToken());
    };

    window.addEventListener("hema-auth-changed", sync);
    return () => window.removeEventListener("hema-auth-changed", sync);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (!getAccessToken()) {
          setLoading(false);
          return;
        }

        const meRes = await apiFetch("/auth/me");
        if (!meRes.ok) {
          clearSession();
          setLoading(false);
          return;
        }

        const me = await readJsonSafe(meRes);
        if (me?.user) {
          setSession({
            accessToken: getAccessToken(),
            user: me.user,
          });
        } else {
          clearSession();
        }
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const signIn = async ({ email, password, role }) => {
    if (!role) {
      throw new Error("Role is required for login");
    }

    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    });
    const data = await readJsonSafe(res);

    if (!res.ok) {
      throw new Error(data?.message || "Login failed");
    }

    if (!data?.access_token || !data?.user) {
      throw new Error("Invalid login response");
    }

    setSession({ accessToken: data.access_token, user: data.user });
    return data.user;
  };

  const signOut = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // no-op
    } finally {
      clearSession();
    }
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      isAuthenticated: Boolean(user && accessToken),
      signIn,
      signOut,
    }),
    [user, accessToken, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

