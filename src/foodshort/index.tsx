// Шортс про пропавшую еду, «Part 1: The last crate». Рендер: bash scripts/make_foodshort.sh [ru]
import React from "react";
import { Composition, registerRoot } from "remotion";
import { FS_FRAMES, FS_FRAMES_RU, FoodShort } from "./FoodShort";

const Root: React.FC = () => <>
  <Composition id="FoodShort" component={FoodShort} durationInFrames={FS_FRAMES} fps={30} width={1080} height={1920} defaultProps={{ lang: "en" as const }} />
  <Composition id="FoodShortRU" component={FoodShort} durationInFrames={FS_FRAMES_RU} fps={30} width={1080} height={1920} defaultProps={{ lang: "ru" as const }} />
</>;
registerRoot(Root);
