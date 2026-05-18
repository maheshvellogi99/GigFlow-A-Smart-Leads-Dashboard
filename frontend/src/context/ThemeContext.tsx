// ============================================================
// GigFlow Frontend — Theme Context
// Manages light/dark mode with localStorage persistence.
// Applies 'dark' class to <html> element for Tailwind.
// ============================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

// ---- Types ----

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

interface ThemeProviderProps {
  children: ReactNode;
}

// ---- Constants ----

const THEME_KEY: string = "gigflow_theme";

// ---- Context ----

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ---- Provider ----

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>((): Theme => {
    const stored: string | null = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect((): void => {
    const root: HTMLElement = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback((): void => {
    setTheme((prev: Theme): Theme => (prev === "dark" ? "light" : "dark"));
  }, []);

  const isDark: boolean = theme === "dark";

  const contextValue: ThemeContextValue = useMemo(
    (): ThemeContextValue => ({ theme, toggleTheme, isDark }),
    [theme, toggleTheme, isDark]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// ---- Hook ----

const useTheme = (): ThemeContextValue => {
  const context: ThemeContextValue | undefined = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }
  return context;
};

export { ThemeProvider, useTheme };
export type { Theme };
