// «Alone in a city after a total blackout» — 30 дней, 10 частей (~10 мин) (16:9). Рендер: bash scripts/bo_render.sh 1 2 ...
import { Composition, registerRoot } from "remotion";
import { P1 } from "./part1";
import { P2 } from "./part2";
import { P3 } from "./part3";
import { P4 } from "./part4";
import { P5 } from "./part5";
import { P6 } from "./part6";
import { P7 } from "./part7";

const PARTS = [P1, P2, P3, P4, P5, P6, P7];
registerRoot(() => <>{PARTS.map((p, i) => <Composition key={i} id={`Fin-bo${i + 1}`} component={p.Comp} durationInFrames={p.FR} fps={30} width={1920} height={1080} />)}</>);
