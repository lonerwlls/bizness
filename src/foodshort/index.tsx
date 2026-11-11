// Шортс про пропавшую еду, «Part 1: The last crate». Рендер: bash scripts/make_foodshort.sh [ru]
import React from "react";
import { Composition, registerRoot } from "remotion";
import { FS_FRAMES, FS_FRAMES_RU, FoodShort } from "./FoodShort";
import { PetyaSheet } from "./sheet";
import { Avatar } from "./avatar";
import { FoodShort3, TM3 } from "./FoodShort3";
import { Lift1, TM_L1 } from "../stories/lift1";
import { FS2_FRAMES, FoodShort2 } from "./FoodShort2";

const Root: React.FC = () => <>
  <Composition id="FoodShort" component={FoodShort} durationInFrames={FS_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ lang: "en" as const }} />
  <Composition id="FoodShortRU" component={FoodShort} durationInFrames={FS_FRAMES_RU} fps={30} width={1080} height={1920} defaultProps={{ lang: "ru" as const }} />
  <Composition id="FoodShort2" component={FoodShort2} durationInFrames={FS2_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="FoodShort3" component={FoodShort3} durationInFrames={TM3.frames} fps={30} width={1080} height={1920} />
  <Composition id="Story-lift1" component={Lift1} durationInFrames={TM_L1.frames} fps={30} width={1080} height={1920} />
  <Composition id="Avatar" component={Avatar} durationInFrames={1} fps={30} width={1080} height={1080} />
  <Composition id="PetyaSheet" component={PetyaSheet} durationInFrames={30} fps={30} width={1800} height={900} />
</>;
registerRoot(Root);
