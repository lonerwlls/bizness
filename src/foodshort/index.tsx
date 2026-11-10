// Шортс про пропавшую еду, «Part 1: The last crate». Рендер: bash scripts/make_foodshort.sh
import React from "react";
import { Composition, registerRoot } from "remotion";
import { FS_FRAMES, FoodShort } from "./FoodShort";

const Root: React.FC = () => <Composition id="FoodShort" component={FoodShort} durationInFrames={FS_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);
