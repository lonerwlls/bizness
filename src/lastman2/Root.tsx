import React from "react";
import { Composition } from "remotion";
import { LASTMAN2_FRAMES, LastMan2 } from "./lastman2";

export const LastMan2Root: React.FC = () => (
  <Composition id="Fin-lastman2" component={LastMan2} durationInFrames={LASTMAN2_FRAMES} fps={30} width={1080} height={1920} />
);
