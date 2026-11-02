import React from "react";
import { Composition } from "remotion";
import { EYES3_FRAMES, Eyes3 } from "./eyes3";

export const Eyes3Root: React.FC = () => (
  <Composition id="Fin-eyes3" component={Eyes3} durationInFrames={EYES3_FRAMES} fps={30} width={1080} height={1920} />
);
