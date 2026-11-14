# The 101st Blow (NEURONVISUALS, ноябрь 2026)

Мотивационная притча ~31 с. Четверо бьют кувалдами по своим камням, над каждым живой счётчик ударов.
Трое сдаются: на 12-м, 40-м и 99-м ударе (у последнего на камне уже проступала трещина). Каждый опускает молот,
уходит в темноту, и свет над его камнем гаснет. Наш оранжевый неоновый герой бьёт дальше: 99, 100, 101.
На 101-м ударе звучат три ноты и тишина, камень раскалывается, изнутри идёт свет. Финальный отъезд: весь мир внутри камня,
затем цитата и перемотка обратно к первому удару (петля).

Цитата (проверена по тексту книги, Project Gutenberg #6125): Jacob A. Riis, «The Making of an American», 1901:
«...at the hundred and first blow it would split in two, and I knew it was not that blow that did it, but all that had gone before together.»
На экране: “IT WAS NOT THAT BLOW THAT DID IT, BUT ALL THAT HAD GONE BEFORE.” — JACOB RIIS, 1901.

Сборка в песочнице Higgsfield: `higgsedit build edit/edit.jsx`. Рендер долгий (~2,4 с/кадр на поток), поэтому рендерим тремя кусками
по 10,5 с (`--range`) и склеиваем с общим звуком. Звук: `node sfx/events.mjs` → `python3 sfx/sfx_stone.py`; все звуки синтезированы кодом.
Нужны общие файлы из прошлых роликов: lib.glsl, vec.js, Tektur.ttf, sfx_zal_lib.py (pustoy-zal).
Видео: `videos/the-101st-blow.mp4`.
