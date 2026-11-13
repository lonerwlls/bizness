import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Pose, toLocal} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {HeroBadge, Layer, Stage, Svg, camOn, clamp, ease, usePush} from '../kit/kit';
import {AgeBadge, Bubble, Cite, FONT, HAND} from '../kit/ui';
import {FL, HS, badgeY} from './common';
import {SEAT, SeatChair} from './places';
import {ChessTable, Cottage, Garden, Room72} from './placesP';
import {Tag, camPath, pop, useW} from './partA';

/* PART C (3:02–4:08): Grandma Rosa, the attention science, the 1972 twist. */

export const FlipPhone = () => (
	<g transform="rotate(-10)">
		<rect x={-8} y={-40} width={26} height={22} rx={4} fill="#5a6078" />
		<rect x={-8} y={-18} width={26} height={22} rx={4} fill="#3a4060" />
		<rect x={-4} y={-36} width={18} height={12} rx={2} fill="#9ff0b0" />
	</g>
);
export const Shovel = () => (
	<g transform="rotate(-30)">
		<line x1={0} y1={-90} x2={0} y2={60} stroke="#c98a4a" strokeWidth={7} strokeLinecap="round" />
		<path d="M-16,56 L16,56 L12,96 Q0,108 -12,96 Z" fill="#9aa0ae" />
	</g>
);

