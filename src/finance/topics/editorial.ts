// Темы в журнальном стиле (editorial.tsx). Новые темы добавляй в этот массив.
import { RED, YELLOW } from "../engine";
import { EdTopic } from "../editorial";
import { VOICE as apple } from "./apple.voice";

const NEXT = { kick: "дальше", h: "ещё одна\n*схема гигантов*", k: "subscribe", sfx: "ding" } as const;

export const ED_TOPICS: EdTopic[] = [
  {
    id: "apple",
    ep: "10",
    voice: apple,
    beats: [
      { at: "", kick: "apple", h: "зарабатывает\nбольше *всех*", k: "emoji", e: "🍏", anim: "bob" },
      { at: "айфоне", k: "emoji", e: "📱", anim: "wobble" },
      { at: "клетку", n: 1, kick: "секрет", h: "красивая\n*клетка*", k: "emoji", e: "🔒", anim: "pulse" },
      { at: "купил", kick: "купил айфон", h: "и тебе\n*нужно ещё*", k: "emoji", e: "📱", anim: "bob" },
      { at: "наушники", k: "row", es: ["📱", "🎧"] },
      { at: "часы", k: "row", es: ["📱", "🎧", "⌚"] },
      { at: "макбук", k: "row", es: ["📱", "🎧", "⌚", "💻"] },
      { at: "работает", k: "check", e: "🍏", ok: true, t: "только\nдруг с другом" },
      { at: "андроидом", k: "crossed", e: "🤖" },
      { at: "подписки", kick: "дальше", h: "*подписки*", k: "row", es: ["☁️", "🎵", "🎬"] },
      { at: "десять", k: "price", e: "💸", price: "$10 + $5", c: RED },
      { at: "месяц", k: "emoji", e: "📅", anim: "wobble", t: "каждый *месяц*" },
      { at: "сервисы", kick: "сервисы apple", h: "*$100 млрд*\nв год", k: "counter", to: 100, pre: "$", suf: "B" },
      {
        at: "выручка",
        k: "bars",
        title: "выручка за год",
        items: [
          { v: 96, txt: "$96B", label: "сервисы Apple", e: "🍏" },
          { v: 26, txt: "$26B", label: "весь McDonald’s", e: "🍔" },
        ],
      },
      { at: "охуеть", k: "emoji", e: "🤯", anim: "pulse" },
      { at: "тридцати", kick: "app store", h: "*30%*\nс каждой покупки", k: "counter", to: 30, suf: "%" },
      { at: "каждой", n: 2, k: "flow", from: "🧑", to: "🍏", t: "комиссия" },
      { at: "зарядку", kick: "самое смешное", h: "убрали\n*зарядку*", k: "crossed", e: "🔌" },
      { at: "экологии", k: "emoji", e: "🪴", anim: "wobble", t: "«ради *экологии*»" },
      { at: "пиздец", k: "emoji", e: "🤡", anim: "pulse" },
      { at: "переезжаешь", kick: "вывод", h: "ты живёшь\nв их *экосистеме*", k: "grid", e: "🍏", odd: "📱", c: YELLOW },
      { at: "подпишись", ...NEXT },
    ],
  },
];
