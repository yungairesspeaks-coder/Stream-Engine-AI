#!/usr/bin/env bash
set -euo pipefail

# Run this script from the repository root.
# Requirements: Git, Node.js 20+, npm, and an Expo account.
# GitHub push access is required. Never put EXPO_TOKEN in this file.

if [[ ! -d "mobile" || ! -f "mobile/app.json" ]]; then
  echo "Error: run this script from the Stream-Engine-AI repository root." >&2
  exit 1
fi

cd mobile
npx eas-cli@latest login
npx eas-cli@latest project:init

cd ..
git add mobile/app.json

if git diff --cached --quiet; then
  echo "No staged changes in mobile/app.json. Checking whether it is already committed."
else
  git commit -m "Link Expo project"
fi

git push origin main

echo "Expo project linking changes pushed to origin/main."
