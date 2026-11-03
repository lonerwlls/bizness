import React from "react";
import { Composition } from "remotion";
import { TOONTEST_FRAMES, ToonLook, ToonTest, ToonTown } from "./toontest";

export const ToonTestRoot: React.FC = () => (
  <>
    <Composition id="Fin-toontest" component={ToonTest} durationInFrames={TOONTEST_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Fin-toontown" component={ToonTown} durationInFrames={60} fps={30} width={1080} height={1920} />
    <Composition id="Fin-toonlook" component={ToonLook} durationInFrames={60} fps={30} width={1080} height={1920} />
  </>
);
