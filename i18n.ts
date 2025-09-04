import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

let _i18nInstance: any = null;

export async function getClientI18n(lng: string, resources: any) {
  if (!_i18nInstance) {
    _i18nInstance = i18n.createInstance();

    await _i18nInstance
      .use(initReactI18next)
      .init({
        lng,
        resources,
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
  } else if (_i18nInstance.language !== lng) {
    await _i18nInstance.changeLanguage(lng);
  }

  return _i18nInstance;
}
