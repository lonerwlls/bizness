import React from "react";
import { Composition } from "remotion";
import { EYES2_FRAMES, Eyes2 } from "./eyes2";

export const Eyes2Root: React.FC = () => (
  <Composition id="Fin-eyes2" component={Eyes2} durationInFrames={EYES2_FRAMES} fps={30} width={1080} height={1920} />
);
