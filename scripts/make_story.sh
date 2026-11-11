#!/usr/bin/env bash
# Часть N шортса-истории (с части 3) + рекламные вставки: bash scripts/make_story.sh 3 прятался → videos/food/short_part3_ru.mp4
# второй аргумент — слово, после которого стоит первая реклама (то же, что AD1 в src/foodshort/FoodShort<N>.tsx)
# Ролик сам делает стоп-кадры; сюда накладываем баннер ads/aevum.mp4 без зелёного фона (после 15 с и в конце).
set -e; cd "$(dirname "$0")/.."; mkdir -p out videos/food
P=$1; ID=FoodShort$P; OUT=videos/food/short_part${P}_ru.mp4
python3 scripts/foodshort${P}_sound.py
npx remotion render src/foodshort/index.tsx $ID out/_fs$P.mp4 --crf=16 --log=error --concurrency=4
# моменты появления баннера: AD1 = конец слова $2 + 0.4 с (как AD1 в FoodShort$P.tsx), второй — в конце
read A1 A2 < <(node -e '
const [P,W]=process.argv.slice(1);const s=require("fs").readFileSync(`src/foodshort/voice${P}.ts`,"utf8");
const V=JSON.parse(s.slice(s.indexOf("{"),s.lastIndexOf("}")+1));const ad1=V.words.find(w=>w.w===W).e+0.4;
const HOLD=0.6+5.3+0.25,END=V.dur+2.8;console.log((ad1+0.6).toFixed(3),(END+HOLD+0.6).toFixed(3));' "$P" "$2")
if [ -z "$A2" ]; then echo "не удалось взять время рекламы"; exit 1; fi
AD=ads/aevum.mp4; Y=380
ms() { python3 -c "print(int($1*1000))"; }
ffmpeg -v error -y -i out/_fs$P.mp4 -i $AD -i $AD -filter_complex "
 [1:v]chromakey=0x00FF00:0.28:0.08,scale=1000:-1,setpts=PTS-STARTPTS+$A1/TB[a1];
 [2:v]chromakey=0x00FF00:0.28:0.08,scale=1000:-1,setpts=PTS-STARTPTS+$A2/TB[a2];
 [0:v][a1]overlay=40:$Y:eof_action=pass:enable='between(t,$A1,$A1+5.3)'[v1];
 [v1][a2]overlay=40:$Y:eof_action=pass:enable='between(t,$A2,$A2+5.3)'[v];
 [1:a]adelay=$(ms $A1)|$(ms $A1)[x1]; [2:a]adelay=$(ms $A2)|$(ms $A2)[x2];
 [0:a][x1][x2]amix=inputs=3:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]" \
 -map "[v]" -map "[a]" -c:v libx264 -preset veryfast -crf 21 -c:a aac -b:a 160k -movflags +faststart $OUT
rm -f out/_fs$P.mp4; echo "готово: $OUT (баннер на $A1 с и $A2 с)"
