// Runs once per request on the server during SSR. Fetches the theme_settings
// date_updated to build a cache-busting URL for the CSS stylesheet. The browser
// caches the CSS long-term; the URL only changes when the designer saves in Directus.
// On client-side navigation, Nuxt does not re-run plugins, so no extra requests.
export default defineNuxtPlugin(async () => {
  const { getSingleton } = useDirectus();
  const { public: { directusUrl } } = useRuntimeConfig();

  const settings = await getSingleton("theme_settings", {
    fields: ["date_updated"],
  });

  useHead({
    link: [
      {
        rel: "stylesheet",
        href: `${directusUrl}/theme-css?v=${settings.date_updated}`,
        crossorigin: "anonymous",
      },
    ],
  });
});
