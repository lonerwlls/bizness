import React from 'react';
import {interpolate, spring} from 'remotion';
import {Pose, Stickman, toLocal} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {CrowdRow, HeroBadge, Layer, Stage, Svg, camOn, clamp, usePush} from '../kit/kit';
import {Split} from '../kit/graphics';
import {Bubble, Cite, FONT, HAND, PhoneChat, RuleCard} from '../kit/ui';
import {CAST} from './cast';
import {Bang, CallSplit, FL, HS, SFL, SmallPhone, StreetBG, badgeY} from './common';
import {Kitchen} from '../kit/sets';
import {Apartment, CoinClock, SEAT, SeatChair, Sofa} from './places';
import {BurgerBar} from './places2';

/* PART 4 (≈3:00–4:25): the price — people drift away; the science of buying time; subscribe. */

const useW = () => {
	const {at, end} = useShot();
	return (id: string, frac: number) => at(id) + Math.round((end(id) - at(id)) * frac);
};
const pop = (f: number, t: number) => spring({frame: f - t, fps: 30, config: {damping: 11, stiffness: 160}});
const Tag: React.FC<{f: number; t: number; x: number; y: number; text: string; c?: string; fg?: string; size?: number; rot?: number}> = ({f, t, x, y, text, c = '#11142c', fg = '#fff', size = 40, rot = -4}) => {
	const k = pop(f, t);
	if (f < t) return null;
	const w = text.length * size * 0.62 + 50;
	return (
		<g transform={`translate(${x},${y}) rotate(${rot}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
			<rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.9} rx={size * 0.5} fill={c} stroke="#ffd34a" strokeWidth={4} />
			<text y={size * 0.35} textAnchor="middle" fontSize={size} fontFamily={FONT} fontWeight={900} fill={fg}>
				{text}
			</text>
		</g>
	);
};

/* 040 «But there's a catch nobody warns you about.» 041 «Rule two says it's free… So you let them.» */
const R040: React.FC = () => {
	const {f, at} = useShot();
	const w = useW();
	const fine = interpolate(f, [w('040', 0.5), w('040', 0.7)], [0, 1], clamp);
	return (
		<>
			<RuleCard n="#2" title="RULE" text="If someone ELSE pays, it's free" t={f - at('040') + 60} />
			<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
				<g opacity={fine} transform={`translate(960,920) scale(${0.8 + 0.2 * fine})`}>
					<text textAnchor="middle" fontSize={40} fontFamily={HAND} fontWeight={700} fill="#ff9a8a">
						* side effects may include: losing your friends
					</text>
				</g>
			</svg>
		</>
	);
};

/* 042 «Marco pays for dinner. Then the movies. Then the gas.» */
const R042: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const hw = walkTo(f, at('042') - 6, 1e9, 300, 1300, 3, 0.18);
	const mw = walkTo(f, at('042') - 6, 1e9, 520, 1520, 7, 0.18);
	const bills = [
		['DINNER $46', 0.05],
		['MOVIES $32', 0.38],
		['GAS $55', 0.7],
	] as const;
	const grump = interpolate(f, [at('042'), w('042', 0.9)], [0, 1], clamp);
	const cam = camOn((hw.x + mw.x) / 2 + 60, 540, 1.3);
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 60, y: 20, o: 0.35, night: true}}>
			<StreetBG gf={gf} />
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={hw.x} floor={SFL} s={HS} facing={1} faceTurn={0.6} look={[0.8, 0]} mouth="smile" pose={hw.pose} vx={hw.vx} bob={hw.bob} uid="h-tab" />
					<HeroBadge x={hw.x} y={badgeY(SFL) - hw.bob} s={0.8} />
					<Actor who="friend" x={mw.x} floor={SFL} s={1.02} facing={1} faceTurn={0.3} look={[-0.8, 0]} expr={grump > 0.5 ? 'angry' : 'normal'} mouth={grump > 0.3 ? 'frown' : 'line'} pose={mw.pose} vx={mw.vx} bob={mw.bob} uid="m-tab" />
					{bills.map(([t, k], i) => (
						<Tag key={i} f={f} t={w('042', k)} x={mw.x + 40 + i * 30} y={300 - i * 70} text={t} c="#d23b3b" rot={-6 + i * 4} size={34} />
					))}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 043 «On a date, the check arrives, and you study the ceiling for a very long time.» */
const R043: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const check = interpolate(f, [w('043', 0.2), w('043', 0.35)], [0, 1], clamp);
	const up = interpolate(f, [w('043', 0.45), w('043', 0.55)], [0, 1], clamp);
	const hp: Pose = {...SIT, head: -22 * up};
	const dp: Pose = {...SIT, head: 6};
	const cam = usePush(camOn(960, 560, 1.35), camOn(960, 540, 1.6));
	return (
		<Stage cam={cam} bg="#3a1f2a" light={{x: 50, y: 10, o: 0.5, c: '255,200,150'}}>
			<Layer depth={1.6}>
				<BurgerBar f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					{/* candle-lit table */}
					<rect x={760} y={740} width={400} height={18} rx={6} fill="#f4efe2" />
					<rect x={950} y={758} width={20} height={150} fill="#5a3d36" />
					<rect x={952} y={690} width={14} height={50} fill="#f4efe2" />
					<ellipse cx={959} cy={684} rx={7} ry={12} fill="#ffd34a" opacity={0.8 + 0.2 * Math.sin(gf / 2)} />
					<circle cx={959} cy={684} r={60} fill="#ffcf7a" opacity={0.15} style={{filter: 'blur(14px)'}} />
					<g transform={`translate(${1100 - 140 * check},${732 - 80 * (1 - check)})`} opacity={check}>
						<rect x={-40} y={-10} width={80} height={12} rx={3} fill="#1b1a26" />
						<rect x={-28} y={-26} width={56} height={18} rx={2} fill="#f4efe2" />
						<text y={-12} textAnchor="middle" fontSize={12} fontFamily={FONT} fontWeight={900} fill="#d23b3b">
							$84
						</text>
					</g>
					<SeatChair x={680} facing={1} />
					<SeatChair x={1240} facing={-1} />
					<Actor who="hero" x={700} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.4} look={up > 0.5 ? [0.3, -1] : [0.8, 0]} mouth={up > 0.5 ? 'flat' : 'smile'} pose={hp} uid="h-date" />
					<HeroBadge x={700} y={SEAT - 164 - 118} s={0.8} />
					<Actor who="date" x={1220} floor={FL} seat={SEAT} s={0.97} facing={-1} faceTurn={0.4} look={up > 0.5 ? [-0.8, -0.2] : [-0.8, 0]} expr={up > 0.6 ? 'angry' : 'normal'} mouth={up > 0.5 ? 'flat' : 'smile'} pose={dp} uid="d-date" />
					{up > 0.5 ? <Bang f={f} t={w('043', 0.55)} x={760} y={300} text="♪ ♫ ..." c="#9fd8ff" /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 044 «Mom calls and asks why you never visit… So you say you're busy.» */
const R044: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 960;
	const k = spring({frame: f - at('044') + 6, fps: 30, config: {damping: 16, stiffness: 140}});
	const ticket = pop(f, w('044', 0.38));
	const busy = f > w('044', 0.78);
	const ear = (seed: number): Pose => ({...reach(idle(gf, seed), 'F', [30, -175], 1), head: 4});
	const momTalk = f < w('044', 0.3) ? 0.3 + 0.3 * Math.abs(Math.sin(f / 3)) : 0;
	const hero = (
		<Stage cam={camOn(HX + 40, 500, 1.3)} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.6}>
				<Apartment f={gf} page={1} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0.2]} expr={busy ? 'sad' : 'normal'} mouth={busy ? 'flat' : 'line'} pose={ear(3)} handItem={<SmallPhone />} armOver uid="h-mom" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					<g transform={`translate(${HX + 230},${300}) scale(${ticket})`} opacity={Math.min(1, ticket * 1.5)}>
						<rect x={-130} y={-56} width={260} height={112} rx={12} fill="#f4efe2" stroke="#3d6fd6" strokeWidth={5} strokeDasharray="10 6" />
						<text y={-8} textAnchor="middle" fontSize={28} fontFamily={FONT} fontWeight={900} fill="#3d6fd6">
							BUS TICKET
						</text>
						<text y={34} textAnchor="middle" fontSize={32} fontFamily={FONT} fontWeight={900} fill="#d23b3b">
							$4 = 4 MIN
						</text>
					</g>
					{busy ? (
						<Bubble x={HX + 200} y={300} w={300} h={100} t={f - w('044', 0.78)} tail={[-90, 80]}>
							<text y={14} textAnchor="middle" fontSize={38} fontFamily={FONT} fontWeight={900} fill="#13203a">
								Sorry, busy!
							</text>
						</Bubble>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
	const MX = 900;
	const mom = (
		<Stage cam={camOn(MX - 60, 500, 1.3)} bg="#2a2a48" light={{x: 70, y: 20, o: 0.4, c: '255,214,150'}}>
			<Layer depth={1.4}>
				<Kitchen night />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="mom" x={MX} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.7, 0.1]} expr={busy ? 'sad' : 'normal'} mouth={busy ? 'frown' : undefined} pose={ear(6)} handItem={<SmallPhone />} armOver talk={momTalk} uid="mom-call" />
					{f < w('044', 0.32) ? (
						<Bubble x={MX - 60} y={300} w={420} h={100} t={f - at('044')} tail={[60, 80]}>
							<text y={14} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#13203a">
								Why don't you visit?
							</text>
						</Bubble>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
	return <CallSplit left={hero} right={mom} k={k} />;
};

/* 045 «Slowly, people notice. You're the guy who never pays.» */
const R045: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 960;
	const cam = usePush(camOn(960, 560, 1.1), camOn(960, 520, 1.3));
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 60, y: 20, o: 0.35, night: true}}>
			<StreetBG gf={gf} />
			<Layer depth={1}>
				<Svg>
					<CrowdRow n={3} x0={200} x1={600} floor={SFL} s={0.95} mode="stand" seed="gos1" t={gf} dir={1} />
					<CrowdRow n={3} x0={1320} x1={1720} floor={SFL} s={0.95} mode="stand" seed="gos2" t={gf} dir={-1} />
					<Actor who="hero" x={HX} floor={SFL} s={HS} facing={1} faceTurn={0.1} look={[Math.sin(f / 14), 0]} expr="worried" pose={idle(gf, 2)} uid="h-gos" />
					<HeroBadge x={HX} y={badgeY(SFL)} s={0.8} />
					<Tag f={f} t={w('045', 0.45)} x={HX} y={300} text="THE GUY WHO NEVER PAYS" c="#d23b3b" size={44} rot={-3} />
					{[0, 1, 2, 3].map((i) => (f > at('045') + i * 12 ? <Bubble key={i} x={[400, 1500, 560, 1360][i]} y={[480, 470, 360, 360][i]} w={110} h={70} t={f - at('045') - i * 12} tail={[0, 60]}>
						<text y={12} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#13203a">
							{['psst', '$?', '...', 'cheap'][i]}
						</text>
					</Bubble> : null))}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 046 «Marco stops texting first.» */
const R046: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = usePush(camOn(960, 540, 1.0, {farBlur: 8}), camOn(960, 540, 1.08, {farBlur: 8}));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.6}>
				<Apartment f={gf} page={1} />
			</Layer>
			<Layer depth={1} sharp>
				<Svg>
					<PhoneChat
						t={f - at('046') + 120}
						title="Marco"
						x={960}
						y={540}
						s={0.95}
						msgs={[
							{at: 0, from: 'Marco', text: 'dinner tonight?'},
							{at: 14, from: 'me', text: 'you paying? lol', me: true},
							{at: 40, from: 'Marco', text: 'again??'},
							{at: 70, from: 'me', text: 'bro', me: true},
							{at: 96, from: 'me', text: 'marco?', me: true, reads: 1},
							{at: 125, from: 'me', text: 'hello???', me: true},
						]}
					/>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 047 «Your birthday comes, and nobody plans anything…» */
const R047: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const HX = 760;
	const cam = usePush(camOn(900, 600, 1.2), camOn(900, 580, 1.5));
	return (
		<Stage cam={cam} bg="#121634" light={{x: 50, y: 50, o: 0.4, c: '255,200,140'}}>
			<Layer depth={1.6}>
				<Apartment f={gf} page={1} sofa={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1400} fill="#05060f" opacity={0.45} />
					<rect x={820} y={740} width={300} height={16} rx={6} fill="#5a4a3a" />
					<rect x={950} y={756} width={18} height={150} fill="#3a2f2a" />
					<g transform="translate(960,740)">
						<path d="M-22,0 L22,0 L18,-30 L-18,-30 Z" fill="#c95ab0" />
						<ellipse cx={0} cy={-32} rx={24} ry={10} fill="#f4efe2" />
						<rect x={-2} y={-62} width={4} height={26} fill="#9fd8ff" />
						<ellipse cx={0} cy={-68} rx={5} ry={9} fill="#ffd34a" opacity={0.8 + 0.2 * Math.sin(gf / 2)} />
						<circle cx={0} cy={-68} r={80} fill="#ffcf7a" opacity={0.18} style={{filter: 'blur(16px)'}} />
					</g>
					<Sofa />
					<Actor who="hero" x={HX} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0.5]} expr="sad" mouth="frown" pose={{...SIT, head: 10}} uid="h-bday" />
					<HeroBadge x={HX} y={SEAT - 164 - 118} s={0.8} />
					<Tag f={f} t={w('047', 0.1)} x={1300} y={330} text="HAPPY BIRTHDAY... TO ME" c="#11142c" fg="#ffd34a" size={36} rot={3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 048 «And it hits you. You're saving minutes, but you're losing people.» */
const R048: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const k = interpolate(f, [w('048', 0.3), w('048', 0.95)], [0, 1], clamp);
	const HX = 960;
	const cam = usePush(camOn(960, 540, 1.05), camOn(960, 540, 1.15));
	const people = 6;
	return (
		<Stage cam={cam} bg="#101634" light={{x: 50, y: 20, o: 0.4, night: true}}>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0} look={[0, 0.2]} expr="sad" pose={gesture('handsOnHead', idle(gf, 1), env(f, at('048') + 4, 1e9, 10, 1) * 0.5, f)} uid="h-lose" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					{/* minutes saved: bar grows */}
					<g transform="translate(430,300)">
						<text x={0} y={-30} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#9ff0b0">
							MINUTES SAVED
						</text>
						<rect x={-60} y={0} width={120} height={480} rx={14} fill="#1d2552" />
						<rect x={-60} y={480 - 480 * (0.2 + 0.8 * k)} width={120} height={480 * (0.2 + 0.8 * k)} rx={14} fill="#3fcf7a" />
					</g>
					{/* people: icons fade out one by one */}
					<g transform="translate(1490,300)">
						<text x={0} y={-30} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#ff9a8a">
							PEOPLE
						</text>
						{Array.from({length: people}).map((_, i) => {
							const gone = k > (people - i) / (people + 1);
							return (
								<g key={i} transform={`translate(${-90 + (i % 3) * 90},${90 + Math.floor(i / 3) * 200})`} opacity={gone ? 0.12 : 1}>
									<circle r={34} fill="#f4efe2" />
									<rect x={-30} y={40} width={60} height={90} rx={24} fill={['#4f7dd8', '#7a5cc4', '#e0607a', '#3aa37a', '#c95ab0', '#e47a3c'][i]} />
								</g>
							);
						})}
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 049 «Here's what science says about that.» */
const R049: React.FC = () => {
	const {f, gf, at} = useShot();
	const k = pop(f, at('049'));
	const cam = usePush(camOn(960, 540, 1.0), camOn(960, 540, 1.1));
	return (
		<Stage cam={cam} bg="#0f2a3a" light={{x: 50, y: 20, o: 0.4, night: true}}>
			<Layer depth={1}>
				<Svg>
					<g transform={`translate(960,520) scale(${k})`}>
						<circle r={260} fill="#3fe0e8" opacity={0.12} style={{filter: 'blur(30px)'}} />
						<path d="M-60,-220 L60,-220 L60,-80 L170,140 Q180,180 140,180 L-140,180 Q-180,180 -170,140 L-60,-80 Z" fill="#e9f6ff" opacity={0.95} />
						<path d="M-115,40 L115,40 L170,140 Q180,180 140,180 L-140,180 Q-180,180 -170,140 Z" fill="#3fe0e8" />
						{[0, 1, 2].map((i) => (
							<circle key={i} cx={-40 + i * 40} cy={120 - (((gf + i * 20) * 2) % 140)} r={10 + i * 3} fill="#fff" opacity={0.6} />
						))}
						<text y={300} textAnchor="middle" fontSize={84} fontFamily={FONT} fontWeight={900} fill="#fff">
							SCIENCE
						</text>
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 050 «In twenty seventeen, Harvard researcher Ashley Whillans… six thousand people in four countries.» */
const R050: React.FC = () => {
	const {f, at} = useShot();
	const w = useW();
	const cam = usePush(camOn(960, 540, 1.0), camOn(960, 530, 1.08));
	const n = Math.floor(interpolate(f, [w('050', 0.45), w('050', 0.7)], [0, 6000], clamp));
	const countries = ['USA', 'CANADA', 'DENMARK', 'NETHERLANDS'];
	return (
		<Stage cam={cam} bg="#0f2a3a" light={{x: 50, y: 20, o: 0.4, night: true}}>
			<Layer depth={1}>
				<Svg>
					<g transform="translate(960,150)" opacity={pop(f, at('050'))}>
						<text textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#9fd8ff">
							HARVARD · 2017 · ASHLEY WHILLANS
						</text>
					</g>
					{Array.from({length: 120}).map((_, i) => {
						const on = i / 120 < n / 6000;
						return (
							<g key={i} transform={`translate(${300 + (i % 20) * 66},${260 + Math.floor(i / 20) * 70})`} opacity={on ? 1 : 0.12}>
								<circle r={12} fill="#f4efe2" />
								<rect x={-11} y={14} width={22} height={30} rx={8} fill={['#4f7dd8', '#e47a3c', '#3aa37a', '#c95ab0'][i % 4]} />
							</g>
						);
					})}
					<text x={960} y={760} textAnchor="middle" fontSize={84} fontFamily={FONT} fontWeight={900} fill="#fff">
						{n.toLocaleString('en-US')}+ PEOPLE
					</text>
					{countries.map((c, i) => {
						const k = pop(f, w('050', 0.75) + i * 5);
						return (
							<g key={c} transform={`translate(${420 + i * 360},880) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
								<rect x={-150} y={-38} width={300} height={76} rx={38} fill="#11142c" stroke="#9fd8ff" strokeWidth={4} />
								<text y={13} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#9fd8ff">
									{c}
								</text>
							</g>
						);
					})}
					<Cite text="Whillans et al., PNAS, 2017 — “Buying time promotes happiness”" t={f - at('050')} x={1880} y={1050} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 051 «The people who paid to save time… were more satisfied with their lives.» */
