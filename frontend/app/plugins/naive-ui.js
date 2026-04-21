// Handling SSR
import { setup } from "@css-render/vue3-ssr";
import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) {
    const { collect } = setup(nuxtApp.vueApp);

    // Collect NaiveUI styles after rendering and inject into HTML head
    nuxtApp.hooks.hook("app:rendered", (ctx) => {
      const styles = collect();
      if (styles) {
        ctx.renderMeta = ctx.renderMeta || {};
        ctx.renderMeta.headTags = ctx.renderMeta.headTags || "";
        ctx.renderMeta.headTags += styles;
      }
    });
  }
});
