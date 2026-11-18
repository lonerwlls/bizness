// Ролик «Две пиццы за 10 000 биткоинов» — стиль «наклейки на белом фоне», герой — котик в цилиндре.
// Озвучка: public/crypto/pizza/voice.mp3 (Fish Audio), звуки и музыка: scripts/crypto_pizza_sound.py → sound.wav.
import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, Easing } from "remotion";
import "./fonts";
import { Kitty, Mood, Hat } from "./Kitty";
import { Boxes, Coin, Pizza, Slice, Laptop, Forum, Calendar, Tag, Tumbleweed, Pedestal, RocketCoin, Chart, Money, Mic, Bubble, Sparkle, Desk, BIG } from "./props";

export const FPS = 30;
export const PIZZA_DUR = 34;
const sec = (s: number) => Math.round(s * FPS);
const ip = (f: number, i: number[], o: number[], e?: (t: number) => number) => interpolate(f, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const pop = (f: number, d = 0, stiff = 220) => spring({ frame: f - d, fps: FPS, config: { damping: 9, stiffness: stiff, mass: 0.6 } });
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const shake = (f: number, at: number, len = 10, amp = 18) => {
  const k = f - at; if (k < 0 || k > len) return [0, 0];
  const a = amp * (1 - k / len);
  return [Math.sin(k * 7.3) * a, Math.cos(k * 9.1) * a];
};

// Положение по центру (x, y) с размером w×h; s — масштаб, r — поворот.
const P: React.FC<{ x: number; y: number; w: number; h?: number; s?: number; r?: number; o?: number; flip?: boolean; children: React.ReactNode }> = ({ x, y, w, h = w, s = 1, r = 0, o = 1, flip, children }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: o, transform: `rotate(${r}deg) scale(${flip ? -s : s}, ${s})` }}>{children}</div>
);
// Котик: x — центр, y — уровень лап.
const catPaw = (y: number, w: number) => y - w * 1.5 * 0.95 + (425 * w) / 400;
const Cat: React.FC<{ x: number; y: number; w: number; mood?: Mood; hat?: Hat; t: number; s?: number; flip?: boolean; gray?: boolean; id: string }> = ({ x, y, w, mood, hat = "top", t, s = 1, flip, gray, id }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - w * 1.5 * 0.95, width: w, height: w * 1.5, transformOrigin: "50% 95%", transform: `scale(${flip ? -s : s}, ${s})` }}>
    <Kitty mood={mood} hat={hat} t={t} id={id} coat={gray ? "gray" : "ginger"} />
  </div>
);
const Big: React.FC<{ text: string; size: number; color: string; y: number; s?: number; r?: number }> = ({ text, size, color, y, s = 1, r = 0 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y - size * 0.6, textAlign: "center", fontFamily: BIG, fontSize: size, lineHeight: 1.2, color, transform: `scale(${s}) rotate(${r}deg)`, WebkitTextStroke: `${size * 0.05}px #4a2a14`, paintOrder: "stroke fill", textShadow: "0 0 0 #fff, 0 0 18px #fff, 0 10px 0 rgba(0,0,0,0.12)" }}>
    {text}
  </div>
);
const Spot: React.FC<{ o: number }> = ({ o }) => (
  <div style={{ position: "absolute", left: 140, top: -100, width: 800, height: 1800, opacity: o, background: "linear-gradient(180deg, rgba(255,226,120,0.0), rgba(255,226,120,0.45))", clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)" }} />
);
const Ground: React.FC<{ y: number; w?: number }> = ({ y, w = 700 }) => (
  <div style={{ position: "absolute", left: 540 - w / 2, top: y - 20, width: w, height: 40, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(0,0,0,0.10), rgba(0,0,0,0))" }} />
);

type Scene = { at: number; draw: (f: number, g: number) => React.ReactNode };
const fmt = (n: number) => "$" + Math.round(n).toLocaleString("en-US").replace(/,/g, " ");

const SCENES: Scene[] = [
  // 0. «Этот парень заплатил за две пиццы…» — коробки падают котику в лапы
  { at: 0, draw: (f, g) => {
    const s = pop(f, 0), b = pop(f, 6, 160);
    return (<>
      <Ground y={1560} />
      <Cat x={540} y={1560} w={600} t={g} s={0.6 + 0.4 * s} id="c0" />
      <P x={540} y={ip(b, [0, 1], [-300, catPaw(1560, 600) + 10])} w={430} h={310}><Boxes n={2} /></P>
    </>);
  } },
  // 1. «…миллиард долларов» — ценник впечатывается сверху
  { at: 1.58, draw: (f, g) => {
    const t = pop(f, 2, 260);
    return (<>
      <Ground y={1560} />
      <Cat x={540} y={1560} w={600} t={g} mood="shock" id="c1" s={1 + f * 0.002} />
      <P x={540} y={catPaw(1560, 600) + 10} w={430} h={310}><Boxes n={2} /></P>
      <P x={540} y={470} w={1000} h={240} s={ip(t, [0, 1], [3, 1])} r={-6} o={ip(f, [2, 4], [0, 1])}><Tag text="$1 000 000 000" /></P>
      {[[170, 260], [920, 700], [130, 760]].map(([x, y], i) => <P key={i} x={x} y={y} w={90} s={pop(f, 8 + i * 3)}><Sparkle /></P>)}
    </>);
  } },
  // 2. «Май две тысячи десятого» — лист календаря
  { at: 3.02, draw: (f, g) => (<>
    <P x={540} y={860} w={640} h={720} s={pop(f, 1)} r={Math.sin(f / 6) * 2 - 3}><Calendar month="МАЙ" big="2010" /></P>
    <Cat x={830} y={1820} w={360} t={g} id="c2" s={pop(f, 8)} />
  </>) },
  // 3. «Программист Ласло» — котик за ноутбуком
  { at: 4.85, draw: (f, g) => (<>
    <Cat x={720} y={1640} w={560} t={g} id="c3" s={1 + f * 0.002} />
    <P x={540} y={1470} w={1020} h={295}><Desk /></P>
    <P x={360} y={1300} w={470} h={340} s={pop(f, 2)}><Laptop>
      {[0, 1, 2].map((i) => <rect key={i} x={70} y={60 + i * 40} width={ip(f, [4 + i * 6, 10 + i * 6], [0, 220 - i * 50])} height={16} rx={8} fill="#9fb2d9" stroke="none" />)}
    </Laptop></P>
  </>) },
  // 4. «…пишет на форуме: кто привезёт мне две пиццы…» — сообщение печатается
  { at: 5.85, draw: (f, g) => (<>
    <P x={540} y={860} w={990} h={693} s={pop(f, 0) * (1 + f * 0.001)}>
      <Forum p={ip(f, [6, sec(1.9)], [0, 1])} cursor={Math.floor(f / 8) % 2 === 0} lines={["Кто привезёт мне", "две пиццы —", "отдам 10 000 BTC"]} />
    </P>
    <Cat x={210} y={2080} w={420} t={g} id="c4" s={pop(f, 10)} />
  </>) },
  // 5. «…отдам десять тысяч биткоинов» — дождь из монет
  { at: 7.95, draw: (f) => (<>
    {Array.from({ length: 22 }, (_, i) => {
      const d = i * 1.6, x = 140 + rnd(i) * 800, yEnd = 1480 - (i > 11 ? 130 : 0) - rnd(i + 9) * 60;
      const k = pop(f, d, 120);
      return <P key={i} x={x} y={ip(k, [0, 1], [-200, yEnd])} w={200} r={(rnd(i + 3) - 0.5) * 50}><Coin /></P>;
    })}
    <Big text="10 000 ₿" size={210} color="#ffcf2e" y={600} s={pop(f, 9)} r={-4} />
  </>) },
  // 6. «Тогда это было около сорока долларов»
  { at: 9.6, draw: (f, g) => (<>
    <Ground y={1580} />
    <Cat x={480} y={1580} w={600} t={g} id="c6" />
    <P x={480} y={catPaw(1580, 600) + 10} w={230}><Coin /></P>
    <P x={790} y={640} w={470} h={190} r={10} s={pop(f, 20)}><Tag text="≈ $40" /></P>
  </>) },
  // 7. «Биткоин почти никому не был нужен» — перекати-поле
  { at: 11.65, draw: (f) => {
    const x = ip(f, [0, sec(1.9)], [-200, 1300]);
    return (<>
      <Ground y={1330} w={500} />
      <P x={540} y={1180} w={300} s={pop(f, 0)} r={Math.sin(f / 10) * 3}><Coin face="sad" /></P>
      <P x={x} y={1290 - Math.abs(Math.sin(f / 5)) * 90} w={190} r={f * 14}><Tumbleweed /></P>
    </>);
  } },
  // 8. «Через четыре дня» — листаем календарь до 22
  { at: 13.6, draw: (f) => {
    const day = 18 + Math.min(4, Math.floor(f / 3));
    return <P x={540} y={900} w={640} h={720} s={1 + Math.min(f, 12) * 0.004}><Calendar month="МАЙ" big={String(day)} circle={ip(f, [12, 20], [0, 1])} /></P>;
  } },
  // 9. «…один студент соглашается»
  { at: 14.3, draw: (f, g) => (<>
    <Ground y={1640} w={1000} />
    <Cat x={310} y={1640} w={460} t={g} id="c9" />
    <Cat x={ip(pop(f, 0, 140), [0, 1], [1400, 780])} y={1640} w={440} t={g + 40} id="c9s" gray hat="cap" flip />
    <P x={800} y={760} w={480} h={220} s={pop(f, 16)}><Bubble text="Окей!" tail="down" /></P>
  </>) },
  // 10. «…и Ласло получает две большие пиццы»
  { at: 15.72, draw: (f, g) => {
    const k = ip(f, [6, 22], [0, 1], Easing.inOut(Easing.cubic));
    const got = k >= 1;
    return (<>
      <Ground y={1640} w={1000} />
      <Cat x={310} y={1640} w={460} t={g} id="c10" mood={got ? "happy" : "calm"} s={got ? 1 + 0.04 * Math.sin((f - 22) / 3) * Math.max(0, 1 - (f - 22) / 20) : 1} />
      <Cat x={780} y={1640} w={440} t={g + 40} id="c10s" gray hat="cap" flip />
      <P x={ip(k, [0, 1], [780, 310])} y={ip(k, [0, 1], [catPaw(1640, 440), catPaw(1640, 460)]) - Math.sin(k * Math.PI) * 120} w={340} h={245}><Boxes n={2} /></P>
      {got && [[120, 820], [500, 760], [330, 650]].map(([x, y], i) => <P key={i} x={x} y={y} w={80} s={pop(f, 23 + i * 2)}><Sparkle /></P>)}
    </>);
  } },
  // 11. «Это первая в истории покупка за биткоин» — экспонат в музее
  { at: 17.58, draw: (f) => (<>
    <Spot o={ip(f, [0, 8], [0, 1])} />
    <P x={540} y={1420} w={430} h={545} s={1 + f * 0.001}><Pedestal /></P>
    <P x={500} y={1070} w={400} h={290} s={pop(f, 3)}><Boxes n={2} /></P>
    <P x={720} y={1100} w={190} s={pop(f, 9)} r={12}><Coin /></P>
    {[[230, 600], [860, 700], [300, 1000], [820, 420], [560, 470]].map(([x, y], i) => <P key={i} x={x} y={y} w={70 + (i % 2) * 30} s={0.5 + 0.5 * Math.abs(Math.sin((f + i * 9) / 7))}><Sparkle /></P>)}
  </>) },
  // 12. «А потом биткоин взлетел»
  { at: 19.72, draw: (f) => (<>
    <P x={540} y={960} w={940} h={710} s={pop(f, 0)}><Chart p={ip(f, [4, 36], [0, 1])} /></P>
    <P x={540 + Math.sin(f / 4) * 20} y={ip(f, [6, 40], [2300, 300], Easing.in(Easing.quad))} w={300} h={575}><RocketCoin t={f} /></P>
  </>) },
  // 13. «На пике эти десять тысяч стоили больше миллиарда долларов» — счётчик
  { at: 21.18, draw: (f, g) => {
    const k = ip(f, [4, sec(1.95)], [0, 1], Easing.in(Easing.cubic));
    const slam = sec(1.98);
    const [sx, sy] = shake(f, slam);
    return (
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sx}px, ${sy}px)` }}>
        {Array.from({ length: 7 }, (_, i) => {
          const at = 6 + i * 8;
          return <P key={i} x={150 + rnd(i + 20) * 780} y={1050 + rnd(i + 40) * 300} w={300} h={160} r={(rnd(i) - 0.5) * 30} s={pop(f, at)}><Money /></P>;
        })}
        <Big text={fmt(41 * Math.pow(1e9 / 41, k))} size={160} color="#3ccf6e" y={560} s={f >= slam ? 1 + 0.25 * Math.max(0, 1 - (f - slam) / 8) : 1} />
        <Cat x={540} y={2120} w={640} t={g} id="c13" mood={f >= slam ? "shock" : "calm"} />
      </div>
    );
  } },
  // 14. «Ласло спросили: Жалеешь?»
  { at: 24.1, draw: (f, g) => (<>
    <Ground y={1640} />
    <Cat x={460} y={1640} w={600} t={g} id="c14" />
    <P x={ip(pop(f, 2, 150), [0, 1], [1400, 900])} y={1180} w={560} h={240}><Mic /></P>
    <P x={700} y={560} w={640} h={260} s={pop(f, 30)}><Bubble text="Жалеешь?" tail="right" /></P>
  </>) },
  // 15. «Он ответил: нет»
  { at: 25.92, draw: (f, g) => (<>
    <Ground y={1640} />
    <Cat x={460} y={1640} w={600} t={g} id="c15" mood="happy" s={1 + f * 0.0015} />
    <P x={900} y={1180} w={560} h={240}><Mic /></P>
    <P x={360} y={560} w={430} h={240} s={pop(f, 18)}><Bubble text="Нет." tail="down" size={100} /></P>
  </>) },
  // 16. «Ведь это была не последняя его пицца»
  { at: 27.35, draw: (f, g) => (<>
    <Ground y={1640} />
    {[[200, 520, 0], [880, 430, 6], [760, 820, 12]].map(([x, y, d], i) => <P key={i} x={x} y={y} w={300} s={pop(f, d)} r={f * (i % 2 ? 1 : -1) * 1.5}><Pizza /></P>)}
    <Cat x={540} y={1640} w={600} t={g} id="c16" mood="happy" />
    <P x={560} y={catPaw(1640, 600) - 20} w={250} h={290} r={-12 + Math.sin(f / 4) * 6} s={pop(f, 4)}><Slice /></P>
  </>) },
  // 17. «За то лето он потратил на пиццу…» — коробки сыплются в башни
  { at: 28.98, draw: (f, g) => (<>
    <Ground y={1640} w={1000} />
    {[0, 1].flatMap((side) => Array.from({ length: 9 }, (_, i) => {
      const k = pop(f, i * 4 + side * 2, 200);
      const yEnd = 1600 - i * 100;
      return <P key={`${side}-${i}`} x={side ? 900 : 180} y={ip(k, [0, 1], [-200, yEnd])} w={300} h={130} r={(rnd(i + side * 10) - 0.5) * 8}><Boxes n={1} /></P>;
    }))}
    <Cat x={540} y={1640} w={540} t={g} id="c17" mood={f > 24 ? "shock" : "calm"} />
  </>) },
  // 18. «…сто тысяч биткоинов» — удар, взрыв монет, наезд на лицо
  { at: 30.68, draw: (f, g) => {
    const [sx, sy] = shake(f, 1, 14, 26);
    const zoom = ip(f, [sec(1.3), sec(3.1)], [1, 2.6], Easing.inOut(Easing.cubic));
    const dark = ip(f, [sec(1.3), sec(2.6)], [0, 1]);
    const red = ip(f, [sec(2.2), sec(3.1)], [0, 1]);
    return (
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sx}px, ${sy}px)` }}>
        <div style={{ position: "absolute", inset: 0, transformOrigin: "540px 1290px", transform: `scale(${zoom})` }}>
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2 + rnd(i), k = ip(f, [1, 22], [0, 1], Easing.out(Easing.cubic));
            return <P key={i} x={540 + Math.cos(a) * 700 * k} y={900 + Math.sin(a) * 900 * k + k * k * 300} w={150} r={f * 8 * (i % 2 ? 1 : -1)} o={ip(f, [16, 26], [1, 0])}><Coin /></P>;
          })}
          <Cat x={540} y={2050} w={900} t={g} id="c18" mood="shock" />
        </div>
        <div style={{ opacity: 1 - dark }}><Big text="100 000 ₿" size={240} color="#ffcf2e" y={330} s={ip(pop(f, 0, 300), [0, 1], [3, 1])} r={-5} /></div>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 40%, rgba(0,0,0,0) 30%, rgba(20,0,0,0.85) 85%)", opacity: dark }} />
        <div style={{ position: "absolute", inset: 0, background: "#ff1a1a", mixBlendMode: "multiply", opacity: red * 0.35 }} />
      </div>
    );
  } },
];

export const PizzaShort: React.FC = () => {
  const g = useCurrentFrame();
  const idx = SCENES.findIndex((s, i) => g >= sec(s.at) && (i === SCENES.length - 1 || g < sec(SCENES[i + 1].at)));
  const sc = SCENES[Math.max(0, idx)];
  const f = g - sec(sc.at);
  return (
    <AbsoluteFill style={{ background: "#ffffff", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${1.04 - Math.min(f, 6) * 0.0067})` }}>{sc.draw(f, g)}</AbsoluteFill>
      <Audio src={staticFile("crypto/pizza/voice.mp3")} />
      <Audio src={staticFile("crypto/pizza/sound.wav")} volume={0.45} />
    </AbsoluteFill>
  );
};
