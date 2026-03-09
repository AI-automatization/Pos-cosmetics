import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import uz from './uz.json';
import ru from './ru.json';
import en from './en.json';

const LANGUAGE_KEY = 'app_language';

const resources = {
  uz: { translation: uz },
  ru: { translation: ru },
  en: { translation: en },
};

export async function initI18n(): Promise<void> {
  const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY).catch(() => null);

  await i18n.use(initReactI18next).init({
    resources,
    lng: savedLang ?? 'uz',
    fallbackLng: 'uz',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  });
}

export async function changeLanguage(lang: 'uz' | 'ru' | 'en'): Promise<void> {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
}

export type SupportedLanguage = 'uz' | 'ru' | 'en';

export default i18n;
