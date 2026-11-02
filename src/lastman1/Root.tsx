import React from "react";
import { Composition } from "remotion";
import { LASTMAN1_FRAMES, LastMan1 } from "./lastman1";

export const LastMan1Root: React.FC = () => (
  <Composition id="Fin-lastman1" component={LastMan1} durationInFrames={LASTMAN1_FRAMES} fps={30} width={1080} height={1920} />
);
