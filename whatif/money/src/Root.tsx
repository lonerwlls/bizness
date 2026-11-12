import React from 'react';
import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {Long, LONG_FRAMES} from './Long';
import {Short, SHORT_FRAMES} from './Short';
import {Sheet, SheetProps, sheetSize} from './Sheet';
import {PauseTime} from './reference/PauseTime';
import {HeadsSheet} from './HeadsSheet';

/* open-licence fonts from public/fonts, loaded before the first frame renders */
// generous timeout: with several render tabs at once a cold font load can take a while;
// if it still fails the frame renders with the fallback font instead of crashing
// fonts are declared in CSS; each page waits for them inside React (useFontsReady) with a hard fallback
const fontCss = document.createElement('style');
fontCss.textContent = `@font-face{font-family:'Rubik';src:url('${staticFile('fonts/Rubik.ttf')}');font-weight:300 900}@font-face{font-family:'Caveat';src:url('${staticFile('fonts/Caveat.ttf')}');font-weight:400 700}`;
document.head.appendChild(fontCss);
const useFontsReady = () => {
	const [h] = React.useState(() => delayRender('fonts', {timeoutInMilliseconds: 60000}));
	React.useEffect(() => {
		let done = false;
		const go = () => {
			if (done) return;
			done = true;
			continueRender(h);
		};
		Promise.all([document.fonts.load("800 40px 'Rubik'"), document.fonts.load("400 40px 'Caveat'")]).then(go, go);
		const t = setTimeout(go, 15000);
		return () => clearTimeout(t);
	}, [h]);
};

// headings are heavy unless a text asks for another weight (the style's chunky lettering)
const css = document.createElement('style');
css.textContent = `text[font-family*="Rubik"]:not([font-weight]){font-weight:800}`;
document.head.appendChild(css);

const defaultSheet: SheetProps = {comp: 'Long', frames: [0, 30, 60, 90], cols: 4};

export const Root: React.FC = () => {
	useFontsReady();
	return (
	<>
		<Composition id="Long" component={Long} durationInFrames={Math.max(1, LONG_FRAMES)} fps={30} width={1920} height={1080} />
		<Composition id="Short" component={Short} durationInFrames={Math.max(1, SHORT_FRAMES)} fps={30} width={1080} height={1920} />
		<Composition
			id="Sheet"
			component={Sheet}
			// as long as the videos: frozen scenes keep their Sequences alive
			durationInFrames={Math.max(LONG_FRAMES, SHORT_FRAMES, 1)}
			fps={30}
			width={1920}
			height={1080}
			defaultProps={defaultSheet}
			calculateMetadata={({props}) => {
				const s = sheetSize(props);
				return {width: s.width, height: Math.ceil(s.height / 2) * 2};
			}}
		/>
		{/* the approved style reference: 10 s, built by hand, shows what "our level" means */}
		<Composition id="Heads" component={HeadsSheet} durationInFrames={1} fps={30} width={1920} height={1080} />
		<Composition id="Reference" component={PauseTime} durationInFrames={300} fps={30} width={1920} height={1080} />
	</>
	);
};
