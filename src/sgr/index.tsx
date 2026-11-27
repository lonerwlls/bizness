// Ролик «Wie lange würdest DU neben einem Schwarzen Loch überleben?» (немецкий). Части: Sgr-p1 …
import { Composition, registerRoot } from "remotion";
import { SgrPart1 } from "./part1";
import { FRAMES } from "./timeline";

registerRoot(() => (
  <>
    <Composition id="Sgr-p1" component={SgrPart1} durationInFrames={FRAMES[0]} fps={30} width={1920} height={1080} />
  </>
));
