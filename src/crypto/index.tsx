// Лист котика: npx remotion still src/crypto/index.tsx Kitty-sheet out/kitty.png
// Ролик: npx remotion render src/crypto/index.tsx Fin-pizza out/pizza.mp4
import React from "react";
import { Composition, registerRoot, AbsoluteFill, staticFile, delayRender, continueRender } from "remotion";
import { Kitty, Hat, Mood } from "./Kitty";
import { PizzaShort, PIZZA_DUR, FPS } from "./pizza";

if (typeof document !== "undefined") {
  const h = delayRender("fonts");
  Promise.all(
    [["Montserrat-latin", "U+0000-00FF"], ["Montserrat-cyrillic", "U+0400-045F"]].map(([f, r]) =>
      new FontFace("KMont", `url(${staticFile(`towers/fonts/${f}.woff2`)})`, { unicodeRange: r, weight: "100 900" }).load().then((x) => document.fonts.add(x)),
    ),
  ).then(() => continueRender(h), () => continueRender(h));
}

const HATS: [Hat, string][] = [["top", "1. Цилиндр"], ["beanie", "2. Шапка с помпоном"], ["cap", "3. Кепка"]];
const MOODS: Mood[] = ["calm", "happy", "sad", "shock"];

const Sheet: React.FC = () => (
  <AbsoluteFill style={{ background: "#fff", fontFamily: "KMont", color: "#222" }}>
    <div style={{ display: "flex", justifyContent: "space-around", marginTop: 70 }}>
      {HATS.map(([h, l]) => (
        <div key={h} style={{ width: 340, textAlign: "center" }}>
          <div style={{ height: 520 }}><Kitty hat={h} id={h} t={10} /></div>
          <div style={{ fontSize: 34, fontWeight: 800, marginTop: 30 }}>{l}</div>
        </div>
      ))}
    </div>
    <div style={{ textAlign: "center", fontSize: 30, fontWeight: 700, marginTop: 80, color: "#777" }}>эмоции</div>
    <div style={{ display: "flex", justifyContent: "space-around", marginTop: 20 }}>
      {MOODS.map((m) => (
        <div key={m} style={{ width: 240, height: 360 }}><Kitty hat="top" mood={m} id={m} t={10} /></div>
      ))}
    </div>
  </AbsoluteFill>
);

const Root: React.FC = () => (
  <>
    <Composition id="Kitty-sheet" component={Sheet} width={1080} height={1350} fps={30} durationInFrames={1} />
    <Composition id="Fin-pizza" component={PizzaShort} width={1080} height={1920} fps={FPS} durationInFrames={PIZZA_DUR * FPS} />
  </>
);
registerRoot(Root);
