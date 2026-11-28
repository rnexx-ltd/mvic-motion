#!/bin/bash
# File de rendu détachée : tronçons du test A puis du test B, puis montage final (grade + son + encodage web).
cd "$(dirname "$0")/.."
LOG=out/queue.log
wait_chunk() { until grep -q "^fin:" "$1.log" 2>/dev/null; do sleep 20; done; }
render() { [ -f "$4" ] && grep -q "^fin: 0" "$4.log" 2>/dev/null && return; echo "$(date +%T) rendu $1 $2-$3" >> $LOG; tools/render_chunk.sh "$1" "$2" "$3" "$4"; }
finish() { # finish <dossier> <audio> <sortie> <n tronçons>
  local d=$1; : > $d/list.txt
  for i in $(seq 1 $4); do echo "file 'c$i.mp4'" >> $d/list.txt; done
  ffmpeg -nostdin -y -loglevel error -f concat -safe 0 -i $d/list.txt -i "$2" -map 0:v -map 1:a \
    -vf "curves=r='0/0.02 0.5/0.53 1/1':g='0/0.01 0.5/0.49 1/0.98':b='0/0.05 0.5/0.46 1/0.94',vignette=angle=PI/4.6,noise=alls=6:allf=t+u,format=yuv420p" \
    -c:v libx264 -preset slow -crf 21 -maxrate 12M -bufsize 24M -profile:v high -movflags +faststart -c:a aac -b:a 192k -shortest "$3"
  echo "$(date +%T) livré $3" >> $LOG
}
mkdir -p out/full out/maman
wait_chunk out/full/c1.mp4
render PapaFull 241 480 out/full/c2.mp4
render PapaFull 481 720 out/full/c3.mp4
render PapaFull 721 960 out/full/c4.mp4
render PapaFull 961 1206 out/full/c5.mp4
finish out/full public/papa/papa-full-audio.wav out/le-vocal-de-papa-v1-web.mp4 5
render MamanFilm 0 239 out/maman/c1.mp4
render MamanFilm 240 479 out/maman/c2.mp4
render MamanFilm 480 719 out/maman/c3.mp4
render MamanFilm 720 959 out/maman/c4.mp4
finish out/maman public/maman/maman-audio.wav out/quest-ce-que-tu-mas-fait-v1-web.mp4 4
echo "$(date +%T) TERMINÉ" >> $LOG
