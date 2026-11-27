#!/bin/bash
# Rend un tronçon d'images d'une composition (vidéo muette) : render_chunk.sh <id> <début> <fin> <sortie>
cd "$(dirname "$0")/.."
npx remotion render "$1" "$4" --frames="$2-$3" --muted --gl=swangle --concurrency=4 --timeout=180000 --is-production=false > "$4.log" 2>&1
echo "fin: $?" >> "$4.log"
