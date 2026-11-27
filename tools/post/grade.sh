#!/bin/bash
# Étalonnage « cinéma » appliqué après le rendu : halo (bloom), courbes, vignettage, grain.
# usage : grade.sh entrée sortie
IN="$1"; OUT="$2"
ffmpeg -nostdin -hide_banner -loglevel error -y -i "$IN" -filter_complex "
[0:v]format=gbrp,split=3[base][b1][b2];
[b1]lutrgb=r='if(gt(val,215),val,0)':g='if(gt(val,200),val,0)':b='if(gt(val,200),val,0)',gblur=sigma=18[g1];
[b2]lutrgb=r='if(gt(val,190),val,0)':g='if(gt(val,170),val,0)':b='if(gt(val,170),val,0)',gblur=sigma=60[g2];
[base][g1]blend=all_mode=screen:all_opacity=0.75[m1];
[m1][g2]blend=all_mode=screen:all_opacity=0.55[m2];
[m2]curves=r='0/0.02 0.5/0.55 1/1':g='0/0.01 0.5/0.47 1/0.97':b='0/0.06 0.5/0.42 1/0.9',eq=contrast=1.08:saturation=1.12,vignette=angle=PI/4.2:mode=forward,noise=alls=9:allf=t+u,format=yuv420p[v]
" -map "[v]" -map 0:a? -c:a copy "$OUT"
