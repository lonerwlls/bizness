// «What if the world's food supply collapsed?» — 10 частей по минуте (16:9). Рендер части: bash scripts/make_food.sh 1
import React from "react";
import { Composition, registerRoot } from "remotion";
import { PART1_FRAMES, Part1 } from "./part1";
import { PART2_FRAMES, Part2 } from "./part2";
import { PART3_FRAMES, Part3 } from "./part3";
import { PART4_FRAMES, Part4 } from "./part4";
import { PART5_FRAMES, Part5 } from "./part5";
import { PART6_FRAMES, Part6 } from "./part6";
import { PART7_FRAMES, Part7 } from "./part7";
import { PART8_FRAMES, Part8 } from "./part8";
import { PART9_FRAMES, Part9 } from "./part9";
import { PART10_FRAMES, Part10 } from "./part10";

const Root: React.FC = () => (
  <>
    <Composition id="Food-1" component={Part1} durationInFrames={PART1_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Food-10" component={Part10} durationInFrames={PART10_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Food-9" component={Part9} durationInFrames={PART9_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Food-8" component={Part8} durationInFrames={PART8_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Food-7" component={Part7} durationInFrames={PART7_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Food-6" component={Part6} durationInFrames={PART6_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Food-5" component={Part5} durationInFrames={PART5_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Food-4" component={Part4} durationInFrames={PART4_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Food-3" component={Part3} durationInFrames={PART3_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Food-2" component={Part2} durationInFrames={PART2_FRAMES} fps={30} width={1920} height={1080} />
  </>
);
registerRoot(Root);
