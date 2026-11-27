import React from "react";
import { Composition, registerRoot } from "remotion";
import { OnodaPart1, P1_FRAMES } from "./part1";
import { OnodaFull, FULL_FRAMES } from "./part2";

const Root: React.FC = () => (
  <>
    <Composition id="Onoda-p1" component={OnodaPart1} durationInFrames={P1_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Onoda-full" component={OnodaFull} durationInFrames={FULL_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
registerRoot(Root);
