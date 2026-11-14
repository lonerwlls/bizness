#!/usr/bin/env bash
# bash sheet.sh out.jpg 1.5 4 7 ...  (секунды ролика) → лист кадров 4 в ряд
cd "$(dirname "$0")"; OUT=$1; shift
FR=$(python3 -c "import sys;print(','.join(str(int(float(x)*30)) for x in sys.argv[1:]))" "$@")
npx remotion still src/index.ts StationSheet "$OUT" --props="{\"frames\":[$FR]}" --scale=0.5 --log=error >/dev/null 2>&1; echo "$OUT"
