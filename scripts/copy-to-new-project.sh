#!/usr/bin/env bash
set -euo pipefail

# Copies boilerplate files/directories from this template repo into a
# freshly scaffolded Nuxt project.
#
# Usage: ./scripts/copy-to-new-project.sh <path-to-new-project>

if [ $# -ne 1 ]; then
  echo "Usage: $0 <path-to-new-project>" >&2
  exit 1
fi

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="$1"

if [ ! -d "$TARGET_DIR" ]; then
  echo "Target directory does not exist: $TARGET_DIR" >&2
  exit 1
fi

# Paths relative to the repo root to copy into the new project
# (mirrors the same relative location at the target).
PATHS_TO_COPY=(
  "architecture.png"
  "docker-compose.yml"
  "docker-compose.prod.yml"
  ".env.example"
  ".env.prod.example"
  "nginx/vhost.example.conf"
  "directus/database/schema"
  "directus/database/seed"
  "directus/extensions/page-path-computation/src"
  "directus/extensions/page-path-computation/.gitignore"
  "directus/extensions/page-path-computation/package.json"
  "directus/extensions/page-path-computation/tsconfig.json"
  "directus/extensions/theme-css/src"
  "directus/extensions/theme-css/.gitignore"
  "directus/extensions/theme-css/package.json"
  "directus/extensions/theme-css/tsconfig.json"
  "frontend/app/components"
  "frontend/app/composables"
  "frontend/app/middleware"
  "frontend/app/pages"
  "frontend/app/plugins"
  "frontend/app/app.vue"
  "frontend/app/error.vue"
  "frontend/server"
  "frontend/Dockerfile.dev"
  "frontend/Dockerfile.prod"
  "frontend/nuxt.config.ts"
)

for path in "${PATHS_TO_COPY[@]}"; do
  src="$SOURCE_DIR/$path"
  dest="$TARGET_DIR/$path"
  mkdir -p "$(dirname "$dest")"
  cp -r "$src" "$dest"
  echo "Copied $path"
done

# Create the Directus mount directories (database is seeded/synced later,
# uploads and extensions hold runtime data and built extensions).
mkdir -p "$TARGET_DIR/directus/database" "$TARGET_DIR/directus/uploads" "$TARGET_DIR/directus/extensions"
echo "Created directus/ mount directories"

# README.example.md becomes the project's README.md (no example copy kept).
cp -n "$SOURCE_DIR/README.example.md" "$TARGET_DIR/README.md"
echo "Created README.md from README.example.md"

# Create the real env files from the copied examples. The .example files stay
# in place as the tracked templates; -n avoids clobbering secrets on re-run.
cp -n "$TARGET_DIR/.env.example" "$TARGET_DIR/.env"
cp -n "$TARGET_DIR/.env.prod.example" "$TARGET_DIR/.env.prod"
echo "Created .env and .env.prod from the examples"

# Print the handoff checklist: everything the script intentionally leaves to
# you, so the script-to-human transition is explicit and nothing is forgotten.
cat <<EOF

Copy done. Remaining manual steps (see the project README for details):

  1. Set ownership and permissions on the Directus directories (needs sudo):
       sudo chown -R 1000:1000 $TARGET_DIR/directus/
       sudo chmod -R 755 $TARGET_DIR/directus/
  2. Set your chosen Directus version in docker-compose.yml and docker-compose.prod.yml
  3. Add your secrets and set NODE_VERSION in .env and .env.prod
  4. Set the project title in README.md
  5. Build each extension so its dist/ is committed (npm install && npm run build)
  6. Start the stack, apply the schema, and seed the data in the documented order
EOF
