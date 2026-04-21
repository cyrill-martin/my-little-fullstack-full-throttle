import type { EndpointConfig } from "@directus/extensions";
import type { Router, Request, Response } from "express";

const EXCLUDED_FIELDS = [
  "id",
  "date_created",
  "date_updated",
  "user_updated",
  "status",
  "user_created",
];

const endpoint: EndpointConfig = (router: Router, { services, getSchema }) => {
  router.get("/", async (req: Request, res: Response) => {
    try {
      const { ItemsService } = services;
      const schema = await getSchema();
      const service = new ItemsService("theme_settings", {
        knex: (req as any).knex,
        schema,
        accountability: { admin: true } as any,
      });

      const settings = (await service.readSingleton({
        fields: ["*.*"],
      })) as Record<string, unknown>;

      const lines = Object.entries(settings)
        .filter(([key]) => !EXCLUDED_FIELDS.includes(key))
        .map(([key, value]) => {
          const varName = key.replace(/_/g, "-");
          const resolved =
            typeof value === "object" && value !== null
              ? ((value as Record<string, unknown>).color ?? value)
              : value;
          return `  --${varName}: ${resolved};`;
        });

      const css = `:root {\n${lines.join("\n")}\n}`;

      res.setHeader("Content-Type", "text/css; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      res.send(css);
    } catch (err) {
      res.status(500).send("/* theme error */");
    }
  });
};

export default endpoint;
