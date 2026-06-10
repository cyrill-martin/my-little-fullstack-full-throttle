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
  "README.example.md"
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
