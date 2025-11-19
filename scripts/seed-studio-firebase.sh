#!/usr/bin/env bash
set -euo pipefail

# Seed a target directory with Firebase config from this repo.
# Usage: seed-studio-firebase.sh [--link|--copy] [--project <id>] [DEST]
# Defaults: COPY mode, DEST=/home/user/studio

MODE="copy"
PROJECT_ID=""
DEST="/home/user/studio"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --link)
      MODE="link"; shift ;;
    --copy)
      MODE="copy"; shift ;;
    --project)
      PROJECT_ID="${2:-}"; shift 2 ;;
    *)
      DEST="$1"; shift ;;
  esac
done

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"

mkdir -p "$DEST"

# Build a .firebaserc payload (use provided project or default present in repo)
FIREBASERC_SRC="$ROOT_DIR/.firebaserc"
TMP_FIREBASERC="$(mktemp)"
if [[ -n "$PROJECT_ID" ]]; then
  printf '{\n  "projects": {\n    "default": "%s"\n  }\n}\n' "$PROJECT_ID" > "$TMP_FIREBASERC"
else
  if [[ -f "$FIREBASERC_SRC" ]]; then
    cp "$FIREBASERC_SRC" "$TMP_FIREBASERC"
  else
    printf '{\n  "projects": {\n    "default": "your-project-id"\n  }\n}\n' > "$TMP_FIREBASERC"
  fi
fi

# Files to place
FILES=(
  "firebase.json"
  "firestore.rules"
  "firestore.indexes.json"
)

# Ensure sources exist (use EXAMPLE_ fallback for firebase.json)
if [[ ! -f "$ROOT_DIR/firebase.json" && -f "$ROOT_DIR/EXAMPLE_firebase.json" ]]; then
  cp "$ROOT_DIR/EXAMPLE_firebase.json" "$ROOT_DIR/firebase.json"
fi

# Write .firebaserc
cp "$TMP_FIREBASERC" "$DEST/.firebaserc"
rm -f "$TMP_FIREBASERC"

# Copy or link the rest
for f in "${FILES[@]}"; do
  src="$ROOT_DIR/$f"
  if [[ ! -f "$src" ]]; then
    echo "Warning: missing $f in repo; skipping" >&2
    continue
  fi
  case "$MODE" in
    copy)
      cp "$src" "$DEST/$f" ;;
    link)
      ln -sf "$src" "$DEST/$f" ;;
  esac
  echo "Seeded $DEST/$f"
done

echo "Done. Seeded Firebase config into $DEST"