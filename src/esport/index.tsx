import React from "react";
import { Composition, registerRoot } from "remotion";
import { EsportSample, SAMPLE_FRAMES } from "./sample";
import { EsportFull, FULL_FRAMES } from "./full";

const Root: React.FC = () => (
  <>
    <Composition id="Esport-sample" component={EsportSample} durationInFrames={SAMPLE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Esport-full" component={EsportFull} durationInFrames={FULL_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
registerRoot(Root);
