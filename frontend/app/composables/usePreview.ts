// This composable handles the preview mode (mainly for the preview feature in Directus)

interface DirectusFilter {
  id?: { _eq: number };
  status?: { _eq: string };
}

export const usePreview = () => {
  const route = useRoute();

  const isPreview = computed(() => route.query.preview === "true");

  // Returns a Directus filter object based on the id and preview mode
  const getFilter = (id: number | null = null): DirectusFilter => {
    const filter: DirectusFilter = {};

    if (id) {
      filter.id = { _eq: id };
    }

    if (!isPreview.value) {
      filter.status = { _eq: "published" };
    }

    return filter;
  };

  return {
    isPreview,
    getFilter,
  };
};
