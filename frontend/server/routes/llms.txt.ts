// import { createDirectus, rest, readItems } from "@directus/sdk";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  // const client = createDirectus(config.directusUrl).with(rest());

  // const [projects] = await Promise.all([
  //   client.request(
  //     readItems("projects", {
  //       fields: ["translations.title", "translations.description"],
  //       deep: {
  //         translations: { _filter: { languages_code: { _eq: "en-US" } } },
  //       },
  //     }),
  //   ),
  // ]);

  const baseUrl = config.public.baseUrl;

  const lines: string[] = [
    `# Project Title`,
    ``,
    `## Meta`,
    ``,
    `Content: Company information, services, and project portfolio`,
    `Language: English (German version available at ${baseUrl}/de)`,
    ``,
    `kmapper.ch is the website of kmapper GmbH, a small data consultancy in Basel, Switzerland, founded in 2021 by Cyrill Martin. The company offers Business Analysis, Requirements Engineering, and Development for complete projects or as specialized support for larger teams.`,
    ``,
    `## About kmapper`,
    ``,
    `kmapper specializes in data curation, organization, and publication, with particular expertise in political data, governance analytics, and research visualization. The company works with Swiss government organizations, SMEs, and research institutions, creating interactive data visualizations, web applications, and innovative data analysis tools.`,
    ``,
    `Notable expertise: Swiss political data, D3.js visualizations, open access research networks, and data authenticity solutions using emerging standards like ISCC.`,
    ``,
    `Tech stack: Directus CMS, Nuxt.js frontend, hosted on Swiss infrastructure (Infomaniak VPS).`,
    ``,
    `## Pages`,
    ``,
    `- Example Page: ${baseUrl}/example`,
    ``,
    `## Notable Projects`,
    ``,
  ];

  //   for (const project of projects) {
  //     const t = project.translations?.[0];
  //     if (t) {
  //       lines.push(`- ${t.title}: ${t.description ?? ""}`);
  //     }
  //   }

  const finalLines: string[] = lines.concat([
    ``,
    `## Contact`,
    ``,
    `Basel, Switzerland`,
    `Website: ${baseUrl}`,
    `Email: mail@kmapper.ch`,
  ]);

  setHeader(event, "Content-Type", "text/plain; charset=utf-8");
  return finalLines.join("\n");
});
