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

const EMO = ["grin", "shock", "nervous", "laugh"];
export const HeroEmotions: React.FC = () => (
  <Scene3D t0={0} cam={[[0, [0, 1.0, 5.6], [0, 0.9, 0], 32]]} focus={[0, 1, 0]} bg="#cfc8bb">
    <Backdrop />
    {EMO.map((e, i) => <Doodle key={e} a={{ pos: [(i - 1.5) * 0.78, 0, 0], seed: i + 1, look: HERO, expr: [[0, e]] }} />)}
  </Scene3D>);