const R051: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const meter = interpolate(f, [w('051', 0.6), w('051', 0.95)], [0.35, 0.95], clamp);
	// the cleaner holds the mop handle with both hands and sweeps it back and forth
	const CX = 1350;
	const sweep = Math.sin(gf / 6) * 40;
	const P: [number, number] = [CX - 200 + sweep, 900];
	const T: [number, number] = [CX - 40 + sweep * 0.5, 640];
	const at01 = (k: number): [number, number] => [P[0] + (T[0] - P[0]) * k, P[1] + (T[1] - P[1]) * k];
	const cs = 0.98;
	const hipY = FL - 157 * cs;
	let cp: Pose = {...idle(gf, 5), lean: 15};
	cp = reach(cp, 'F', toLocal(...at01(0.88), CX, hipY, cs, -1), 1);
	cp = reach(cp, 'B', toLocal(...at01(0.7), CX, hipY, cs, -1), 1);
	const cam = usePush(camOn(960, 540, 1.1), camOn(980, 530, 1.22));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.6}>
				<Apartment f={gf} page={1} sofa={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<line x1={P[0]} y1={P[1] - 6} x2={T[0]} y2={T[1]} stroke="#c98a4a" strokeWidth={9} strokeLinecap="round" />
					<ellipse cx={P[0]} cy={898} rx={46} ry={11} fill="#9fd8ff" />
					<ellipse cx={P[0] - sweep * 0.6} cy={904} rx={70} ry={6} fill="#bfe8ff" opacity={0.35} />
					<Actor who="cleaner" x={CX} floor={FL} s={cs} facing={-1} faceTurn={0.3} look={[-0.4, 0.6]} mouth="smile" pose={cp} uid="cleaner" />
					<Sofa />
					<Actor who="hero" x={760} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.2} look={[0.3, -0.2]} mouth="smile" lidL={0.4} lidR={0.4} pose={{...SIT, armF: [150, 30], armB: [-150, 30], head: -6}} uid="h-relax" />
					<g transform="translate(960,210)">
						<rect x={-150} y={-36} width={300} height={72} rx={36} fill="#11142c" stroke="#9ff0b0" strokeWidth={4} />
						<rect x={-140} y={-26} width={280 * meter} height={52} rx={26} fill="#3fcf7a" />
						<text y={-60} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#9ff0b0">
							LIFE SATISFACTION
						</text>
					</g>
					<Tag f={f} t={w('051', 0.2)} x={1360} y={320} text="PAID TO SAVE TIME" c="#11142c" fg="#9ff0b0" size={36} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 052 «In another experiment, people got forty dollars… The time purchase made them feel better.» */
