// This composable handles the communication with Directus
import { createDirectus, rest, readItems, readSingleton } from "@directus/sdk";

export const useDirectus = () => {
  const config = useRuntimeConfig();

  // Internal URL for server-side API calls, public URL for client
  const apiUrl = import.meta.server
    ? config.directusUrl
    : config.public.directusUrl;

  // Always public — this ends up in the DOM (img src, etc.)
  const publicUrl = config.public.directusUrl;

  const client = createDirectus(apiUrl).with(rest());

  const getItems = async (collection, query = {}) => {
    return await client.request(readItems(collection, query));
  };

  const getSingleton = async (collection, query = {}) => {
    return await client.request(readSingleton(collection, query));
  };

  const assetUrl = (id) => `${publicUrl}/assets/${id}`;

  return { client, getItems, getSingleton, assetUrl };
};
