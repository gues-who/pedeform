"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  type User 
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type AppUser = User & { role?: "admin" | "kitchen" | "client" };

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

import { useRouter } from "next/navigation";

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // GitHub Pages SPA redirect handler
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redirectPath = params.get("p");
      if (redirectPath) {
        // Remove 'p' from URL and replace with the intended path
        params.delete("p");
        const newSearch = params.toString();
        router.replace(redirectPath + (newSearch ? "?" + newSearch : ""));
      }
    }
  }, [router]);

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }
    const firestore = db;
    return onAuthStateChanged(auth, async (u) => {
      if (u) {
        const docRef = doc(firestore, "users", u.uid);
        const snap = await getDoc(docRef);
        const role = snap.exists() ? snap.data().role : "client";
        setUser({ ...u, role } as AppUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  const login = async (email: string, pass: string) => {
    if (!auth) throw new Error("Firebase não configurado neste ambiente.");
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
