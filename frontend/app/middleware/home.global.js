// Middleware handling redirects from root or /de or /en to ../home
export default defineNuxtRouteMiddleware((to) => {
  const validPaths = ["/", "/de", "/de/", "/en", "/en/"]; // Paths to redirect to {{locale}}/home
  if (validPaths.includes(to.path)) {
    const locale = useNuxtApp().$i18n.locale.value;
    return navigateTo(`/${locale}/home`, { redirectCode: 301 });
  }
});
