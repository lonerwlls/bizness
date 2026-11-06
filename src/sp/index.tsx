// «What If You Woke Up With Every Superpower?» — 8 частей по минуте (16:9). Рендер: bash scripts/sp_render.sh 1 2 ...
import { Composition, registerRoot } from "remotion";
import { P1 } from "./part1";
import { P2 } from "./part2";
import { P3 } from "./part3";

const PARTS = [P1, P2, P3];
registerRoot(() => <>{PARTS.map((p, i) => <Composition key={i} id={`Fin-sp${i + 1}`} component={p.Comp} durationInFrames={p.FR} fps={30} width={1920} height={1080} />)}</>);
