#!/bin/bash

set -e

sites=(
  "All News|https://www.warhammer-community.com/en-gb/all-news-and-features/|all-cache.json|all.rss"
  "Warhammer 40k|https://www.warhammer-community.com/en-gb/setting/warhammer-40000/|40k-cache.json|40k.rss"
  "Kill Team|https://www.warhammer-community.com/en-us/setting/kill-team/|kill-team-cache.json|kill-team.rss"
)

for site in "${sites[@]}"; do
  IFS="|" read -r name url cache rss <<< "$site"

  echo "⚙️ Updating RSS for $name on Heroku..."

  SITE_URL="$url" CACHE_FILE="$cache" RSS_FILE="$rss" OUTPUT_DIR="./docs" \
  node dist/apps/mechanicus-scrivener/main.js
done
