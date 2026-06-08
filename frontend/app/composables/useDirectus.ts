// This composable handles the communication with Directus
import { createDirectus, rest, readItems, readSingleton } from "@directus/sdk";
import type { Query } from "@directus/sdk";

export const useDirectus = () => {
  const config = useRuntimeConfig();

  // Internal URL for server-side API calls, public URL for client
  const apiUrl = import.meta.server
    ? config.directusUrl
    : config.public.directusUrl;

  // Always public — this ends up in the DOM (img src, etc.)
  const publicUrl = config.public.directusUrl;

  const client = createDirectus(apiUrl).with(rest());

  const getItems = async (collection: string, query: Query<any, any> = {}) => {
    return await client.request(readItems(collection as any, query));
  };

  const getSingleton = async (collection: string, query: Query<any, any> = {}) => {
    return await client.request(readSingleton(collection as any, query));
  };

  const assetUrl = (id: string) => `${publicUrl}/assets/${id}`;

  return { client, getItems, getSingleton, assetUrl };
};
