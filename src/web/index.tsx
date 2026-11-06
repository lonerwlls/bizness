// «Тебе заблокировали сайт. Но исчез ли он из интернета?» — шортс 9:16. Рендер: bash scripts/make.sh web
import { Composition, registerRoot } from "remotion";
import { WebShort, FRAMES } from "./web";

registerRoot(() => <Composition id="Fin-web" component={WebShort} durationInFrames={FRAMES} fps={30} width={1080} height={1920} />);
