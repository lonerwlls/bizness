// Ролик «Wie lange würdest DU neben einem Schwarzen Loch überleben?» (немецкий). Части Sgr-p1…p7, весь ролик Sgr-full.
import { Composition, Series, registerRoot } from "remotion";
import { SgrPart1 } from "./part1";
import { SGR_PARTS } from "./parts";
import { FRAMES, TOTAL } from "./timeline";

const ALL = [SgrPart1, ...SGR_PARTS];
const Full = () => (
  <Series>
    {ALL.map((P, i) => <Series.Sequence key={i} durationInFrames={FRAMES[i]}><P fade={i === ALL.length - 1} /></Series.Sequence>)}
  </Series>
);

registerRoot(() => (
  <>
    {ALL.map((P, i) => <Composition key={i} id={`Sgr-p${i + 1}`} component={P} durationInFrames={FRAMES[i]} fps={30} width={1920} height={1080} />)}
    <Composition id="Sgr-full" component={Full} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
  </>
));