const R052: React.FC = () => {
	const {f, at} = useShot();
	const w = useW();
	const split = f - w('052', 0.3);
	const happy = f > w('052', 0.85);
	if (split < 0) {
		const k = pop(f, at('052'));
		return (
			<Stage cam={camOn(960, 540, 1.0)} bg="#0f2a3a" light={{x: 50, y: 20, o: 0.4, night: true}}>
				<Layer depth={1}>
					<Svg>
						<g transform={`translate(960,520) scale(${k})`}>
							<rect x={-300} y={-150} width={600} height={300} rx={30} fill="#3fcf7a" />
							<rect x={-270} y={-120} width={540} height={240} rx={20} fill="none" stroke="#0e3a22" strokeWidth={6} />
							<text y={50} textAnchor="middle" fontSize={180} fontFamily={FONT} fontWeight={900} fill="#0e3a22">
								$40
							</text>
						</g>
						<text x={960} y={850} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#fff">
							× 2 WEEKENDS
						</text>
					</Svg>
				</Layer>
			</Stage>
		);
	}
	return (
		<Split
			f={split}
			a={{label: 'WEEKEND 1: STUFF', num: happy ? 'MEH' : '$40', color: '#ffd34a', expr: 'normal', bg: '#3a1d2a'}}
			b={{label: 'WEEKEND 2: SAVE TIME', num: happy ? 'HAPPIER' : '$40', color: '#9ff0b0', expr: happy ? 'wide' : 'normal', bg: '#1d3a2a'}}
		/>
	);
};

