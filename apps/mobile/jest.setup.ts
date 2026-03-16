import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import uz from './src/i18n/uz.json';
import ru from './src/i18n/ru.json';
import en from './src/i18n/en.json';

// i18n ni test muhiti uchun initialize qilish
i18next.use(initReactI18next).init({
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: 'uz',
  fallbackLng: 'uz',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});
