import React from "react";
import { Composition, registerRoot } from "remotion";
import { Onoda3D, ONODA3D_FRAMES } from "./Onoda3D";

const Root: React.FC = () => <Composition id="Onoda-3d" component={Onoda3D} durationInFrames={ONODA3D_FRAMES} fps={30} width={1080} height={1920} />;
registerRoot(Root);
