#!/bin/bash
set -euo pipefail

# Séquence de clips Mixkit (licence gratuite, sans watermark).
# URLs CDN directes relevées dans le HTML de chaque page produit.
declare -A CLIP_URLS=(
  [1]="https://assets.mixkit.co/videos/50847/50847-720.mp4"
  [2]="https://assets.mixkit.co/active_storage/video_items/100195/1721338072/100195-video-720.mp4"
  [3]="https://assets.mixkit.co/videos/51445/51445-720.mp4"
  [4]="https://assets.mixkit.co/videos/22130/22130-720.mp4"
)

RAW_DIR="scripts/.raw-clips"
DESKTOP_DIR="public/video-frames/desktop"
MOBILE_DIR="public/video-frames/mobile"

# Ces valeurs sont dupliquées dans ScrollVideoHero.tsx : les garder en phase.
DESKTOP_FRAMES=180
MOBILE_FRAMES=120

# Le sous-bois est très texturé et compresse mal. Résolution et qualité sont
# calibrées pour tenir sous ~13 Mo desktop / ~3 Mo mobile : ces images sont
# versionnées, car Vercel construit depuis le dépôt et n'exécute pas ce script.
DESKTOP_WIDTH=1280
MOBILE_WIDTH=720
QUALITY=12

mkdir -p "$RAW_DIR" "$DESKTOP_DIR" "$MOBILE_DIR"

for i in 1 2 3 4; do
  if [ ! -f "$RAW_DIR/clip-$i.mp4" ]; then
    echo "Téléchargement clip-$i.mp4..."
    curl -sL "${CLIP_URLS[$i]}" -o "$RAW_DIR/clip-$i.mp4" -A "Mozilla/5.0"
  fi
done

CONCAT_LIST="$RAW_DIR/concat-list.txt"
> "$CONCAT_LIST"
for i in 1 2 3 4; do
  echo "file 'clip-$i.mp4'" >> "$CONCAT_LIST"
done

if [ ! -f "$RAW_DIR/full-sequence.mp4" ]; then
  ffmpeg -y -f concat -safe 0 -i "$CONCAT_LIST" -c:v libx264 -an \
    "$RAW_DIR/full-sequence.mp4" -loglevel error
fi

rm -f "$DESKTOP_DIR"/*.jpg "$MOBILE_DIR"/*.jpg

ffmpeg -y -i "$RAW_DIR/full-sequence.mp4" -vf "scale=$DESKTOP_WIDTH:-2" \
  -q:v $QUALITY -vframes $DESKTOP_FRAMES "$DESKTOP_DIR/frame-%04d.jpg" -loglevel error

ffmpeg -y -i "$RAW_DIR/full-sequence.mp4" -vf "scale=$MOBILE_WIDTH:-2" \
  -q:v $QUALITY -vframes $MOBILE_FRAMES "$MOBILE_DIR/frame-%04d.jpg" -loglevel error

echo "OK: $(ls "$DESKTOP_DIR" | wc -l) frames desktop ($(du -sh "$DESKTOP_DIR" | cut -f1)), $(ls "$MOBILE_DIR" | wc -l) frames mobile ($(du -sh "$MOBILE_DIR" | cut -f1))."
