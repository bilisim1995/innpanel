import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// _i18nInstance global değişkenini kaldırıyoruz

export async function getClientI18n(lng: string, allResources: { [key: string]: { common: any } }) {
  const instance = i18n.createInstance(); // Her zaman yeni bir i18next örneği oluştur

  await instance
    .use(initReactI18next)
    .init({
      lng: lng,
      resources: allResources, // Tüm kaynakları init sırasında yüklüyoruz
      fallbackLng: 'en',
      debug: process.env.NODE_ENV === 'development',
      ns: ['common'],
      defaultNS: 'common',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      }
    });

  return instance;
}
