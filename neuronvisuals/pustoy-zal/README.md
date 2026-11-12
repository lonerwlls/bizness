# «Пустой зал» — ролик в стиле NEURONVISUALS (Higgsedit)

Готовое видео: `videos/pustoy-zal.mp4` (1080×1920, 15 с, 30 fps, только звуковые эффекты, −14 LUFS).

Сборка идёт в песочнице Higgsfield (движок Higgsedit), не через Remotion:
- `edit/` — проект Higgsedit (`edit.jsx` — точка входа, `timing.js` — все тайминги и звуки,
  `hero.jsx` — человечек, `stage.jsx` — сцена и луч, `seats.jsx` — кресла).
  Для сборки рядом нужен шрифт `Tektur.ttf` (Google Fonts, OFL).
- `sfx/` — синтез звуков кодом (`sfx_zal.py`, использует `sfxlib.py` из скилла neuronvisuals-style-higgsedit).

Команды в песочнице:
```bash
cd sfx && cp ../edit/timing.js timing_tmp.mjs && node export.mjs
python3 -I sfx_zal.py timeline.json ../out/sfx_stem.wav && sh mix.sh ../out/sfx_stem.wav ../out/audio.wav
cd ../edit && higgsedit build edit.jsx && higgsedit render . --bitrate 8M --out renders/final.mp4
```
Звуки синтезированы кодом, права на них принадлежат автору канала.
