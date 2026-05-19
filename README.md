# kmapper's Little Fullstack

A comprehensive guide about how to set up kmapper GmbH's little fullstack.

This quide starts with setting up a local development environment first. Later it shows how to set up the productive environment as well as how to continue development once a project is live.

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
    - Custom Directus extension to provide a coresponding global CSS endpoint for the frontend
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
1. Add an empty Readme with `touch README.md`

1. [ADD TEMPLATE CONTENT TO THE README.md]

### 2. Docker

1. Add a Docker Compose file for local development with `touch docker-compose.yml`
1. Check https://hub.docker.com/r/directus/directus for the latest Directus major release
1. Add the latest major release to this repository's `docker-compose.yml` and copy its content to the newly created `docker-compose.yml`
1. Add an env file with `touch .env`
1. Copy paste this repository's `env.example` file contents to the newly created `.env` and add your secrets (use `A-Z`, `0-9`, and `_` only)
1. Add the mounted Directus directories with `mkdir -p directus/database directus/uploads directus/extensions`
1. Set the owner of the Directus directories to UID 1000 (the Directus Docker user, usually the same as your local user), with `sudo chown -R 1000:1000 directus/`
1. Set the permissions of the Directus directories so that everyone can read, with `sudo chmod -R 755 directus/`

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
1. Make sure to have the essential Nuxt-relevant folders and files in `/frontend`
   - `/server/routes/llms.txt.ts`
   - `/app/...`
1. Make sure to have the `snapshot.yaml` in `/directus/database/schema`

### 4. Git

1. cd back into the project repository
1. Check the .gitignore

   ```git
   # Environment
   .env
   .env.prod
   .env.local
   .env.*.local

   # Directus
   directus/database/*.db
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

## Local Development

1. cd into the project repository
1. Start everything up with `docker compose up -d`
   - Vist http://localhost:8055 for Directus, log in with the credentials from your .env file
     - Set the owner in case of the first time loging in to the Directus instance
   - Visit http://localhost:3000 for the Nuxt frontent
1. Apply the database schema with `docker compose exec directus npx directus schema apply /directus/database/schema/snapshot.yaml`
1. Seed data through the Directus UI:
   - directus_translations:
   - [MORE TO COME]
1. Develop as needed
   - Add site-specifics to `/app/composables/useSeo.ts`
   - Add site-specifics to `/server/routes/llms.txt.ts`
   - Add proper LISECNE.md and NOTICE.md files

### Add a New Block Type

1. Add an interface for the item (e.g. BlockHeroItem, BlockGalleryItem) in usePage.ts
1. Add its collection name as a literal to the PageBlock.collection union in usePage.ts
1. Add the item type to the PageBlock.item union in usePage.ts

### Add a Directus Extensions

1. cd into `/directus/extensions`
1. Scaffold a new extension with `npx create-directus-extension@latest`
1. Follow the instructions
1. Develop your extension
1. cd into the given extension folder
1. Build the extension with `npm run build`
1. Restart the Docker container to pick up the extension

### Theme Settings Collection

1. You can add fields as needed to the singleton `theme_settings` collection
2. The Directus extension in `/directus/extensions/theme-css/` makes sure that each field and its value end up as a CSS variable at the following Directus endpoint: {{ Directus URL}}/theme-css?{{ timestamp of last collection update }}

E.g. a field "font_size_base" with a value "18px" ends up at the endpoint as:

```css
:root {
  --font-size-base: 18px;
}
```

### Special Collections

For special collections like posts, products, etc. you'll need a separate composable to fetch the data and a `/pages/{{ collection }}/[...slug].vue` component to catch the routes. If you need a listing page: `/pages/{{ collection }}/index.vue` will do that.

### Database Schema

Export a db snapshot with `docker compose exec directus npx directus schema snapshot ./database/schema/snapshot.yaml`

### Data Export/Import

Export/import collection data through the Directus UI.

## Productive Deployment

### Checklist

- Does `/app/composables/useSeo.ts` has site-specific variables?
- Does `/server/routes/llms.txt.ts` has site-specific content?
- Are proper LICENSE.md and NOTICE.md files in place?

### Frontend

1. SSH into the server
1. `cd /opt/{{ project folder }}`
1. Pull lates code with `git pull`
1. Rebuild and restart the frontend container with `docker compose -f docker-compose.prod.yml up -d --build frontend`
1. Clear build cache with `docker builder prune -f`

### Directus (config/extensions)

1. SSH into the server
1. `cd /opt/kmapper.ch`
1. Pull latest code with `git pull`
1. Rebuild and restart the directus container with `docker compose -f docker-compose.prod.yml up -d --build directus`
1. Clear build cache with `docker builder prune -f`

### Environment Variables

1. From the project root: `scp .env.prod infomaniak-vps-{{ server-name }}:/opt/{{ project name}}/.env`

### Replace Prod Data with Local Data

1. Stop Directus on Prod with:
   1. SSH into the server
   1. `cd /opt/{{ project name}}`
   1. `docker compose -f docker-compose.prod.yml stop directus`
1. Go to your local dev directory
1. Copy the database to Prod with `rsync -avz ./directus/database/data.db infomaniak-vps-{{ server-name }}:/opt/{{ project name}}/directus/database/data.db`
1. Copy and sync the uploaded files with `rsync -avz --delete ./directus/uploads/ infomaniak-vps-{{ server name }}:/opt/{{ project name}}/directus/uploads/`
1. (Optionally deploy the new fronten)
1. Restart the stack on Prod with `docker compose -f docker-compose.prod.yml up -d`
1. Update the preview URLs in Directus if needed
1. Clear build cache with `docker builder prune -f`

#### Copy Prod Data to Local

1. Go to the project directory
1. Get database with `rsync -avz infomaniak-vps-{{ server-name }}:/opt/{{ project name}}/directus/database/data.db ./directus/database/data.db`
1. Sync uploads with `rsync -avz --delete infomaniak-vps-{{ server-name }}:/opt/{{ project name}}/directus/uploads/ ./directus/uploads/`
1. Restart Directus with `docker compose restart directus`
