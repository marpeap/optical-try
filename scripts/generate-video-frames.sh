#!/bin/bash
set -euo pipefail

# Séquence de clips Mixkit (licence gratuite, sans watermark).
# URLs CDN directes trouvées en inspectant le HTML de chaque page produit
# (schema.org VideoObject "contentUrl" / balise <source src=...>), pas besoin
# de téléchargement manuel via le bouton "Free Download".
declare -A CLIP_URLS=(
  [1]="https://assets.mixkit.co/videos/50847/50847-720.mp4"
  [2]="https://assets.mixkit.co/active_storage/video_items/100195/1721338072/100195-video-720.mp4"
  [3]="https://assets.mixkit.co/videos/51445/51445-720.mp4"
  [4]="https://assets.mixkit.co/videos/22130/22130-720.mp4"
)

RAW_DIR="scripts/.raw-clips"
DESKTOP_DIR="public/video-frames/desktop"
MOBILE_DIR="public/video-frames/mobile"

mkdir -p "$RAW_DIR" "$DESKTOP_DIR" "$MOBILE_DIR"

for i in 1 2 3 4; do
  if [ ! -f "$RAW_DIR/clip-$i.mp4" ]; then
    echo "Téléchargement clip-$i.mp4..."
    curl -sL "${CLIP_URLS[$i]}" -o "$RAW_DIR/clip-$i.mp4" -A "Mozilla/5.0"
  fi
done

# Concatène les 4 clips en une seule séquence source
CONCAT_LIST="$RAW_DIR/concat-list.txt"
> "$CONCAT_LIST"
for i in 1 2 3 4; do
  echo "file 'clip-$i.mp4'" >> "$CONCAT_LIST"
done

ffmpeg -y -f concat -safe 0 -i "$CONCAT_LIST" -c:v libx264 -an "$RAW_DIR/full-sequence.mp4" \
  -loglevel error

# 360 frames desktop, redimensionné en 1920px de large
ffmpeg -y -i "$RAW_DIR/full-sequence.mp4" -vf "scale=1920:-2" -vframes 360 \
  "$DESKTOP_DIR/frame-%04d.jpg" -loglevel error

# 240 frames mobile, redimensionné en 960px de large
ffmpeg -y -i "$RAW_DIR/full-sequence.mp4" -vf "scale=960:-2" -vframes 240 \
  "$MOBILE_DIR/frame-%04d.jpg" -loglevel error

echo "OK: $(ls "$DESKTOP_DIR" | wc -l) frames desktop, $(ls "$MOBILE_DIR" | wc -l) frames mobile."