/* 037 «Grandma Rosa lives two hours out of town, with a garden, a chess board, and a phone that flips.» */
const C037: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const hw = walkTo(f, at('037') + 10, w('037', 0.55), -250, 820, 3, 0.26);
	const flip = env(f, w('037', 0.7), 1e9, 10, 1);
	const gp: Pose = reach(idle(gf, 5), 'F', [44, -110], flip);
	const cam = camPath(f, [
		[at('037'), camOn(1200, 560, 1.1)],
		[w('037', 0.55), camOn(1050, 540, 1.25)],
		[w('037', 0.75), camOn(1240, 520, 1.7, {farBlur: 6})],
	]);
	return (
		<Stage cam={cam} bg="#2a2f6a" light={{x: 80, y: 40, o: 0.5, c: '255,200,150'}}>
			<Layer depth={1.4}>
				<Garden f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="grandma" x={1240} floor={FL} s={0.94} facing={-1} faceTurn={0.4} look={[-0.6, 0.2]} mouth="smile" pose={gp} handItem={flip > 0.3 ? <FlipPhone /> : undefined} uid="gma-37" />
					<Actor who="hero" x={hw.x} floor={FL} s={HS} facing={1} faceTurn={0.5} look={[0.8, 0]} pose={hw.moving ? hw.pose : idle(gf, 2)} vx={hw.vx} bob={hw.bob} uid="h-37" />
					<HeroBadge x={hw.x} y={badgeY(FL) - hw.bob} s={0.8} />
					<Tag f={f} t={w('037', 0.75)} x={1240 + 220} y={430} text="FLIP PHONE · 2004" c="#11142c" fg="#9ff0b0" stroke="#3fcf7a" size={26} rot={4} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 038 «She looks at your grey hair, doesn't ask a single question, and hands you a shovel.» */
const C038: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 880;
	const GX = 1120;
	const give = interpolate(f, [w('038', 0.55), w('038', 0.7)], [0, 1], {...clamp, easing: ease});
	const gp: Pose = reach({...idle(gf, 5), head: f < w('038', 0.4) ? -10 : 0}, 'F', toLocal(GX - 80 - 40 * give, FL - 157 - 90, GX, FL - 157 * 0.94, 0.94, -1), f > w('038', 0.45) && give < 1 ? 1 : 0);
	const hp: Pose = reach(idle(gf, 2), 'F', [52, -80], give >= 1 ? 1 : 0);
	const cam = camPath(f, [
		[at('038'), camOn(GX - 60, 470, 1.9, {farBlur: 7})],
		[w('038', 0.45), camOn(1000, 520, 1.5, {farBlur: 6})],
	]);
	return (
		<Stage cam={cam} bg="#2a2f6a" light={{x: 80, y: 40, o: 0.5, c: '255,200,150'}}>
			<Layer depth={1.4}>
				<Garden f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="grandma" x={GX} floor={FL} s={0.94} facing={-1} faceTurn={0.4} look={f < w('038', 0.4) ? [-0.4, -1] : [-0.8, 0]} mouth={f < w('038', 0.4) ? 'flat' : 'smile'} pose={gp} handItem={give < 1 && f > w('038', 0.45) ? <Shovel /> : undefined} uid="gma-38" />
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.5} look={[0.8, 0]} expr="worried" pose={hp} handItem={give >= 1 ? <Shovel /> : undefined} uid="h-38" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					<Tag f={f} t={w('038', 0.2)} x={GX + 40} y={300} text="NO QUESTIONS" c="#11142c" fg="#fff" size={28} rot={3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 039/040 attention span: 2.5 minutes (2004) → 47 seconds (today) */
const C039: React.FC<{bars?: boolean}> = ({bars}) => {
	const {f, at} = useShot();
	const w = useW();
	const cam = usePush(camOn(960, 540, 1.0), camOn(960, 530, 1.1));
	const k1 = bars ? interpolate(f, [at('040'), at('040') + 30], [0, 1], {...clamp, easing: ease}) : 0;
	const k2 = bars ? interpolate(f, [w('040', 0.5), w('040', 0.5) + 30], [0, 1], {...clamp, easing: ease}) : 0;
	return (
		<Stage cam={cam} bg="#101634" light={{x: 50, y: 20, o: 0.4, night: true}}>
			<Layer depth={1}>
				<Svg>
					{!bars ? (
						<g>
							<text x={960} y={200} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#9fd8ff" opacity={pop(f, at('039'))}>
								HOW LONG DO WE FOCUS ON ONE SCREEN?
							</text>
							{/* a little stopwatch and screens switching */}
							{[0, 1, 2, 3].map((i) => {
								const on = Math.floor(f / 12) % 4 === i;
								return (
									<g key={i} transform={`translate(${560 + i * 270},540) scale(${on ? 1.15 : 1})`}>
										<rect x={-100} y={-70} width={200} height={140} rx={14} fill={on ? '#3d6fd6' : '#1d2552'} stroke="#9fd8ff" strokeWidth={on ? 6 : 2} />
										<text y={14} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#fff">
											{['MAIL', 'CHAT', 'VIDEO', 'NEWS'][i]}
										</text>
									</g>
								);
							})}
							<Tag f={f} t={w('039', 0.45)} x={960} y={800} text="GLORIA MARK · UC IRVINE" c="#11142c" fg="#ffb547" size={36} rot={0} />
						</g>
					) : (
						<g>
							<text x={240} y={360} fontSize={44} fontFamily={FONT} fontWeight={900} fill="#9fd8ff">
								2004
							</text>
							<rect x={400} y={310} width={1050 * k1} height={70} rx={20} fill="#3fcf7a" />
							<text x={420 + 1050 * k1} y={360} fontSize={44} fontFamily={FONT} fontWeight={900} fill="#9ff0b0" opacity={k1}>
								{' '}
								2.5 min
							</text>
							<text x={240} y={560} fontSize={44} fontFamily={FONT} fontWeight={900} fill="#ff9a8a">
								TODAY
							</text>
							<rect x={400} y={510} width={1050 * 0.31 * k2} height={70} rx={20} fill="#ff6a5a" />
							<text x={420 + 1050 * 0.31 * k2} y={560} fontSize={44} fontFamily={FONT} fontWeight={900} fill="#ff9a8a" opacity={k2}>
								{' '}
								47 sec
							</text>
							<Cite text="Gloria Mark, 'Attention Span', 2023" t={f - at('040')} x={1880} y={1050} />
						</g>
					)}
				</Svg>
			</Layer>
		</Stage>
	);
};
const C039a: React.FC = () => <C039 />;
const C040: React.FC = () => <C039 bars />;

/* 041 «At Grandma's house, there's nothing to switch to. So you dig. You cook. You lose at chess. Eleven times.» */
const C041: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const c1 = w('041', 0.38);
	const c2 = w('041', 0.55);
	const part = f < c1 ? 0 : f < c2 ? 1 : 2;
	const t0 = [at('041'), c1, c2][part];
	const tt = f - t0;
	const cam = camPath(tt, [
		[0, camOn(960, 560, 1.25)],
		[80, camOn(940, 520, 1.45)],
	]);
	if (part === 0) {
		const dig = Math.abs(Math.sin(tt / 7));
		const hp: Pose = reach({...idle(gf, 2), lean: 14 * dig}, 'F', [56, -20 - 50 * (1 - dig)], 1);
		return (
			<Stage cam={cam} bg="#2a2f6a" light={{x: 80, y: 40, o: 0.5, c: '255,200,150'}}>
				<Layer depth={1.4}>
					<Garden f={gf} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<Actor who="hero" x={900} floor={FL} s={HS} facing={1} faceTurn={0.5} look={[0.6, 0.8]} mouth="smile" pose={hp} handItem={<Shovel />} uid="h-dig" />
						<HeroBadge x={900} y={badgeY(FL)} s={0.8} />
						{Array.from({length: 6}).map((_, i) => (
							<circle key={i} cx={1010 + ((tt * 3 + i * 17) % 80)} cy={880 - Math.abs(Math.sin((tt + i * 5) / 6)) * 40} r={6} fill="#4a3424" />
						))}
						<Tag f={f} t={t0 + 6} x={1260} y={380} text="DIG" c="#11142c" fg="#ffb547" size={50} rot={-4} />
					</Svg>
				</Layer>
			</Stage>
		);
	}
	if (part === 1) {
		const stir = Math.sin(tt / 4);
		const hp: Pose = reach(idle(gf, 3), 'F', [62 + 10 * stir, -70], 1);
		return (
			<Stage cam={cam} bg="#3a2a2e" light={{x: 80, y: 60, o: 0.5, c: '255,190,130'}}>
				<Layer depth={1.4}>
					<Cottage f={gf} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<rect x={900} y={740} width={300} height={20} rx={6} fill="#7a4e34" />
						<rect x={910} y={760} width={280} height={140} fill="#5a3a22" />
						<path d="M960,742 L1080,742 L1070,690 L970,690 Z" fill="#3a4060" />
						{[0, 1, 2].map((i) => (
							<circle key={i} cx={1000 + i * 20 + Math.sin((gf + i * 10) / 8) * 6} cy={670 - ((gf * 1.5 + i * 25) % 70)} r={10 + i * 3} fill="#fff" opacity={0.3} />
						))}
						<Actor who="hero" x={900} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.6, 0.8]} mouth="smile" pose={hp} handItem={<line x1={0} y1={0} x2={10} y2={60} stroke="#c98a4a" strokeWidth={5} />} uid="h-cook" />
						<HeroBadge x={900} y={badgeY(FL)} s={0.8} />
						<Tag f={f} t={t0 + 4} x={1260} y={380} text="COOK" c="#11142c" fg="#ffb547" size={50} rot={4} />
					</Svg>
				</Layer>
			</Stage>
		);
	}
	const losses = Math.min(11, Math.floor(tt / 7) + 1);
	return (
		<Stage cam={cam} bg="#3a2a2e" light={{x: 80, y: 60, o: 0.5, c: '255,190,130'}}>
			<Layer depth={1.4}>
				<Cottage f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<SeatChair x={760} facing={1} />
					<SeatChair x={1160} facing={-1} />
					<ChessTable x={960} f={gf} />
					<Actor who="hero" x={780} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.4} look={[0.6, 0.6]} expr="worried" pose={{...SIT, head: 10}} uid="h-chess" />
					<Actor who="grandma" x={1140} floor={FL} seat={SEAT} s={0.94} facing={-1} faceTurn={0.4} look={[-0.6, 0.4]} mouth="smirk" pose={reach(SIT, 'F', [70, -70], 0.7)} uid="gma-chess" />
					<HeroBadge x={780} y={SEAT - 164 - 118} s={0.8} />
					<g transform="translate(960,330)">
						<rect x={-170} y={-60} width={340} height={120} rx={14} fill="#11142c" stroke="#ff6a5a" strokeWidth={5} />
						<text y={22} textAnchor="middle" fontSize={60} fontFamily={FONT} fontWeight={900} fill="#ff6a5a">
							LOST × {losses}
						</text>
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 042 «And somewhere in week two, you notice it. The number over your head hasn't moved in nine days.» */
const C042: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const days = Math.min(9, Math.floor(interpolate(f, [w('042', 0.45), w('042', 0.85)], [0, 9], clamp)));
	const up = interpolate(f, [w('042', 0.2), w('042', 0.3)], [0, 1], clamp);
	const cam = usePush(camOn(900, 520, 1.3), camOn(900, 450, 1.75));
	return (
		<Stage cam={cam} bg="#2a2f6a" light={{x: 80, y: 40, o: 0.5, c: '255,200,150'}}>
			<Layer depth={1.4}>
				<Garden f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={900} floor={FL} s={HS} facing={1} faceTurn={0.2} look={up > 0.5 ? [0, -1] : [0.6, 0.6]} expr={up > 0.5 ? 'wide' : 'normal'} pose={{...idle(gf, 2), head: -14 * up}} uid="h-42" />
					<HeroBadge x={900} y={badgeY(FL)} s={0.8} />
					<circle cx={900} cy={badgeY(FL)} r={180 + 10 * Math.sin(f / 5)} fill="none" stroke="#9ff0b0" strokeWidth={4} opacity={0.5 * up} />
					{f > w('042', 0.45) ? <Tag f={f} t={w('042', 0.45)} x={1260} y={460} text={`${days} DAYS · +0`} c="#1d3a2a" fg="#9ff0b0" stroke="#3fcf7a" size={40} rot={4} /> : null}
					<Tag f={f} t={at('042') + 8} x={560} y={330} text="WEEK 2" c="#11142c" fg="#ffb547" size={36} rot={-4} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 043, 045, 047 by the fire */
const Fire: React.FC<{beat: '043' | '045' | '047'}> = ({beat}) => {
	const {f, gf, at} = useShot();
	const w = useW();
	const GX = 1120;
	const HX = 780;
	const flick = 0.5 + 0.5 * Math.sin(gf / 3);
	const cam =
		beat === '043'
			? usePush(camOn(1000, 560, 1.2), camOn(980, 540, 1.4))
			: beat === '045'
				? usePush(camOn(GX - 40, 610, 1.9, {farBlur: 8}), camOn(GX - 40, 600, 2.2, {farBlur: 9}))
				: camPath(f, [
						[at('047'), camOn(GX - 40, 600, 1.9, {farBlur: 8})],
						[w('047', 0.5), camOn(HX + 40, 600, 1.9, {farBlur: 8})],
						[w('047', 0.95), camOn(950, 520, 1.45)],
					]);
	const gp: Pose = beat === '045' ? reach({...SIT, head: -4}, 'F', [10, -150], env(f, at('045') + 8, 1e9, 10, 1)) : {...SIT, head: 2};
	return (
		<Stage cam={cam} bg="#2a1f22" light={{x: 85, y: 70, o: 0.55 + 0.08 * flick, c: '255,170,100'}}>
			<Layer depth={1.4}>
				<Cottage f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<SeatChair x={HX - 20} facing={1} c="#5a3a22" />
					<SeatChair x={GX + 20} facing={-1} c="#5a3a22" />
					<Actor who="hero" x={HX} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.4} look={[0.8, -0.1]} expr={beat === '045' ? 'wide' : 'normal'} mouth={beat === '045' ? 'open' : undefined} pose={{...SIT, head: 0}} uid="h-fire" />
					<Actor who="grandma" x={GX} floor={FL} seat={SEAT} s={0.94} facing={-1} faceTurn={0.4} look={[-0.6, 0]} mouth="smile" pose={gp} uid="gma-fire" />
					<HeroBadge x={HX} y={SEAT - 164 - 118} s={0.8} />
					{/* warm fire light on both faces */}
					<circle cx={1000} cy={600} r={420} fill="#ff9a4a" opacity={0.1 + 0.04 * flick} style={{filter: 'blur(60px)', mixBlendMode: 'screen'}} />
					{beat === '045' ? (
						<>
							<Tag f={f} t={at('045')} x={GX + 210} y={500} text="LOOKS 79" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={32} rot={-4} />
							<Tag f={f} t={w('045', 0.55)} x={GX + 210} y={580} text="REALLY 61" c="#1d3a2a" fg="#9ff0b0" stroke="#3fcf7a" size={40} rot={3} />
						</>
					) : null}
					{beat === '047' && f > w('047', 0.1) ? (
						<Bubble x={GX - 120} y={430} w={560} h={150} t={f - w('047', 0.1)} tail={[60, 120]}>
							<text y={-10} textAnchor="middle" fontSize={30} fontFamily={HAND} fontWeight={700} fill="#13203a">
								The days you live with your eyes up
							</text>
							<text y={30} textAnchor="middle" fontSize={30} fontFamily={HAND} fontWeight={700} fill="#13203a">
								are the only ones that feel long.
							</text>
						</Bubble>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};
const C043: React.FC = () => <Fire beat="043" />;
const C045: React.FC = () => <Fire beat="045" />;
const C047: React.FC = () => <Fire beat="047" />;

/* 044 «In nineteen seventy-two, she says, every hour of television made her one day older.» 046 she unplugs it */
const Flash72: React.FC<{off?: boolean}> = ({off}) => {
	const {f, gf, at} = useShot();
	const w = useW();
	const YX = 760;
	const young = {hair: 'bob' as const, hairColor: '#3a2418', acc: [] as never[]};
	const pull = off ? env(f, w('046', 0.3), 1e9, 10, 1) : 0;
	const dark = off ? interpolate(f, [w('046', 0.42), w('046', 0.5)], [0, 1], clamp) : 0;
	const age = off ? 0.55 : interpolate(f, [at('044'), w('044', 0.95)], [0, 0.6], clamp);
	const yrs = Math.floor(24 + (off ? 18 : 18 * (age / 0.6)));
	const cam = off ? usePush(camOn(1000, 560, 1.25), camOn(1080, 600, 1.5)) : usePush(camOn(900, 560, 1.15), camOn(860, 520, 1.4));
	const yp: Pose = off ? reach(idle(gf, 4), 'F', toLocal(1080, 860, YX + 260 * pull, FL - 157, 0.94, 1), pull) : {...SIT, head: 4};
	return (
		<>
			<Stage cam={cam} bg="#5a4020" light={{x: 70, y: 40, o: 0.5, c: '200,230,255'}}>
				<Layer depth={1.4}>
					<Room72 f={gf} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						{dark > 0 ? <rect x={990} y={360} width={300} height={240} rx={40} fill="#0b0c12" opacity={dark} /> : null}
						{!off ? <SeatChair x={YX - 20} facing={1} c="#7a3f22" /> : null}
						<Actor who="grandma" x={off ? YX + 260 * pull : YX} floor={FL} seat={off ? undefined : SEAT} s={0.94} facing={1} faceTurn={0.4} look={[0.8, -0.1]} mouth={off ? 'line' : 'open'} {...young} age={age} pose={yp} uid="young-rosa" />
						<g transform={`translate(${off ? YX + 260 * pull : YX},${(off ? FL - 157 * 0.94 : SEAT) - 164 * 0.94 - 118})`}>
							<AgeBadge x={0} y={0} value={yrs} s={0.8} label="ROSA'S BODY" c="#9ff0b0" />
						</g>
						{off ? <path d={`M1080,860 Q${1000},${900} ${940},${880 - 40 * pull}`} stroke="#1b1a26" strokeWidth={5} fill="none" /> : null}
					</Svg>
				</Layer>
			</Stage>
			<AbsoluteFill style={{pointerEvents: 'none', background: 'rgba(120,80,30,0.18)', mixBlendMode: 'multiply'}} />
			<AbsoluteFill style={{pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(30,15,0,0.6) 100%)'}} />
			<AbsoluteFill style={{pointerEvents: 'none'}}>
				<div style={{position: 'absolute', left: 70, top: 56, fontFamily: HAND, fontWeight: 700, fontSize: 80, color: '#fff4cf', textShadow: '0 4px 10px #000'}}>1972</div>
				{Array.from({length: 6}).map((_, i) => (
					<div key={i} style={{position: 'absolute', left: ((i * 337 + gf * 23) % 1920), top: 0, width: 2, height: 1080, background: 'rgba(255,255,255,0.08)'}} />
				))}
			</AbsoluteFill>
		</>
	);
};
const C044: React.FC = () => <Flash72 />;
const C046: React.FC = () => <Flash72 off />;

export const SHOTS_C: ShotDef[] = [
	{at: '037', C: C037, whip: true},
	{at: '038', C: C038},
	{at: '039', C: C039a, whip: true},
	{at: '040', C: C040},
	{at: '041', C: C041, own: true, whip: true},
	{at: '042', C: C042, whip: true},
	{at: '043', C: C043, whip: true},
	{at: '044', C: C044, whip: true},
	{at: '045', C: C045, whip: true},
	{at: '046', C: C046, whip: true},
	{at: '047', C: C047, whip: true},
];
