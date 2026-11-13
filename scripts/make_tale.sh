#!/usr/bin/env bash
# История из src/stories + реклама VisionEx: bash scripts/make_tale.sh lift1 Тишина → videos/stories/lift1.mp4
# 2-й аргумент — слово, после которого реклама (то же, что AD1 в src/stories/<id>.tsx: конец слова + 0,4 с). Реклама ОДНА, в середине.
# Правила рекламодателя: при появлении баннера видео на паузе (стоп-кадр темнеет, голос и музыка молчат), баннер > 30% экрана.
# Баннер ads/visionex2.mp4 — горизонтальный 1920×1080 на зелёном фоне (зелёный вырезаем). Сам баннер узкий (≈3:1), во всю ширину
# он даёт ~18% экрана. Тёмную плашку под ним пользователь НЕ хочет («что-то чёрное», 13.11.2026) — только баннер по центру.
set -e; cd "$(dirname "$0")/.."; mkdir -p out videos/stories
ID=$1; OUT=videos/stories/$ID.mp4; AD=${AD:-ads/visionex2.mp4}
AW=1306; AH=734   # баннер ×0,68 (карточка почти во всю ширину) (сам баннер ≈ во всю ширину); плашка y=610..1310
python3 scripts/story_${ID}_sound.py
npx remotion render src/foodshort/index.tsx Story-$ID out/_tale.mp4 --crf=16 --log=error --concurrency=4
ADLEN=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $AD)
# одна вставка — в середине: конец слова $2 + 0,4 с (как AD1 в src/stories/<id>.tsx) + 0,6 с стоп-кадра
A1=$(node -e '
const [ID,W]=process.argv.slice(1);const s=require("fs").readFileSync(`src/stories/${ID}.voice.ts`,"utf8");
const V=JSON.parse(s.slice(s.indexOf("{"),s.lastIndexOf("}")+1));console.log((V.words.find(w=>w.w===W).e+0.4+0.6).toFixed(3));' "$ID" "$2")
ms() { python3 -c "print(int($1*1000))"; }
ffmpeg -v error -y -i out/_tale.mp4 -i $AD -filter_complex "
 [1:v]chromakey=0x0de914:0.17:0.07,despill=type=green:mix=0.6:expand=0.2,scale=$AW:$AH,setsar=1,setpts=PTS-STARTPTS+$A1/TB[a1];
 [0:v][a1]overlay=(W-w)/2+5:(H-h)/2+10:eof_action=pass:enable='between(t,$A1,$A1+$ADLEN)'[v];
 [1:a]volume=1.6,adelay=$(ms $A1)|$(ms $A1)[x1];
 [0:a][x1]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]" \
 -map "[v]" -map "[a]" -c:v libx264 -preset veryfast -crf 21 -c:a aac -b:a 160k -movflags +faststart $OUT
rm -f out/_tale.mp4; echo "готово: $OUT (реклама на $A1 с)"
