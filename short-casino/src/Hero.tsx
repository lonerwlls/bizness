// Лист героя: Тим в полный рост на нейтральном фоне + ряд эмоций.
import React from "react";
import { Scene3D, Box, Doodle, Actor, HIP } from "./kit";
import { HERO } from "./doodle";

const Backdrop: React.FC = () => (<>
  <Box p={[0, -0.05, 0]} s={[12, 0.1, 10]} c="#d9d3c7" line={false} />
  <Box p={[0, 3, -3]} s={[12, 6, 0.1]} c="#cfc8bb" line={false} />
</>);

export const HeroSheet: React.FC = () => {
  const tim: Actor = { pos: [0, 0, 0], seed: 4, look: HERO, expr: [[0, "smug"]],
    handB: [[0, 0.24, HIP + 0.1]], handF: [[0, -0.24, HIP + 0.1]] };
  return (
    <Scene3D t0={0} cam={[[0, [0.55, 1.05, 2.55], [0, 0.95, 0], 52]]} focus={[0, 1, 0]} bg="#cfc8bb">
      <Backdrop /><Doodle a={tim} />
    </Scene3D>);
};

const EMO = ["suspicious", "skeptic", "dreamy", "wink", "awe", "money", "grimace", "ecstatic", "panic", "squint", "dizzy", "sleepy", "thinking", "aha", "angry", "sad", "smart", "deadpan", "crying", "shock"];
// лист эмоций: 4 в ряд, 5 рядов (служебный, только для проверки)
export const HeroEmotions: React.FC = () => (
  <Scene3D t0={0} cam={[[0, [0, 3.2, 14], [0, 3.2, 0], 26]]} focus={[0, 3.2, 0]} bg="#cfc8bb">
    <Box p={[0, 3, -1]} s={[12, 10, 0.1]} c="#cfc8bb" line={false} />
    {EMO.map((e, i) => <Doodle key={e} a={{ pos: [((i % 4) - 1.5) * 1.15, 4 * 1.3 - Math.floor(i / 4) * 1.3 - 0.6, 0], seed: i + 1, look: HERO, expr: [[-1, e]] }} />)}
  </Scene3D>);
