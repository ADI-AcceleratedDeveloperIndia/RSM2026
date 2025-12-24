import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enCommon from "@/locales/en/common.json";
import enContent from "@/locales/en/content.json";
import enQuiz from "@/locales/en/quiz.json";
import teCommon from "@/locales/te/common.json";
import teContent from "@/locales/te/content.json";
import teQuiz from "@/locales/te/quiz.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        content: enContent,
        quiz: enQuiz,
      },
      te: {
        common: teCommon,
        content: teContent,
        quiz: teQuiz,
      },
    },
    lng: "en",
    fallbackLng: "en",
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;










