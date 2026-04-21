import { defineHook } from "@directus/extensions-sdk";

export default defineHook(({ action }, { services, database, getSchema }) => {
  const { ItemsService } = services;

  action("pages_translations.items.create", async ({ payload, key }) => {
    await computePath(
      key,
      payload.slug,
      payload.pages_id,
      payload.languages_code,
    );
  });

  action("pages_translations.items.update", async ({ payload, keys }) => {
    for (const key of keys) {
      await computePath(
        key,
        payload.slug,
        payload.pages_id,
        payload.languages_code,
      );
    }
  });

  async function computePath(
    key: string,
    slug: string,
    pagesId: number,
    languagesCode: string,
  ): Promise<void> {
    const schema = await getSchema();
    const translationsService = new ItemsService("pages_translations", {
      knex: database,
      schema,
    });

    if (!slug || !pagesId || !languagesCode) {
      const translation = await database("pages_translations")
        .where({ id: key })
        .select("pages_id", "languages_code", "slug")
        .first();
      slug = slug ?? translation.slug;
      pagesId = pagesId ?? translation.pages_id;
      languagesCode = languagesCode ?? translation.languages_code;
    }

    // languages_code may arrive as an object { code: 'de-CH' } when coming from the service layer
    const langCode =
      typeof languagesCode === "object" && languagesCode !== null
        ? (languagesCode as { code: string }).code
        : (languagesCode as string);

    // Walk the page tree to build the full path, ignoring any stale stored paths.
    async function buildPath(
      pageId: number,
      pageSlug: string,
      langCode: string,
    ): Promise<string> {
      // Query the DB directly to avoid M2O resolution quirks with self-referential relations.
      const row = await database("pages")
        .where({ id: pageId })
        .select("parent")
        .first();

      if (!row?.parent) {
        return "/" + pageSlug;
      }

      const parentRow = await database("pages_translations")
        .where({ pages_id: row.parent, languages_code: langCode })
        .select("slug", "pages_id")
        .first();

      if (!parentRow) {
        return "/" + pageSlug;
      }

      const parentPath = await buildPath(
        parentRow.pages_id,
        parentRow.slug,
        langCode,
      );
      return parentPath + "/" + pageSlug;
    }

    const path = await buildPath(pagesId, slug, langCode);

    await translationsService.updateOne(key, { path }, { emitEvents: false });
  }
});
