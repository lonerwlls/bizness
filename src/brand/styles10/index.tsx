// 10 художественных техник для канала: npx remotion still src/brand/styles10/index.tsx S10-<id> out.png (3D: --gl=swangle)
import React from "react";
import { Composition, registerRoot } from "remotion";
import { Blueprint, Isometric, Linocut, NeonLine, PaperCut, RubberHose, Silhouette, Watercolor } from "./scenes";
import { Claymation, Hybrid } from "./scenes3d";

const LIST: [string, React.FC][] = [["paper", PaperCut], ["watercolor", Watercolor], ["linocut", Linocut], ["blueprint", Blueprint], ["rubberhose", RubberHose],
  ["isometric", Isometric], ["neon", NeonLine], ["silhouette", Silhouette], ["clay", Claymation], ["hybrid", Hybrid]];
const Root: React.FC = () => <>{LIST.map(([id, C]) => <Composition key={id} id={`S10-${id}`} component={C} durationInFrames={1} fps={30} width={1920} height={1080} />)}</>;
registerRoot(Root);
