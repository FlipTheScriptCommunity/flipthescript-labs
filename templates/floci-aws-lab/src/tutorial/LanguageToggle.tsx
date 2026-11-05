import { useLanguage } from '../lib/i18n';

// Fixed dir="rtl" regardless of the active language, so its two buttons don't
// swap sides every time the language changes (עברית always right, EN left).
export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div
      className="fts-lang-toggle"
      dir="rtl"
      role="group"
      aria-label="Language / שפה"
    >
      <button
        type="button"
        className={lang === 'he' ? 'active' : ''}
        onClick={() => setLang('he')}
      >
        עברית
      </button>
      <button
        type="button"
        className={lang === 'en' ? 'active' : ''}
        onClick={() => setLang('en')}
      >
        EN
      </button>
    </div>
  );
}
