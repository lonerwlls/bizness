import React from "react";
import { Composition } from "remotion";
import { EYES6_FRAMES, Eyes6 } from "./eyes6";

export const Eyes6Root: React.FC = () => (
  <Composition id="Fin-eyes6" component={Eyes6} durationInFrames={EYES6_FRAMES} fps={30} width={1080} height={1920} />
);
