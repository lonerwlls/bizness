#!/usr/bin/env bash
# История из src/stories + реклама VisionEx: bash scripts/make_tale.sh lift1 Тишина → videos/stories/lift1.mp4
# 2-й аргумент — слово, после которого реклама (то же, что AD1 в src/stories/<id>.tsx: конец слова + 0,4 с). Реклама ОДНА, в середине.
# Правила рекламодателя: при появлении баннера видео на паузе (стоп-кадр темнеет, голос и музыка молчат), баннер > 30% экрана.
# Баннер ads/visionex2.mp4 — горизонтальный 1920×1080 на зелёном фоне (зелёный вырезаем). Сам баннер узкий (≈3:1), во всю ширину
# он даёт лишь ~17% экрана, поэтому кладём его на тёмную неоновую плашку во всю ширину высотой 700 px (≈36% экрана).
set -e; cd "$(dirname "$0")/.."; mkdir -p out videos/stories
ID=$1; OUT=videos/stories/$ID.mp4; AD=${AD:-ads/visionex2.mp4}
AW=1306; AH=734; PY=610; PHH=700   # баннер ×0,68 (сам баннер ≈ во всю ширину); плашка y=610..1310
python3 scripts/story_${ID}_sound.py
npx remotion render src/foodshort/index.tsx Story-$ID out/_tale.mp4 --crf=16 --log=error --concurrency=4
ADLEN=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $AD)
# одна вставка — в середине: конец слова $2 + 0,4 с (как AD1 в src/stories/<id>.tsx) + 0,6 с стоп-кадра
A1=$(node -e '
const [ID,W]=process.argv.slice(1);const s=require("fs").readFileSync(`src/stories/${ID}.voice.ts`,"utf8");
const V=JSON.parse(s.slice(s.indexOf("{"),s.lastIndexOf("}")+1));console.log((V.words.find(w=>w.w===W).e+0.4+0.6).toFixed(3));' "$ID" "$2")
ms() { python3 -c "print(int($1*1000))"; }
ffmpeg -v error -y -i out/_tale.mp4 -i $AD -filter_complex "
 [1:v]chromakey=0x0de914:0.17:0.07,scale=$AW:$AH,setsar=1,setpts=PTS-STARTPTS+$A1/TB[a1];
 [0:v]drawbox=x=0:y=$PY:w=1080:h=$PHH:color=0x050a1e@0.88:t=fill:enable='between(t,$A1,$A1+$ADLEN)',
  drawbox=x=0:y=$PY:w=1080:h=6:color=0x3a9cff@0.95:t=fill:enable='between(t,$A1,$A1+$ADLEN)',
  drawbox=x=0:y=$((PY+PHH-6)):w=1080:h=6:color=0x3a9cff@0.95:t=fill:enable='between(t,$A1,$A1+$ADLEN)'[bg];
 [bg][a1]overlay=(W-w)/2+5:$((PY+PHH/2+10))-h/2:eof_action=pass:enable='between(t,$A1,$A1+$ADLEN)'[v];
 [1:a]volume=1.6,adelay=$(ms $A1)|$(ms $A1)[x1];
 [0:a][x1]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]" \
 -map "[v]" -map "[a]" -c:v libx264 -preset veryfast -crf 21 -c:a aac -b:a 160k -movflags +faststart $OUT
rm -f out/_tale.mp4; echo "готово: $OUT (реклама на $A1 с)"
