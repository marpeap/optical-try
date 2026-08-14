#!/bin/bash
set -euo pipefail

# Séquence du hero : trois plans aériens Mixkit (licence gratuite, sans
# watermark), montés en arc d'une journée — lever de soleil sur une vallée
# boisée, baie turquoise en plein jour, coucher de soleil sur la mer.
#
# Tous sont filmés en vol, avec un mouvement de caméra continu : c'est ce qui
# rend le défilement fluide, une caméra fixe donnerait des à-coups.
#
# URLs CDN relevées dans le HTML de chaque page produit (balise <source> ou
# schema.org VideoObject), ce qui évite le téléchargement manuel.
# Les plans 2 et 3 sont tournés sur le même massif : la baie de jour puis au
# couchant, ce qui lie visuellement la fin de la séquence.
declare -A CLIPS=(
  [1]="https://assets.mixkit.co/videos/27028/27028-720.mp4"  # vallée au lever du soleil
  [2]="https://assets.mixkit.co/videos/5008/5008-720.mp4"    # baie turquoise vue du ciel
  [3]="https://assets.mixkit.co/videos/4999/4999-720.mp4"    # même baie au couchant
)
# Début et durée retenus dans chaque plan, en secondes.
declare -A DEBUT=([1]="2" [2]="1" [3]="1")
declare -A DUREE=([1]="10" [2]="8" [3]="8")

RAW_DIR="scripts/.raw-clips"
DESKTOP_DIR="public/video-frames/desktop"
MOBILE_DIR="public/video-frames/mobile"

# Ces valeurs sont dupliquées dans ScrollVideoHero.tsx : les garder en phase.
DESKTOP_FRAMES=150
MOBILE_FRAMES=100

# Les images sont versionnées : Vercel construit depuis le dépôt et n'exécute
# pas ce script. La qualité prime sur le nombre d'images — à tout instant
# l'utilisateur n'en voit qu'une seule, le nombre ne joue que sur la fluidité.
DESKTOP_WIDTH=1152
MOBILE_WIDTH=720
QUALITY=6

mkdir -p "$RAW_DIR" "$DESKTOP_DIR" "$MOBILE_DIR"

for i in 1 2 3; do
  if [ ! -f "$RAW_DIR/src-$i.mp4" ]; then
    echo "Téléchargement du plan $i..."
    curl -sL "${CLIPS[$i]}" -o "$RAW_DIR/src-$i.mp4" -A "Mozilla/5.0"
  fi
  ffmpeg -y -ss "${DEBUT[$i]}" -i "$RAW_DIR/src-$i.mp4" -t "${DUREE[$i]}" \
    -c:v libx264 -preset slow -crf 16 -an "$RAW_DIR/cut-$i.mp4" -loglevel error
done

CONCAT_LIST="$RAW_DIR/concat-list.txt"
> "$CONCAT_LIST"
for i in 1 2 3; do
  echo "file 'cut-$i.mp4'" >> "$CONCAT_LIST"
done

ffmpeg -y -f concat -safe 0 -i "$CONCAT_LIST" -c copy \
  "$RAW_DIR/full-sequence.mp4" -loglevel error

rm -f "$DESKTOP_DIR"/*.jpg "$MOBILE_DIR"/*.jpg

# fps calculé pour étaler exactement le nombre d'images voulu sur la séquence.
DUREE_TOTALE=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$RAW_DIR/full-sequence.mp4")

ffmpeg -y -i "$RAW_DIR/full-sequence.mp4" \
  -vf "fps=$DESKTOP_FRAMES/$DUREE_TOTALE,scale=$DESKTOP_WIDTH:-2" \
  -q:v $QUALITY -frames:v $DESKTOP_FRAMES "$DESKTOP_DIR/frame-%04d.jpg" -loglevel error

ffmpeg -y -i "$RAW_DIR/full-sequence.mp4" \
  -vf "fps=$MOBILE_FRAMES/$DUREE_TOTALE,scale=$MOBILE_WIDTH:-2" \
  -q:v $QUALITY -frames:v $MOBILE_FRAMES "$MOBILE_DIR/frame-%04d.jpg" -loglevel error

echo "OK: $(ls "$DESKTOP_DIR" | wc -l) frames desktop ($(du -sh "$DESKTOP_DIR" | cut -f1)), $(ls "$MOBILE_DIR" | wc -l) frames mobile ($(du -sh "$MOBILE_DIR" | cut -f1))."
