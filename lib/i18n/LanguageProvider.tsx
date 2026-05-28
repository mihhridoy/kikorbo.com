'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { dictionary, type Lang } from './dictionary';

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function readStoredLang(): Lang | null {
  if (typeof document === 'undefined') return null;
  try {
    const ls = window.localStorage.getItem('lang');
    if (ls === 'en' || ls === 'bn') return ls;
  } catch {
    /* ignore */
  }
  const match = document.cookie.match(/(?:^|;\s*)lang=(en|bn)/);
  return (match?.[1] as Lang) ?? null;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always start at 'bn' so server and first client render match (no hydration mismatch).
  const [lang, setLangState] = useState<Lang>('bn');

  useEffect(() => {
    const stored = readStoredLang();
    if (stored && stored !== lang) {
      setLangState(stored);
      document.documentElement.lang = stored;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem('lang', l);
    } catch {
      /* ignore */
    }
    document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = l;
  }, []);

  const toggle = useCallback(() => {
    setLang(lang === 'bn' ? 'en' : 'bn');
  }, [lang, setLang]);

  const t = useCallback(
    (key: string) => dictionary[lang][key] ?? dictionary.bn[key] ?? key,
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
