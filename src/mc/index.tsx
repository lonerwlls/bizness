// «What if Minecraft became real?» — 7 частей по минуте (16:9). Рендер: bash scripts/mc_render.sh 1 2 ... 7
import { Composition, registerRoot } from "remotion";
import { P1 } from "./part1";
import { P2 } from "./part2";
import { P3 } from "./part3";
import { P4 } from "./part4";
import { P5 } from "./part5";
import { P6 } from "./part6";
import { P7 } from "./part7";
import { ThumbMc } from "./thumb";

const PARTS = [P1, P2, P3, P4, P5, P6, P7];
registerRoot(() => (
  <><Composition id="Thumb-mc" component={ThumbMc} durationInFrames={1} fps={30} width={1280} height={720} />{PARTS.map((p, i) => <Composition key={i} id={`Fin-mc${i + 1}`} component={p.Comp} durationInFrames={p.FR} fps={30} width={1920} height={1080} />)}</>
));
