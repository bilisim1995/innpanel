import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// LanguageDetector kaldırıldı
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  // .use(LanguageDetector) // LanguageDetector kaldırıldı
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    ns: ['common'], // 'common.json' dosyasını yüklemesini sağlar
    defaultNS: 'common', // Varsayılan namespace'i 'common' olarak ayarlar
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;