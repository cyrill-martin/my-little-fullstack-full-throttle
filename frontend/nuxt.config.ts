// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  runtimeConfig: {
    // The env variables are set in the docker-compose.yml
    // The localhost URLs are fallbacks in case the environment variables are not set
    directusUrl: process.env.NUXT_DIRECTUS_URL || "http://localhost:8055",
    public: {
      directusUrl:
        process.env.NUXT_PUBLIC_DIRECTUS_URL || "http://localhost:8055",
    },
  },
  modules: ["@nuxtjs/i18n"],
  i18n: {
    locales: [
      {
        code: "de",
        language: "de-CH",
        name: "Deutsch",
      },
      {
        code: "en",
        language: "en-US",
        name: "English",
      },
    ],
    baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
    defaultLocale: "de",
    strategy: "prefix",
    detectBrowserLanguage: {
      useCookie: false,
      // cookieKey: "i18n_lang",
      redirectOn: "root",
    },
  },
  build: {
    transpile: [
      "naive-ui",
      "vueuc",
      "@css-render/vue3-ssr",
      "css-render",
      "@juggle/resize-observer",
    ],
  },
  // Allow x-frame options for Directus preview
  nitro: {
    routeRules: {
      "/**": {
        headers: {
          "X-Frame-Options": "ALLOWALL",
          "Content-Security-Policy": `frame-ancestors 'self' http://localhost:8055 ${process.env.NUXT_PUBLIC_DIRECTUS_URL}`,
        },
      },
    },
  },
});
