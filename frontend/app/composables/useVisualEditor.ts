import { setAttr, apply } from "@directus/visual-editing";

type EditConfig = Parameters<typeof setAttr>[0];

export const useVisualEditor = () => {
  const { directusUrl } = useRuntimeConfig().public;

  const isVisualEditor = computed(() => {
    if (import.meta.server) return false;
    return window !== window.parent;
  });

  let editorInstance: Awaited<ReturnType<typeof apply>> = undefined;

  const applyEditor = () => {
    if (!isVisualEditor.value) return;

    nextTick(async () => {
      if (editorInstance) {
        editorInstance.remove();
      }
      editorInstance = await apply({
        directusUrl,
        onSaved: () => {
          refreshNuxtData();
        },
      });
    });
  };

  // Returns a data attribute string for the Directus visual editor
  const editableAttr = (options: EditConfig): string => {
    return setAttr(options);
  };

  return {
    isVisualEditor,
    editableAttr,
    applyEditor,
  };
};