/* 053 «Researchers even have a name for always feeling short on time. Time poverty. And money can fix it…» */
const R053: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const HX = 960;
	const fix = interpolate(f, [w('053', 0.6), w('053', 0.8)], [0, 1], clamp);
	const cam = usePush(camOn(960, 540, 1.1), camOn(960, 520, 1.25));
	let hp = gesture('handsOnHead', idle(gf, 3), (1 - fix) * env(f, w('053', 0.05), 1e9, 10, 1), f);
	return (
		<Stage cam={cam} bg="#101634" light={{x: 50, y: 20, o: 0.4, night: true}}>
			<Layer depth={1}>
				<Svg>
					{Array.from({length: 10}).map((_, i) => {
						const a = (i / 10) * Math.PI * 2 + gf / (30 - fix * 20);
						const r = 330 + 40 * Math.sin(gf / 10 + i) + fix * 400;
						return <CoinClock key={i} x={HX + Math.cos(a) * r} y={560 + Math.sin(a) * r * 0.55} r={44} k={1} f={gf * (3 - 2 * fix) + i * 30} />;
					})}
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.1} look={[Math.sin(f / 5) * (1 - fix), 0]} expr={fix > 0.5 ? 'normal' : 'worried'} mouth={fix > 0.5 ? 'smile' : 'open'} pose={hp} uid="h-pov" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					<Tag f={f} t={w('053', 0.3)} x={HX} y={160} text="TIME POVERTY" c="#d23b3b" size={60} rot={0} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 054 «Money that buys you time is the best money… Money that costs you people is the worst.» */
const R054: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	return (
		<Split
			f={f - w('054', 0)}
			a={{label: 'BEST: $ → TIME', num: '✓', color: '#9ff0b0', expr: 'normal', bg: '#1d3a2a'}}
			b={{label: 'WORST: $ → NO FRIENDS', num: '✗', color: '#ff6a5a', expr: 'sad', bg: '#3a1d2a'}}
		/>
	);
};

