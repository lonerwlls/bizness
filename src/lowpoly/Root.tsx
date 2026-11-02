import React from "react";
import { Composition } from "remotion";
import { LOWPOLY_FRAMES, LowPoly } from "./lowpoly";

export const LowPolyRoot: React.FC = () => (
  <Composition id="Fin-lowpoly" component={LowPoly} durationInFrames={LOWPOLY_FRAMES} fps={30} width={1080} height={1920} />
);
