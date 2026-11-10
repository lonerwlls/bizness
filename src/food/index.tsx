// «What if the world's food supply collapsed?» — 10 частей по минуте (16:9). Рендер части: bash scripts/make_food.sh 1
import React from "react";
import { Composition, registerRoot } from "remotion";
import { PART1_FRAMES, Part1 } from "./part1";

const Root: React.FC = () => (
  <>
    <Composition id="Food-1" component={Part1} durationInFrames={PART1_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
registerRoot(Root);
