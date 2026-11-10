#!/usr/bin/env bash
# Часть 2 шортса про еду + рекламные вставки: bash scripts/make_foodshort2.sh → videos/food/short_part2_ru.mp4
# Ролик сам делает стоп-кадры (картинка замирает, звук молчит); сюда накладываем баннер ads/aevum.mp4 без зелёного фона.
set -e; cd "$(dirname "$0")/.."; mkdir -p out videos/food
python3 scripts/foodshort2_sound.py
npx remotion render src/foodshort/index.tsx FoodShort2 out/_fs2.mp4 --crf=16 --log=error --concurrency=4
# моменты появления баннера (с): после стоп-кадра в ~18 с и в конце
read A1 A2 < <(node -e '
const s=require("fs").readFileSync("src/foodshort/voice2.ts","utf8");const V=JSON.parse(s.slice(s.indexOf("{"),s.lastIndexOf("}")+1));
const ad1=V.words.find(w=>w.w=="выломают").e+0.35, hold=0.6+5.3+0.25, end=V.dur+2.8;
console.log((ad1+0.6).toFixed(3), (end+hold+0.6).toFixed(3));')
AD=ads/aevum.mp4; Y=380
ffmpeg -v error -y -i out/_fs2.mp4 -i $AD -i $AD -filter_complex "
 [1:v]chromakey=0x00FF00:0.28:0.08,scale=1000:-1,setpts=PTS-STARTPTS+$A1/TB[a1];
 [2:v]chromakey=0x00FF00:0.28:0.08,scale=1000:-1,setpts=PTS-STARTPTS+$A2/TB[a2];
 [0:v][a1]overlay=40:$Y:eof_action=pass:enable='between(t,$A1,$A1+5.3)'[v1];
 [v1][a2]overlay=40:$Y:eof_action=pass:enable='between(t,$A2,$A2+5.3)'[v];
 [1:a]adelay=$(python3 -c "print(int($A1*1000))")|$(python3 -c "print(int($A1*1000))")[x1];
 [2:a]adelay=$(python3 -c "print(int($A2*1000))")|$(python3 -c "print(int($A2*1000))")[x2];
 [0:a][x1][x2]amix=inputs=3:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]" \
 -map "[v]" -map "[a]" -c:v libx264 -preset veryfast -crf 21 -c:a aac -b:a 160k -movflags +faststart videos/food/short_part2_ru.mp4
rm -f out/_fs2.mp4; echo "готово: videos/food/short_part2_ru.mp4 (баннер на $A1 с и $A2 с)"
