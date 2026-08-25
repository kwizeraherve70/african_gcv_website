import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import frCommon from "./locales/fr/common.json";
import rwCommon from "./locales/rw/common.json";
import swCommon from "./locales/sw/common.json";

import enHome from "./locales/en/home.json";
import frHome from "./locales/fr/home.json";
import rwHome from "./locales/rw/home.json";
import swHome from "./locales/sw/home.json";

import enShop from "./locales/en/shop.json";
import frShop from "./locales/fr/shop.json";
import rwShop from "./locales/rw/shop.json";
import swShop from "./locales/sw/shop.json";

import enCheckout from "./locales/en/checkout.json";
import frCheckout from "./locales/fr/checkout.json";
import rwCheckout from "./locales/rw/checkout.json";
import swCheckout from "./locales/sw/checkout.json";

import enAuth from "./locales/en/auth.json";
import frAuth from "./locales/fr/auth.json";
import rwAuth from "./locales/rw/auth.json";
import swAuth from "./locales/sw/auth.json";

import enContact from "./locales/en/contact.json";
import frContact from "./locales/fr/contact.json";
import rwContact from "./locales/rw/contact.json";
import swContact from "./locales/sw/contact.json";

import enNews from "./locales/en/news.json";
import frNews from "./locales/fr/news.json";
import rwNews from "./locales/rw/news.json";
import swNews from "./locales/sw/news.json";

import enAbout from "./locales/en/about.json";
import frAbout from "./locales/fr/about.json";
import rwAbout from "./locales/rw/about.json";
import swAbout from "./locales/sw/about.json";

import enMisc from "./locales/en/misc.json";
import frMisc from "./locales/fr/misc.json";
import rwMisc from "./locales/rw/misc.json";
import swMisc from "./locales/sw/misc.json";

// Supported UI languages (see context/project-overview.md's target feature
// list). Content stored in the database (products, news articles) is not
// translated by this system — only static UI copy is. Kinyarwanda and
// Swahili strings are an AI-generated first pass and have not been
// reviewed by a native speaker; see context/progress-tracker.md.
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "rw", label: "Kinyarwanda" },
  { code: "sw", label: "Kiswahili" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const resources = {
  en: { common: enCommon, home: enHome, shop: enShop, checkout: enCheckout, auth: enAuth, contact: enContact, news: enNews, about: enAbout, misc: enMisc },
  fr: { common: frCommon, home: frHome, shop: frShop, checkout: frCheckout, auth: frAuth, contact: frContact, news: frNews, about: frAbout, misc: frMisc },
  rw: { common: rwCommon, home: rwHome, shop: rwShop, checkout: rwCheckout, auth: rwAuth, contact: rwContact, news: rwNews, about: rwAbout, misc: rwMisc },
  sw: { common: swCommon, home: swHome, shop: swShop, checkout: swCheckout, auth: swAuth, contact: swContact, news: swNews, about: swAbout, misc: swMisc },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    defaultNS: "common",
    ns: ["common", "home", "shop", "checkout", "auth", "contact", "news", "about", "misc"],
    interpolation: { escapeValue: false }, // React already escapes
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "gcv_language",
    },
  });

export default i18n;
