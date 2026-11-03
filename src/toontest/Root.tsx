import React from "react";
import { Composition } from "remotion";
import { TOONTEST_FRAMES, ToonTest } from "./toontest";

export const ToonTestRoot: React.FC = () => (
  <Composition id="Fin-toontest" component={ToonTest} durationInFrames={TOONTEST_FRAMES} fps={30} width={1080} height={1920} />
);