/* 055 «If this video made you count your minutes, hit subscribe. It costs you nothing. Literally.» */
const R055: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 640;
	const press = interpolate(f, [w('055', 0.42), w('055', 0.5)], [0, 1], clamp);
	const done = press >= 1;
	const hp = gesture('point', idle(gf, 2), env(f, at('055') + 6, w('055', 0.4), 10, 8), f);
	const cam = usePush(camOn(960, 540, 1.1), camOn(960, 520, 1.2));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.6}>
				<Apartment f={gf} page={1} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.3} look={[0.8, 0]} mouth="smile" pose={hp} handF="point" uid="h-sub" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					<g transform={`translate(1240,520) scale(${1 - 0.08 * Math.sin(press * Math.PI)})`}>
						<rect x={-280} y={-80} width={560} height={160} rx={30} fill={done ? '#5a6078' : '#e4473c'} />
						<text y={22} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#fff">
							{done ? 'SUBSCRIBED ✓' : 'SUBSCRIBE'}
						</text>
					</g>
					{done ? <Bang f={f} t={w('055', 0.55)} x={HX - 230} y={badgeY(FL) + 130} text="−0 min!" c="#9ff0b0" /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

export const SHOTS4: ShotDef[] = [
	{at: '040', C: R040, whip: true},
	{at: '042', C: R042, whip: true},
	{at: '043', C: R043, whip: true},
	{at: '044', C: R044, whip: true},
	{at: '045', C: R045, whip: true},
	{at: '046', C: R046},
	{at: '047', C: R047, whip: true},
	{at: '048', C: R048},
	{at: '049', C: R049, whip: true},
	{at: '050', C: R050},
	{at: '051', C: R051, whip: true},
	{at: '052', C: R052},
	{at: '053', C: R053, whip: true},
	{at: '054', C: R054},
	{at: '055', C: R055, whip: true},
];
