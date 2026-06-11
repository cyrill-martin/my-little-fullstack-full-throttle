# [Project]

## Architecture

![Architecture of kmapper's little fullstack mapped out](architecture.png)

Based on this little fullstack: https://github.com/cyrill-martin/my-little-fullstack-full-throttle

## Building Blocks

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

## Local Development

1. docker compose up -d
   - Access localhost:8055 for Directus
   - Access localhost:3000 for the frontend

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

- Does `/app/composables/useSeo.ts` have site-specific variables?
- Does `/server/routes/llms.txt.ts` have site-specific content?
- Are proper LICENSE.md and NOTICE.md files in place?

### First Deployment

One-time setup of the project on the server.

1. SSH into the server
1. Create the project directory: `sudo mkdir -p /opt/{{ project name }}`
1. Take ownership: `sudo chown $USER:$USER /opt/{{ project name }}`
1. `cd /opt/{{ project name }}`
1. Initialize and pull the repository:
   ```bash
   git init
   git remote add origin https://github.com/cyrill-martin/{{ project name }}.git
   git branch --set-upstream-to=origin/main main
   git pull origin main
   ```
1. From your local project, copy the prod env to the server: `scp .env.prod {{ server name }}:/opt/{{ project name }}/.env` (the local `.env.prod` becomes `.env` on the server)
1. Create the Directus mount directories and give them to the Directus user (UID 1000):
   ```bash
   mkdir -p directus/database directus/uploads directus/extensions
   sudo chown -R 1000:1000 directus/
   ```
1. Log in to Docker: `docker login -u kmapper`
1. Build and start the stack: `docker compose -f docker-compose.prod.yml up -d --build`
1. Set up nginx + TLS (see below)
1. If seeding from local, follow "Copy Local Data to Prod"

### Nginx & TLS

nginx runs on the host (not in Docker) and reverse-proxies the public domain to the frontend container (`:3000`) and a CMS subdomain to Directus (`:8055`). The server-level nginx and Certbot setup (shared config file, `certbot --expand`, reload) lives in the **private server repo** — this project only carries the two server blocks it needs.

`nginx/vhost.example.conf` is the reference for this project's blocks: frontend `:3000` and Directus `:8055` (with `client_max_body_size 100M` for uploads). On first deploy, add these two blocks to the server's nginx config, obtain certificates, and reload — see the private server repo for those server-level steps.

### Frontend

1. SSH into the server
1. `cd /opt/{{ project name }}`
1. Pull latest code with `git pull`
1. Rebuild and restart the frontend container with `docker compose -f docker-compose.prod.yml up -d --build frontend`
1. Clear build cache with `docker builder prune -f`

### Directus (config/extensions)

Extension `dist/` is committed, so the server only pulls and restarts — no build toolchain needed on the host. Build and commit locally before deploying.

1. Locally, build each changed extension (`npm run build` in its folder) and commit the updated `dist/`
1. SSH into the server
1. `cd /opt/{{ project name }}`
1. Pull latest code with `git pull`
1. Restart Directus to pick up the extensions with `docker compose -f docker-compose.prod.yml restart directus`

### Environment Variables

To change env vars after the first deploy, push the updated file and restart. The local `.env.prod` becomes only `.env` on the server:

1. From the project root: `scp .env.prod {{ server name }}:/opt/{{ project name }}/.env`
1. Restart the stack: `docker compose -f docker-compose.prod.yml up -d`

### Credentials & Secrets

Because `data.db` is synced between environments, Directus login accounts are shared — they live in the database (`directus_users`), not in env. `DIRECTUS_ADMIN_EMAIL` / `DIRECTUS_ADMIN_PASSWORD` only seed the admin when Directus first boots an _empty_ database; once a `data.db` exists or is copied in, they're ignored and the synced database's credentials win.

Keep `DIRECTUS_SECRET` identical in `.env` and `.env.prod`. Directus uses it to sign sessions and to encrypt some values stored in the database (e.g. flow/operation credentials). A mismatch means those values can't be decrypted after a sync and existing sessions are invalidated.

### Copy Local Data to Prod

This overwrites Prod's database and, with `--delete`, removes any uploads not present locally. Only do this when local is the source of truth — it erases content and images created on Prod.

1. Stop Directus on Prod with:
   1. SSH into the server
   1. `cd /opt/{{ project name }}`
   1. `docker compose -f docker-compose.prod.yml stop directus`
1. Stop local Directus so the database is checkpointed before copying with `docker compose stop directus`
1. Go to your local dev directory
1. Copy the database to Prod with `rsync -avz ./directus/database/data.db {{ server name }}:/opt/{{ project name }}/directus/database/data.db`
1. Copy and sync the uploaded files with `rsync -avz --delete ./directus/uploads/ {{ server name }}:/opt/{{ project name }}/directus/uploads/`
1. Restore ownership for the Directus user on the server with `sudo chown 1000:1000 /opt/{{ project name }}/directus/database/data.db`
1. (Optionally deploy the new frontend)
1. Restart the stack on Prod with `docker compose -f docker-compose.prod.yml up -d`
1. Update the preview URLs in Directus if needed
1. Clear build cache with `docker builder prune -f`

### Copy Prod Data to Local

1. Stop Directus on Prod so its database is checkpointed before copying:
   1. SSH into the server
   1. `cd /opt/{{ project name }}`
   1. `docker compose -f docker-compose.prod.yml stop directus`
1. Go to the project directory
1. Get database with `rsync -avz {{ server name }}:/opt/{{ project name }}/directus/database/data.db ./directus/database/data.db`
1. Sync uploads with `rsync -avz --delete {{ server name }}:/opt/{{ project name }}/directus/uploads/ ./directus/uploads/`
1. Restart Directus on Prod with `docker compose -f docker-compose.prod.yml start directus`
1. Restart local Directus with `docker compose restart directus`
