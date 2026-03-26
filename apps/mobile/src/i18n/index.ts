import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uz from './uz';
import ru from './ru';
import en from './en';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: 'uz',
  fallbackLng: 'uz',
  interpolation: { escapeValue: false },
});

export default i18n;
export type SupportedLanguage = 'uz' | 'ru' | 'en';
