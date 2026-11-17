#!/bin/sh
# Сведение SFX-only: стем эффектов (wav из sfx/sfx.py) → усиление SFX дБ → статическая нормализация.
# Музыки в варианте нет (внешний трек и его этап убраны), поэтому вход один.
#   sh mix.sh <стем.wav> <out.wav>
#   SFX=-4      — усиление стема до нормализации (на итог почти не влияет: нормализация выставляет уровень сама)
#   TARGET=-13.2 — интегральная громкость WAV до муксинга в mp4; AAC 192k снимает ≈0.5–0.6 LUFS → в mp4 ≈ −14 LUFS
# Цели: интегральная ≈ −14 LUFS, true peak < −1 dBTP (лимитер −3.8 дБ на пиках).
# Нормализация статическая: одно постоянное усиление + лимитер только на пиках. loudnorm linear=true
# молча уходит в динамический режим, если не влезает в TP, — получается «дакинг», поэтому так не делаем.
# Нужны только ffmpeg и awk; POSIX sh, без python и bash-специфики.
set -eu
if [ $# -ne 2 ]; then echo "usage: sh mix.sh <stem.wav> <out.wav>" >&2; exit 2; fi
STEM=$1; OUT=$2
SFX=${SFX:--4}; TARGET=${TARGET:--13.2}
# alimiter принимает limit только в линейных единицах: −3.8 дБ = 0.6607
LIM=$(awk 'BEGIN{printf "%.4f", 10^(-3.8/20)}')
PRE="${OUT%.wav}_pre.wav"
mkdir -p "$(dirname "$OUT")"

lufs() {  # интегральная громкость файла $1 в LUFS (строка «I:» в сводке ebur128)
  v=$(ffmpeg -hide_banner -nostats -i "$1" -af ebur128 -f null - 2>&1 | awk '/^[[:space:]]+I:/{v=$2} END{print v}')
  [ -n "$v" ] || { echo "mix.sh: не удалось измерить LUFS у $1 (нет аудио?)" >&2; exit 1; }
  echo "$v"
}
calc() { awk "BEGIN{printf \"%.2f\", $1}"; }   # арифметика без python

# 1) стем с усилением SFX
ffmpeg -v error -y -i "$STEM" -af "volume=${SFX}dB" -ac 2 -ar 48000 "$PRE"
# 2) одно постоянное усиление до TARGET + лимитер на пиках
I=$(lufs "$PRE")
G=$(calc "$TARGET - ($I)")
ffmpeg -v error -y -i "$PRE" -af "volume=${G}dB,alimiter=limit=$LIM:attack=1:release=60:level=disabled" -ar 48000 "$OUT"
# 3) лимитер мог снизить громкость — один корректирующий проход от PRE (не от OUT)
I2=$(lufs "$OUT")
G2=$(calc "$TARGET - ($I2)")
GT=$(calc "$G + $G2")
ffmpeg -v error -y -i "$PRE" -af "volume=${GT}dB,alimiter=limit=$LIM:attack=1:release=60:level=disabled" -ar 48000 "$OUT"
# 4) контроль: интегральная, LRA, пики (true peak — строка Peak с ebur128=peak=true)
ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^[[:space:]]+(I:|LRA:|Peak:)" || true
