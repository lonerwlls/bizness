// «What if the world's food supply collapsed?» — 10 частей по минуте (16:9). Рендер части: bash scripts/make_food.sh 1
import React from "react";
import { Composition, registerRoot } from "remotion";
import { PART1_FRAMES, Part1 } from "./part1";
import { PART2_FRAMES, Part2 } from "./part2";
import { PART3_FRAMES, Part3 } from "./part3";
import { PART4_FRAMES, Part4 } from "./part4";
import { PART5_FRAMES, Part5 } from "./part5";

const Root: React.FC = () => (
  <>
    <Composition id="Food-1" component={Part1} durationInFrames={PART1_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Food-5" component={Part5} durationInFrames={PART5_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Food-4" component={Part4} durationInFrames={PART4_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Food-3" component={Part3} durationInFrames={PART3_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Food-2" component={Part2} durationInFrames={PART2_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
registerRoot(Root);
