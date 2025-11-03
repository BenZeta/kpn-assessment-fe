import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

const backendOptions = {
  loadPath: `${import.meta.env.VITE_API_URL}/languages/elements?lng={{lng}}`,
};

i18n
  .use(Backend)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    backend: backendOptions,
  });

export default i18n;
