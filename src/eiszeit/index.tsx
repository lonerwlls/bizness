// Ролик «Wie lange würdest DU in der Eiszeit überleben?» (немецкий, фото-коллаж).
// Части: Eis-p1 … Eis-p7, весь ролик: Eis-full.  Рендер: npx remotion render src/eiszeit/index.tsx Eis-full out/eis/full.mp4
import { Composition, Series, registerRoot } from "remotion";
import { Part1 } from "./part1";
import { PARTS } from "./parts";
import { FRAMES, TOTAL } from "./timeline";

const ALL = [Part1, ...PARTS];
const Full = () => (
  <Series>
    {ALL.map((P, i) => <Series.Sequence key={i} durationInFrames={FRAMES[i]}><P fade={i === ALL.length - 1} /></Series.Sequence>)}
  </Series>
);

registerRoot(() => (
  <>
    {ALL.map((P, i) => <Composition key={i} id={`Eis-p${i + 1}`} component={P} durationInFrames={FRAMES[i]} fps={30} width={1920} height={1080} />)}
    <Composition id="Eis-full" component={Full} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
  </>
));
