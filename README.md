# kmapper's Little Fullstack

A comprehensive guide about how to set up kmapper GmbH's little fullstack.

This guide helps you to set up the local development environment and includes documentation and files for later Prod deployment.

## Requirements

- Docker, Docker Compose
- Node/NPM
- A virtual private server (VPS) for Prod

## Essentials

### Architecture

![Architecture of kmapper's little fullstack mapped out](architecture.png)

### Building Blocks

- **Directus headless CMS** with backend capabilities
  - 'Pages' collection for standard pages with the ability to nest pages
    - Custom Directus extension to save the full path of a page on each update
  - Page builder approach with M2A relation to compose each page using layout blocks
  - Multilanguage by default (de-CH and en-US)
  - Custom 'Menus' collection to define reusable menus
  - Custom 'Theme Settings' collection to define global CSS variables
    - Custom Directus extension to provide a corresponding global CSS endpoint for the frontend
  - Custom 'Color Palette' collection to define a reusable color palette
  - Custom 'Labels' collection to store reusable, translated labels
  - Custom 'SEO' block for SEO essentials
  - Directus preview mode in place
  - Directus visual editor in place

- **Nuxt frontend** for full flexibility
  - Catch them all route with [...slug].vue
  - Custom components for each building block defined in Directus
  - Custom 'LLM' route for llms.txt

- **NaiveUI** Vue3 component library

## Initial Setup for Local Development

### 1. Repository

1. Create a project repository
1. cd into the repository

### 2. Docker

1. Decide on a Directus version — check https://hub.docker.com/r/directus/directus for the latest major release

### 3. Nuxt

1. Create a fresh SSR Nuxt project called 'frontend' with `npx nuxi init frontend`
   - Minimal setup
   - npm
   - No git repository (here)
   - No modules
1. cd into `frontend`
1. ```bash
   npm install
   npm install @css-render/vue3-ssr # To handle SSR
   npm install --save-dev @types/node # Less warnings in VSC
   npm install @directus/sdk # To communicate with Directus
   npm install @directus/visual-editing # To enable the visual editor in Directus
   npm install @nuxtjs/i18n # Default Nuxt i18n support
   npm install -D naive-ui # NaiveUI
   ```

### 4. Project Files

1. cd back into the project repository
1. Run the copy script with the new project's path: `./scripts/copy-to-new-project.sh <path-to-new-project>`. It copies the boilerplate and the `docker-compose*.yml` / `.env*.example` files, creates the `directus/` mount directories, generates `README.md`, `.env`, and `.env.prod`, and prints the remaining manual steps
1. Run the printed commands to give the Directus directories to the Directus Docker user (UID 1000, usually your local user) and make them readable:
   ```bash
   sudo chown -R 1000:1000 directus/
   sudo chmod -R 755 directus/
   ```
1. Set your chosen Directus version in `docker-compose.yml` and `docker-compose.prod.yml`
1. In `.env` and `.env.prod`, add your secrets (use `A-Z`, `0-9`, and `_` only — used to set the admin at first boot; after that the login credentials live in Directus) and set `NODE_VERSION` to match your chosen Nuxt/Directus stack (the Dockerfiles default to 22)
1. Set the project title in `README.md`

### 5. Extensions & Git

1. If you chose a newer Directus version, bump `@directus/extensions-sdk` and the `host` range in each extension's `package.json` to match
1. Build each extension so its `dist/` is committed: cd into the extension folder, run `npm install` and then `npm run build`, then cd back
1. Check the .gitignore

   ```git
   # Environment
   .env
   .env.prod
   .env.local
   .env.*.local

   # Directus
   directus/database/*.db
   directus/database/seed/
   directus/uploads/

   # Nuxt
   frontend/node_modules/
   frontend/.nuxt/
   frontend/.output/
   frontend/dist/

   # IDE
   .vscode/
   .idea/

   # Nginx
   nginx/

   # OS
   .DS_Store
   ```

1. Add a proper Git repository with:
   ```git
   git init
   git add .gitignore
   git add .
   git commit -m "Initial commit"
   ```

## 6. Initiating Demo Stack

1. cd into the project repository
1. Start everything up with `docker compose up -d`
   - Visit http://localhost:8055 for Directus, log in with the credentials from your .env file
     - Set the owner in case of the first time logging in to the Directus instance
   - Visit http://localhost:3000 for the Nuxt frontend
1. Apply the database schema with `docker compose exec directus npx directus schema apply /directus/database/schema/snapshot.yaml`
1. Seed data through the Directus UI. Import in this order so relational IDs resolve (each `*_translations` set goes right after its parent, and depends on `languages`):
   1. `languages`
   1. `directus_translations` (interface strings, no dependencies)
   1. `color_palette`
   1. `labels`, then `labels_translations`
   1. `block_richtext`, then `block_richtext_translations`
   1. `block_link`, then `block_link_translations`
   1. `block_seo`, then `block_seo_translations`
   1. `pages`, then `pages_translations`
   1. `menus`, then `menus_translations`
   1. `menu_items`, then `menu_items_translations`
   1. `theme_settings` (singleton — see note below)
   1. `pages_blocks` (M2A junction; needs `pages` and all `block_*` items to exist first)

   Notes:
   - Import into empty collections so the seeded IDs don't collide with existing auto-increment values.
   - `theme_settings` is a singleton and has no list view to export/import. Seed it via the API, or temporarily untick "Treat as Singleton" in Settings → Data Model to expose the Export/Import actions, then re-enable it.
   - `block_seo` references uploaded images. Those come from the `directus/uploads/` directory (see Data Export/Import), not the UI import.

1. Develop as needed
   - Add site-specifics to `/app/composables/useSeo.ts`
   - Add site-specifics to `/server/routes/llms.txt.ts`
   - Add proper LICENSE.md and NOTICE.md files
