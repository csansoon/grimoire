import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";
import { Language, Translations } from "./types";
import en from "./translations/en";
import es from "./translations/es";

const TRANSLATIONS: Record<Language, Translations> = { en, es };

const STORAGE_KEY = "grimoire_language";

function getInitialLanguage(): Language {
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "es") {
        return stored;
    }

    // Check browser language
    const browserLang = navigator.language.slice(0, 2);
    if (browserLang === "es") {
        return "es";
    }

    return "en";
}

type I18nContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
};

const I18nContext = createContext<I18nContextType | null>(null);

type Props = {
    children: ReactNode;
};

export function I18nProvider({ children }: Props) {
    const [language, setLanguageState] = useState<Language>(getInitialLanguage);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEY, lang);
    }, []);

    const t = useMemo(() => TRANSLATIONS[language], [language]);

    const value = useMemo(
        () => ({ language, setLanguage, t }),
        [language, setLanguage, t]
    );

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n(): I18nContextType {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error("useI18n must be used within an I18nProvider");
    }
    return context;
}

// Helper function to interpolate variables in strings
// Usage: interpolate("Hello {name}!", { name: "World" }) => "Hello World!"
export function interpolate(template: string, vars: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}
