// Темы финансовых шортсов: озвучка (<id>.voice.ts из gen2.mjs) + биты (на каком слове какой кадр).
// Новая тема: public/finance/<id>/script.txt → gen2.mjs → сюда объект Topic → bash make_finance.sh <id>.
import { GREEN, Topic } from "../engine";

const GIANTS = ["🍏", "☕", "🛋️", "🍔"];
import { VOICE as ikea } from "./ikea.voice";

// Пример темы в стиле «эмодзи + крупный текст» (FinanceShort). Новые темы добавляй в этот массив.
export const TOPICS: Topic[] = [
  {
    id: "ikea",
    voice: ikea,
    beats: [
      { at: "", k: "brand", t: "IKEA", bg: "#0058A3", fg: "#FFDA1A", sub: "зайти и *выйти?*" },
      { at: "нельзя", k: "crossed", e: "🚪", t: "просто выйти" },
      { at: "случайность", k: "big", t: "не\nслучайно", sfx: "boom" },
      { at: "лабиринт", k: "emoji", e: "🌀", anim: "spin", t: "*лабиринт*" },
      { at: "дорога", k: "emoji", e: "🛣️", t: "одна дорога\nчерез *все отделы*" },
      { at: "лампой", k: "emoji", e: "💡", anim: "pulse", t: "пришёл *за лампой*" },
      { at: "увидел", k: "row", es: ["🛋️", "🪴", "🖼️", "🕯️", "🧺"], t: "а увидел *всё*", sfx: "boom" },
      { at: "кучей", k: "emoji", e: "🛒", anim: "wobble", t: "*куча* вещей" },
      { at: "планировали", k: "crossed", e: "📝", t: "не планировали" },
      { at: "плоских", k: "emoji", e: "📦", anim: "rise", t: "плоские *коробки*" },
      { at: "фуру", k: "emoji", e: "🚚", t: "в разы *больше*\nтовара" },
      { at: "склад", k: "emoji", e: "🏭", t: "склад *дешевле*" },
      { at: "собираешь", k: "emoji", e: "🔧", anim: "wobble", t: "собираешь *ты сам*" },
      { at: "бесплатно", k: "price", e: "🧑‍🔧", price: "$0", c: GREEN, t: "бесплатно", sfx: "boom" },
      { at: "эффект", k: "big", t: "эффект\nикеа" },
      { at: "руками", k: "emoji", e: "🙌", t: "собрал *сам*" },
      { at: "ценнее", k: "emoji", e: "💎", anim: "pulse", t: "кажется *ценнее*" },
      { at: "психологии", k: "emoji", e: "🧠", t: "термин\nиз *психологии*" },
      { at: "тефтели", k: "emoji", e: "🧆", t: "дешёвые *тефтели*" },
      { at: "голодный", k: "vs", a: ["😩", "голодный\nуходит"], b: ["😋", "сытый\nостаётся"] },
      { at: "покупает", k: "rain", e: "💵", main: "🛒", t: "покупает\nбольше", sfx: "ding" },
      { at: "мебель", n: 2, k: "crossed", e: "🛋️", t: "продаёт\nне мебель" },
      { at: "дорогу", k: "emoji", e: "🗺️", t: "продаёт *дорогу*\nчерез магазин", sfx: "boom" },
      { at: "подпишись", k: "subscribe", sfx: "ding" },
      { at: "гиганта", k: "row", es: GIANTS, t: "ещё *один гигант*", sfx: "pop" },
    ],
  },
];
