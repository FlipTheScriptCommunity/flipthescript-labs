import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

// The simulated AWS console itself stays in English, like the real one — only
// the teaching layer (challenges, tutorial) is bilingual. Hebrew is the
// default: this is a Hebrew-language course.
export type Lang = 'he' | 'en';
export type Localized<T = string> = Record<Lang, T>;

const STORAGE_KEY = 'fts-lab-lang';

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (lang: Lang) => void;
}>({
  lang: 'he',
  setLang: () => undefined,
});

function readStoredLang(): Lang {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'en' ? 'en' : 'he';
  } catch {
    return 'he';
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readStoredLang);
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage can be unavailable (private windows, blocked site data) — the
      // choice just won't survive a reload.
    }
  }, [lang]);
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export const dirOf = (lang: Lang) => (lang === 'he' ? 'rtl' : 'ltr');
