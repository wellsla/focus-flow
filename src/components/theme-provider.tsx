"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = "theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyThemeClass(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const shouldDark =
    theme === "dark" || (theme === "system" && getSystemTheme() === "dark");
  if (shouldDark) root.classList.add("dark");
  else root.classList.remove("dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (
      (localStorage.getItem(THEME_STORAGE_KEY) as Theme | null) ?? "system"
    );
  });
  const mqlRef = useRef<MediaQueryList | null>(null);

  const resolvedTheme = useMemo(() => {
    return theme === "system" ? getSystemTheme() : theme;
  }, [theme]);

  // Apply current theme choice whenever it changes
  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  // Listen to system changes when on system theme
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!mqlRef.current) {
      mqlRef.current = window.matchMedia("(prefers-color-scheme: dark)");
    }
    const handler = () => {
      if (theme === "system") applyThemeClass("system");
    };
    mqlRef.current.addEventListener?.("change", handler);
    return () => mqlRef.current?.removeEventListener?.("change", handler);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, t);
      window.dispatchEvent(
        new CustomEvent("theme-change", { detail: { theme: t } })
      );
    }
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev: Theme) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_STORAGE_KEY, next);
        window.dispatchEvent(
          new CustomEvent("theme-change", { detail: { theme: next } })
        );
      }
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggle }),
    [theme, resolvedTheme, setTheme, toggle]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
