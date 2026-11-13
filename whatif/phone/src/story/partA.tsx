import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {Pose} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {HeroBadge, Layer, Mirror, Sleeper, Stage, Svg, camOn, clamp, ease, mixCam, usePush} from '../kit/kit';
import {Callout} from '../kit/graphics';
import {Bedroom, Blanket} from '../kit/sets';
import {Bubble, Cite, FONT, HAND, RuleCard} from '../kit/ui';
import {Onoma} from '../reference/PauseTime';
import {Bang, FL, HS, SFL, SmallPhone, StreetBG, badgeY} from './common';
import {Apartment, SEAT, Sofa} from './places';
import {Bathroom, MIRROR} from './places2';
import {Cinema, Console, PhoneLight, SchoolGate} from './placesP';

/* PART A (0:00–1:34): cold open at the school gate, the question, the rules, the birthday. */

export const useW = () => {
	const {at, end} = useShot();
	return (id: string, frac: number) => at(id) + Math.round((end(id) - at(id)) * frac);
};
export const pop = (f: number, t: number) => spring({frame: f - t, fps: 30, config: {damping: 11, stiffness: 160}});
const ease3 = (k: number) => interpolate(k, [0, 1], [0, 1], {...clamp, easing: ease});
/* camera through several framings: keys = [frame, cam] */
export const camPath = (f: number, keys: [number, ReturnType<typeof camOn>][]) => {
	if (f <= keys[0][0]) return keys[0][1];
	for (let i = 0; i + 1 < keys.length; i++) {
		const [a, ca] = keys[i];
		const [b, cb] = keys[i + 1];
		if (f <= b) return mixCam(ca, cb, ease3((f - a) / Math.max(1, b - a)));
	}
	return keys[keys.length - 1][1];
};
/* holding a phone in front of the chest, head down */
export const phonePose = (gf: number, seed = 1, down = 14): Pose => ({...reach(idle(gf, seed), 'F', [42, -100], 1), head: down});
export const Tag: React.FC<{f: number; t: number; x: number; y: number; text: string; c?: string; fg?: string; size?: number; rot?: number; stroke?: string}> = ({f, t, x, y, text, c = '#11142c', fg = '#fff', size = 40, rot = -4, stroke = '#ffd34a'}) => {
	const k = pop(f, t);
	if (f < t) return null;
	const w = text.length * size * 0.62 + 50;
	return (
		<g transform={`translate(${x},${y}) rotate(${rot}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
			<rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.9} rx={size * 0.5} fill={c} stroke={stroke} strokeWidth={4} />
			<text y={size * 0.35} textAnchor="middle" fontSize={size} fontFamily={FONT} fontWeight={900} fill={fg}>
				{text}
			</text>
		</g>
	);
};

/* ---------- 001 «You walk up to the school gate, and the new guard holds up a hand.» ---------- */
const GX = 1180; // guard
const HXG = 820; // hero stops here
const GateShot: React.FC<{beat: 'walk' | 'guard' | 'body' | 'report'}> = ({beat}) => {
	const {f, gf, at} = useShot();
	const w = useW();
	const hw = beat === 'walk' ? walkTo(f, -6, w('001', 0.7), -250, HXG, 2, 0.28) : {x: HXG, pose: idle(gf, 2), vx: 0, bob: 0, moving: false};
	const stop = beat === 'walk' ? env(f, w('001', 0.6), 1e9, 10, 1) : 1;
	const gwalk = beat === 'walk' ? walkTo(f, w('001', 0.35), w('001', 0.75), 1480, GX, 5, 0.3) : {x: GX, pose: idle(gf, 5), vx: 0, bob: 0, moving: false};
	let gp = gwalk.moving ? gwalk.pose : idle(gf, 5);
	gp = gesture('stop', gp, beat === 'walk' ? stop : beat === 'guard' ? 1 : env(f, -99, 30, 1, 14), f);
	let hp: Pose = hw.moving ? hw.pose : idle(gf, 2);
	// 004: rubs his grey hair, the knees click, the phone buzzes
	if (beat === 'report') {
		hp = gesture('scratch', hp, env(f, w('004', 0.02), w('004', 0.3), 10, 10), f);
		hp = {...hp, legF: [hp.legF[0] + 18 * env(f, w('004', 0.32), w('004', 0.55), 6, 8) * Math.abs(Math.sin(f / 3)), hp.legF[1] + 30 * env(f, w('004', 0.32), w('004', 0.55), 6, 8)]};
		const ph = env(f, w('004', 0.62), 1e9, 10, 1);
		if (ph > 0) hp = {...reach(hp, 'F', [42, -100], ph), head: 14 * ph};
	}
	if (beat === 'body') hp = gesture('touchFace', hp, env(f, at('003') + 6, 1e9, 10, 1), f);
	let cam;
	if (beat === 'walk') cam = usePush(camOn(700, 560, 1.05), camOn(960, 560, 1.2));
	else if (beat === 'guard') cam = usePush(camOn(GX - 40, 470, 1.9, {farBlur: 7}), camOn(GX - 60, 460, 2.1, {farBlur: 8}));
	else if (beat === 'body') cam = usePush(camOn(HXG + 40, 470, 1.7, {farBlur: 6}), camOn(HXG + 40, 440, 2.0, {farBlur: 7}));
	else
		cam = camPath(f, [
			[at('004'), camOn(HXG, 420, 2.3, {farBlur: 8})],
			[w('004', 0.28), camOn(HXG, 440, 2.2, {farBlur: 8})],
			[w('004', 0.36), camOn(HXG, 800, 2.0, {farBlur: 8})],
			[w('004', 0.58), camOn(HXG, 790, 2.0, {farBlur: 8})],
			[w('004', 0.68), camOn(HXG + 40, 640, 2.1, {farBlur: 8})],
		]);
	const ph = beat === 'report' ? env(f, w('004', 0.62), 1e9, 10, 1) : 0;
	return (
		<Stage cam={cam} bg="#141c44" light={{x: 20, y: 0, o: 0.45, c: '255,214,160'}}>
			<Layer depth={1.5}>
				<SchoolGate f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="guard" x={gwalk.x} floor={FL} s={1.02} facing={-1} faceTurn={0.5} look={[-0.8, 0]} expr={beat === 'guard' ? 'normal' : 'sleepy'} mouth="flat" pose={gp} vx={gwalk.vx} bob={gwalk.bob} uid="guard" />
					<Actor who="hero" x={hw.x} floor={FL} s={HS} facing={1} faceTurn={0.5} look={ph > 0.5 ? [0.3, 1] : [0.8, 0]} expr={beat === 'guard' ? 'wide' : beat === 'body' ? 'worried' : 'normal'} pose={hp} vx={hw.vx} bob={hw.bob} handItem={ph > 0.5 ? <SmallPhone /> : undefined} armOver={beat === 'body' && f > at('003') + 10} uid="h-gate" />
					{ph > 0 ? <PhoneLight pose={hp} x={HXG} floor={FL} on={ph} /> : null}
					<HeroBadge x={hw.x} y={badgeY(FL) - hw.bob} s={0.8} />
					{beat === 'guard' ? (
						<Bubble x={GX - 60} y={300} w={560} h={110} t={f - at('002')} tail={[40, 90]}>
							<text y={14} textAnchor="middle" fontSize={36} fontFamily={FONT} fontWeight={900} fill="#13203a">
								Teachers use the back, sir.
							</text>
						</Bubble>
					) : null}
					{beat === 'body' ? (
						<>
							<Tag f={f} t={at('003') + 4} x={HXG - 300} y={360} text="REAL AGE 17" c="#1d3a2a" fg="#9ff0b0" stroke="#3fcf7a" size={34} rot={-5} />
							<Tag f={f} t={w('003', 0.55)} x={HXG + 330} y={420} text="BODY 31" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={40} rot={4} />
						</>
					) : null}
					{beat === 'report' ? (
						<>
							<Callout f={f} t0={w('004', 0.08)} t1={w('004', 0.3)} from={[HXG - 10, 520]} to={[HXG - 160, 380]} text="GREY" size={30} />
							{f > w('004', 0.36) && f < w('004', 0.58) ? <Onoma x={HXG + 140} y={760} text="CLICK!" t={f - w('004', 0.36)} c="#ffd34a" size={56} /> : null}
							{f > w('004', 0.45) && f < w('004', 0.58) ? <Onoma x={HXG - 120} y={820} text="CLICK!" t={f - w('004', 0.45)} c="#ffd34a" rot={8} size={48} /> : null}
							{f > w('004', 0.62) ? <Bang f={f} t={w('004', 0.62)} x={HXG + 180} y={600} text="BZZT" c="#9fd8ff" /> : null}
						</>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};
const A001: React.FC = () => <GateShot beat="walk" />;
const A002: React.FC = () => <GateShot beat="guard" />;
const A003: React.FC = () => <GateShot beat="body" />;
const A004: React.FC = () => <GateShot beat="report" />;

/* the weekly screen-time report on a big phone */
export const ScreenTime: React.FC<{x: number; y: number; s?: number; t: number; hours: string; up: string}> = ({x, y, s = 1, t, hours, up}) => {
	const bars = [7.5, 9, 10.5, 8, 11, 12, 11.5];
	return (
		<g transform={`translate(${x},${y}) scale(${s})`}>
			<rect x={-180} y={-330} width={360} height={660} rx={48} fill="#000" opacity={0.35} transform="translate(14,20)" style={{filter: 'blur(14px)'}} />
			<rect x={-180} y={-330} width={360} height={660} rx={48} fill="#15161d" />
			<rect x={-164} y={-314} width={328} height={628} rx={36} fill="#f4f6fb" />
			<text x={-140} y={-240} fontSize={26} fontFamily={FONT} fontWeight={800} fill="#5a6078">
				Weekly Report
			</text>
			<text x={-140} y={-190} fontSize={24} fontFamily={FONT} fill="#8a90a6">
				Daily average
			</text>
			<text x={-140} y={-120} fontSize={66} fontFamily={FONT} fontWeight={900} fill="#13203a">
				{hours}
			</text>
			<text x={-140} y={-76} fontSize={28} fontFamily={FONT} fontWeight={900} fill="#d23b3b">
				{up}
			</text>
			{bars.map((b, i) => {
				const k = interpolate(t, [6 + i * 3, 18 + i * 3], [0, 1], {...clamp, easing: ease});
				const h = b * 18 * k;
				return <rect key={i} x={-140 + i * 42} y={170 - h} width={30} height={h} rx={6} fill={b > 10 ? '#e4473c' : '#3d6fd6'} />;
			})}
			{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
				<text key={i} x={-125 + i * 42} y={204} textAnchor="middle" fontSize={20} fontFamily={FONT} fill="#8a90a6">
					{d}
				</text>
			))}
		</g>
	);
};
/* 005 «Ten hours a day. Up twelve percent.» */
const A005: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = usePush(camOn(1000, 540, 1.0, {farBlur: 10}), camOn(1060, 520, 1.2, {farBlur: 12}));
	return (
		<Stage cam={cam} bg="#141c44" light={{x: 60, y: 60, o: 0.4, c: '190,220,255'}}>
			<Layer depth={1.5}>
				<SchoolGate f={gf} />
			</Layer>
			<Layer depth={1} sharp>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1400} fill="#05060f" opacity={0.45} />
					<g transform={`rotate(${-4 + Math.sin(f / 30) * 1.5} 1060 540)`}>
						<ScreenTime x={1060} y={540} s={1.3} t={f - at('005') + 10} hours="10h 02m" up="▲ 12% from last week" />
					</g>
					<circle cx={1060} cy={540} r={420} fill="#7cc4ff" opacity={0.08} style={{filter: 'blur(60px)'}} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 006 «So what if every hour on your phone aged you one day?» */
const TITLE = ['WHAT IF', 'EVERY HOUR', 'ON YOUR PHONE', 'AGED YOU', 'ONE DAY?'];
const A006: React.FC = () => {
	const {f, gf, at, end} = useShot();
	const {fps} = useVideoConfig();
	const HX = 960;
	const hp = phonePose(gf, 2, 10);
	const cam = usePush(camOn(960, 620, 1.35), camOn(960, 560, 1.1));
	const len = end('006') - at('006');
	return (
		<>
			<Stage cam={cam} bg="#0b1030" light={{x: 50, y: 60, o: 0.35, night: true}}>
				<StreetBG gf={gf} />
				<Layer depth={1}>
					<Svg>
						<Actor who="hero" x={HX} floor={SFL} s={HS} facing={1} faceTurn={0.1} look={[0, 1]} pose={hp} handItem={<SmallPhone />} uid="h-title" />
						<PhoneLight pose={hp} x={HX} floor={SFL} />
						<HeroBadge x={HX} y={badgeY(SFL)} s={0.8} />
					</Svg>
				</Layer>
			</Stage>
			<AbsoluteFill style={{pointerEvents: 'none', alignItems: 'center', paddingTop: 40}}>
				<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', width: 1400, gap: '0 22px'}}>
					{TITLE.map((wd, i) => {
						const t0 = at('006') + (i / TITLE.length) * len * 0.9;
						const k = spring({frame: f - t0, fps, config: {damping: 12, stiffness: 170}});
						const hot = wd.includes('HOUR') || wd.includes('DAY');
						return (
							<span key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: 92, color: hot ? '#ffb547' : '#fff', WebkitTextStroke: '3px #11142c', textShadow: '0 6px 0 #11142c, 0 0 30px rgba(0,0,0,0.6)', opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 60}px) scale(${0.6 + 0.4 * k}) rotate(${(1 - k) * (i % 2 ? 8 : -8)}deg)`, display: 'inline-block', lineHeight: 1.08}}>
								{wd}
							</span>
						);
					})}
				</div>
			</AbsoluteFill>
		</>
	);
};

/* 007 «Not your battery. Not your eyes. Your whole body. One hour on a screen, one day older.» */
const Icon: React.FC<{kind: 'battery' | 'eye' | 'body'}> = ({kind}) => {
	if (kind === 'battery')
		return (
			<g>
				<rect x={-70} y={-36} width={130} height={72} rx={12} fill="none" stroke="#fff" strokeWidth={8} />
				<rect x={62} y={-14} width={12} height={28} rx={4} fill="#fff" />
				<rect x={-60} y={-26} width={40} height={52} rx={6} fill="#ff6a5a" />
			</g>
		);
	if (kind === 'eye')
		return (
			<g>
				<path d="M-80,0 Q0,-60 80,0 Q0,60 -80,0 Z" fill="none" stroke="#fff" strokeWidth={8} />
				<circle r={22} fill="#fff" />
			</g>
		);
	return (
		<g>
			<circle cy={-50} r={26} fill="#ffb547" />
			<rect x={-28} y={-20} width={56} height={80} rx={22} fill="#ffb547" />
		</g>
	);
};
const A007: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const items: [('battery' | 'eye' | 'body'), number, boolean][] = [
		['battery', 0.0, true],
		['eye', 0.12, true],
		['body', 0.26, false],
	];
	const eq = pop(f, w('007', 0.5));
	const cam = usePush(camOn(960, 540, 1.0), camOn(960, 520, 1.12));
	const HX = 300;
	return (
		<Stage cam={cam} bg="#101634" light={{x: 50, y: 10, o: 0.45, night: true}}>
			<Layer depth={1}>
				<Svg>
					<polygon points="230,-200 370,-200 520,900 80,900" fill="#fff4cf" opacity={0.08} />
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.3} look={[0.8, -0.2]} pose={gesture('presentF', idle(gf, 3), 1, f)} uid="h-rule" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					{items.map(([k, t, cross], i) => {
						const kk = pop(f, w('007', t));
						const x = 760 + i * 300;
						const strike = cross ? interpolate(f, [w('007', t) + 10, w('007', t) + 18], [0, 1], clamp) : 0;
						return (
							<g key={k} transform={`translate(${x},300) scale(${kk})`} opacity={Math.min(1, kk * 1.5)}>
								<circle r={110} fill={cross ? '#1d2552' : '#3a2a1a'} stroke={cross ? '#5a6078' : '#ffb547'} strokeWidth={6} />
								<Icon kind={k} />
								{cross ? <line x1={-80} y1={-80} x2={-80 + 160 * strike} y2={-80 + 160 * strike} stroke="#ff6a5a" strokeWidth={14} strokeLinecap="round" /> : null}
								<text y={160} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill={cross ? '#8a90a6' : '#ffb547'}>
									{['BATTERY', 'EYES', 'WHOLE BODY'][i]}
								</text>
							</g>
						);
					})}
					<g transform={`translate(1060,700) scale(${eq})`} opacity={Math.min(1, eq * 1.5)}>
						<rect x={-430} y={-70} width={860} height={140} rx={30} fill="#11142c" stroke="#ffb547" strokeWidth={6} />
						<text y={22} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#fff">
							1 HOUR <tspan fill="#ffb547">=</tspan> 1 DAY OLDER
						</text>
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 008 «And it only counts the screen in your own hands. Remember that. It matters later.» */
const A008: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 760;
	const KX = 1180;
	const hp = phonePose(gf, 2);
	const kp = phonePose(gf, 7, 12);
	const pin = pop(f, w('008', 0.55));
	const cam = usePush(camOn(960, 540, 1.25), camOn(820, 520, 1.5));
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 60, y: 20, o: 0.35, night: true}}>
			<StreetBG gf={gf} />
			<Layer depth={1}>
				<Svg>
					<Actor who="kai" x={KX} floor={SFL} s={0.92} facing={-1} faceTurn={0.4} look={[-0.3, 1]} pose={kp} handItem={<SmallPhone />} uid="kai-8" />
					<PhoneLight pose={kp} x={KX} floor={SFL} s={0.92} facing={-1} />
					<Actor who="hero" x={HX} floor={SFL} s={HS} facing={1} faceTurn={0.4} look={[0.3, 1]} pose={hp} handItem={<SmallPhone />} uid="h-8" />
					<PhoneLight pose={hp} x={HX} floor={SFL} />
					{/* the hands that count glow */}
					<circle cx={HX + 44} cy={SFL - 157 - 100} r={40 + 6 * Math.sin(f / 4)} fill="none" stroke="#ffb547" strokeWidth={6} opacity={env(f, at('008') + 6, 1e9, 10, 1)} />
					<HeroBadge x={HX} y={badgeY(SFL)} s={0.8} />
					<Tag f={f} t={at('008') + 20} x={HX + 40} y={SFL - 157 - 220} text="ONLY YOUR HANDS" c="#3a2a1a" fg="#ffb547" stroke="#ffb547" size={30} rot={-3} />
					<g transform={`translate(1240,300) rotate(6) scale(${pin})`} opacity={Math.min(1, pin * 1.5)}>
						<rect x={-200} y={-60} width={400} height={120} rx={10} fill="#fff4cf" />
						<circle cx={0} cy={-56} r={14} fill="#d23b3b" />
						<text y={20} textAnchor="middle" fontSize={50} fontFamily={HAND} fontWeight={700} fill="#13203a">
							remember this!
						</text>
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 009 «Let's go back to where it started. Your sixteenth birthday.» — rewind */
const A009: React.FC = () => {
	const {f, gf, dur} = useShot();
	const w = useW();
	const cam = usePush(camOn(900, 520, 1.15), camOn(900, 480, 1.35));
	const tag = pop(f, w('009', 0.55));
	return (
		<>
			<Stage cam={cam} bg="#101634" light={{x: 50, y: 30, o: 0.4, night: true}}>
				<StreetBG gf={-gf * 3} />
				<Layer depth={1}>
					<Svg>
						<Actor who="hero" x={900} floor={SFL} s={HS} facing={1} faceTurn={0.2} look={[0, -0.6]} expr="wide" pose={{...idle(gf, 3), head: -10}} uid="h-rw" />
						<HeroBadge x={900} y={badgeY(SFL)} s={0.8} />
					</Svg>
				</Layer>
			</Stage>
			<AbsoluteFill style={{pointerEvents: 'none'}}>
				<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 2px, rgba(0,0,0,0) 2px 5px)'}} />
				<div style={{position: 'absolute', left: 0, right: 0, top: ((f * 23) % 1300) - 120, height: 70, background: 'rgba(255,255,255,0.07)'}} />
				<div style={{position: 'absolute', left: 70, top: 56, fontFamily: FONT, fontWeight: 900, fontSize: 64, color: '#fff', textShadow: '3px 0 #ff4f8b, -3px 0 #3fe0e8', opacity: Math.floor(f / 10) % 2 ? 1 : 0.35}}>◀◀ REWIND</div>
				<div style={{position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', opacity: Math.min(1, tag * 1.4), transform: `scale(${0.7 + 0.3 * tag})`}}>
					<span style={{fontFamily: FONT, fontWeight: 900, fontSize: 60, color: '#ffb547', background: 'rgba(14,16,36,0.85)', border: '4px solid #ffb547', borderRadius: 20, padding: '10px 30px'}}>16th BIRTHDAY</span>
				</div>
				<AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [dur - 6, dur], [0, 0.5], clamp)}} />
			</AbsoluteFill>
		</>
	);
};

/* 010 «That night you scroll in bed until three in the morning…» */
const A010: React.FC = () => {
	const {f, gf, at, end} = useShot();
	const w = useW();
	const len = end('010') - at('010');
	const mins = Math.floor(interpolate(f, [at('010'), at('010') + len * 0.4], [0, 182], clamp));
	const hh = (23 + Math.floor((58 + mins) / 60)) % 24;
	const mm = (58 + mins) % 60;
	const clock = `${hh % 12 === 0 ? 12 : hh % 12}:${String(mm).padStart(2, '0')} ${hh >= 12 && hh < 24 ? 'PM' : 'AM'}`;
	const clips = [
		['DANCE #4471', '#e0607a', 0.42],
		['MEME', '#3fcf7a', 0.55],
		['PRESSURE WASHING', '#3d6fd6', 0.68],
	] as const;
	const cam = usePush(camOn(1640, 560, 1.35), camOn(1640, 600, 1.75));
	return (
		<Stage cam={cam} bg="#1d2550" light={{x: 80, y: 30, o: 0.3, night: true}}>
			<Layer depth={1.3}>
				<Bedroom night f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1400} fill="#05060f" opacity={0.35} />
					<Sleeper x={1640} y={668} s={0.9} expr="normal" />
					<Blanket night f={gf} />
					{/* the phone above the face, its light on him */}
					<g transform={`translate(1790,${560 + Math.sin(f / 20) * 4}) rotate(84)`}>
						<rect x={-20} y={-34} width={40} height={68} rx={8} fill="#15161d" />
						<rect x={-16} y={-30} width={32} height={60} rx={5} fill="#bfe3ff" />
					</g>
					<circle cx={1790} cy={600} r={160} fill="#7cc4ff" opacity={0.25 + 0.05 * Math.sin(f / 2)} style={{filter: 'blur(30px)', mixBlendMode: 'screen'}} />
					<HeroBadge x={1700} y={460} s={0.8} />
					<g transform="translate(1480,330)">
						<rect x={-150} y={-46} width={300} height={92} rx={16} fill="#11142c" stroke="#ff4a4a" strokeWidth={4} />
						<text y={20} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#ff6a5a">
							{clock}
						</text>
					</g>
					{clips.map(([t, c, k], i) => {
						const kk = pop(f, w('010', k));
						return (
							<g key={t} transform={`translate(${1480 + i * 40},${250 - i * 60}) rotate(${-6 + i * 6}) scale(${kk})`} opacity={Math.min(1, kk * 1.4) * (f < w('010', k) + 50 ? 1 : 0.4)}>
								<rect x={-130} y={-34} width={260} height={68} rx={12} fill={c} />
								<text y={12} textAnchor="middle" fontSize={26} fontFamily={FONT} fontWeight={900} fill="#fff">
									{t}
								</text>
							</g>
						);
					})}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 011 «In the morning, the number floating over your head says sixteen years and five days.» + 013 stubble */
const PLANE = 990;
const MirrorShot: React.FC<{line: '011' | '013' | '035'}> = ({line}) => {
	const {f, gf, at} = useShot();
	const w = useW();
	const hx = 800;
	const up = interpolate(f, [w(line, 0.2), w(line, 0.3)], [0, 1], {...clamp, easing: ease});
	let hp: Pose = {...idle(gf, 2), head: -12 * up};
	if (line === '011') hp = gesture('rubChin', hp, env(f, at('011'), w('011', 0.18), 8, 8), f);
	if (line === '013') hp = gesture('touchFace', hp, env(f, at('013') + 6, 1e9, 10, 1), f);
	if (line === '035') hp = gesture('facepalm', hp, env(f, w('035', 0.6), 1e9, 10, 1), f);
	const rx = 2 * PLANE - hx;
	const stub = line === '013' ? 0.35 : undefined;
	const cam = line === '013' ? usePush(camOn(PLANE + 180, 470, 2.1, {farBlur: 8}), camOn(PLANE + 180, 460, 2.35, {farBlur: 9})) : usePush(camOn(920, 520, 1.3), camOn(960, 480, 1.6));
	return (
		<Stage cam={cam} bg="#1f3a4a" light={{x: 60, y: 10, o: 0.45, c: '255,240,200'}}>
			<Layer depth={1.4}>
				<Bathroom f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Mirror x={MIRROR.x} y={MIRROR.y} w={MIRROR.w} h={MIRROR.h} id={'bm' + line}>
						<Actor who="hero" x={rx} floor={FL} s={HS} facing={-1} faceTurn={0.15} look={up > 0.5 ? [0, -1] : [-0.3, 0]} expr={line === '013' ? 'wide' : 'sleepy'} pose={hp} age={stub} shadow={false} uid="h-refl" armOver={line !== '011'} />
						<HeroBadge x={rx} y={badgeY(FL)} s={0.8} />
					</Mirror>
					<Actor who="hero" x={hx} floor={FL} s={HS} facing={1} faceTurn={0.5} look={up > 0.5 ? [0.4, -1] : [0.6, 0.1]} expr={line === '013' ? 'wide' : line === '035' ? 'sad' : 'sleepy'} pose={hp} age={stub} armOver={line !== '011'} uid="h-bath" />
					<HeroBadge x={hx} y={badgeY(FL)} s={0.8} />
					{line === '013' ? <Callout f={f} t0={w('013', 0.3)} t1={1e9} from={[rx + 10, FL - 157 - 164 + 22]} to={[rx + 170, FL - 157 - 164 + 120]} text="STUBBLE?!" size={28} c="#ff6a5a" /> : null}
					{line === '035' ? <Tag f={f} t={w('035', 0.4)} x={PLANE + 200} y={300} text="WORST APP: MIRROR" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={30} rot={3} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};
const A011: React.FC = () => <MirrorShot line="011" />;
const A013: React.FC = () => <MirrorShot line="013" />;
export const A035: React.FC = () => <MirrorShot line="035" />;

/* 012 «…the weekend gaming with your best friend Kai. Twenty hours.» */
const A012: React.FC = () => {
	const {f, gf, at, end} = useShot();
	const len = end('012') - at('012');
	const hrs = Math.floor(interpolate(f, [at('012') + len * 0.5, end('012')], [0, 20], clamp));
	const day = 0.5 + 0.5 * Math.sin(f / 18);
	const hp: Pose = {...SIT, armF: [40, 80], armB: [30, 80], head: 10};
	const kp: Pose = {...SIT, armF: [40, 80], armB: [30, 80], head: 10};
	const cam = usePush(camOn(900, 600, 1.25), camOn(860, 640, 1.55));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 70, y: 40, o: 0.35, night: true}}>
			<Layer depth={1.5}>
				<Apartment f={gf} page={1} sofa={false} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<rect x={1196} y={176} width={488} height={408} fill="#ffcf7a" opacity={0.25 * day} />
					<Sofa />
					<Actor who="kai" x={940} floor={FL} seat={SEAT} s={0.92} facing={1} faceTurn={0.2} look={[0.3, 0.8]} mouth="open" pose={kp} handItem={<Console />} uid="kai-g" />
					<Actor who="hero" x={720} floor={FL} seat={SEAT} s={HS} facing={1} faceTurn={0.2} look={[0.3, 0.8]} pose={hp} handItem={<Console />} uid="h-game" />
					<HeroBadge x={720} y={SEAT - 164 - 118} s={0.8} />
					{/* pizza boxes pile up */}
					{Array.from({length: Math.min(5, Math.floor((f - at('012')) / 25))}).map((_, i) => (
						<rect key={i} x={1120} y={880 - i * 16} width={140} height={14} rx={3} fill="#c98a4a" stroke="#7a4e34" strokeWidth={2} />
					))}
					<Tag f={f} t={at('012') + Math.round(len * 0.5)} x={840} y={440} text={`${hrs} HOURS`} c="#11142c" fg="#ffb547" size={44} rot={-3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 014 «Kai is on his phone just as much as you, and Kai still looks twelve.» */
const A014: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const kp = phonePose(gf, 6, 12);
	const cam = usePush(camOn(1080, 560, 1.35), camOn(1120, 540, 1.6));
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 60, y: 20, o: 0.35, night: true}}>
			<StreetBG gf={gf} />
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={820} floor={SFL} s={HS} facing={1} faceTurn={0.5} look={[0.8, 0.2]} expr="worried" age={0.3} pose={gesture('armsCrossed', idle(gf, 2), 1, f)} uid="h-14" />
					<HeroBadge x={820} y={badgeY(SFL)} s={0.8} />
					<Actor who="kai" x={1200} floor={SFL} s={0.86} facing={-1} faceTurn={0.4} look={[-0.2, 1]} mouth="smile" pose={kp} handItem={<SmallPhone />} uid="kai-14" />
					<PhoneLight pose={kp} x={1200} floor={SFL} s={0.86} facing={-1} />
					<Tag f={f} t={w('014', 0.6)} x={1260} y={SFL - 157 * 0.86 - 164 * 0.86 - 90} text="STILL LOOKS 12" c="#1d3a2a" fg="#9ff0b0" stroke="#3fcf7a" size={30} rot={3} />
					{f > at('014') ? <Bang f={f} t={w('014', 0.3)} x={1330} y={700} text="lol" c="#9fd8ff" /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 015 «So you test it. Kai holds your phone and reads every message out loud. The number doesn't move.» */
const A015: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const kp = phonePose(gf, 6, 8);
	const check = f > w('015', 0.75);
	const cam = usePush(camOn(960, 560, 1.25), camOn(860, 500, 1.5));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.5}>
				<Apartment f={gf} page={1} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={760} floor={FL} s={HS} facing={1} faceTurn={0.4} look={check ? [0.1, -1] : [0.8, 0]} expr={check ? 'wide' : 'normal'} pose={{...gesture('rubChin', idle(gf, 2), check ? 0 : 1, f), head: check ? -14 : 0}} uid="h-15" />
					<HeroBadge x={760} y={badgeY(FL)} s={0.8} />
					<Actor who="kai" x={1120} floor={FL} s={0.9} facing={-1} faceTurn={0.4} look={[-0.2, 1]} pose={kp} handItem={<SmallPhone />} uid="kai-15" />
					<PhoneLight pose={kp} x={1120} floor={FL} s={0.9} facing={-1} />
					{f > w('015', 0.3) && f < w('015', 0.72) ? (
						<Bubble x={1180} y={330} w={480} h={110} t={f - w('015', 0.3)} tail={[-60, 90]}>
							<text y={14} textAnchor="middle" fontSize={32} fontFamily={FONT} fontWeight={900} fill="#13203a">
								"Mom: dinner is ready!!"
							</text>
						</Bubble>
					) : null}
					{check ? <Tag f={f} t={w('015', 0.78)} x={760 - 280} y={badgeY(FL) + 40} text="+0 days" c="#1d3a2a" fg="#9ff0b0" stroke="#3fcf7a" size={34} rot={-4} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 016 rules on the chalkboard: rule one, then rule two */
const A016: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const second = f >= w('016', 0.5);
	return second ? (
		<RuleCard n="#2" title="RULE" text="Only the screen in YOUR hands counts" t={f - w('016', 0.5) + 6} />
	) : (
		<RuleCard n="#1" title="RULE" text="1 hour on a screen = 1 day on your body" t={f - w('016', 0) + 6} />
	);
};

/* 017 «American teenagers average about eight and a half hours of screen entertainment a day.» */
const A017: React.FC = () => {
	const {f, at} = useShot();
	const w = useW();
	const k = interpolate(f, [w('017', 0.35), w('017', 0.8)], [0, 8.5 / 24], {...clamp, easing: ease});
	const cam = usePush(camOn(960, 540, 1.0), camOn(960, 530, 1.1));
	const R = 250;
	const a = k * Math.PI * 2;
	const arc = `M0,0 L0,${-R} A${R},${R} 0 ${a > Math.PI ? 1 : 0} 1 ${Math.sin(a) * R},${-Math.cos(a) * R} Z`;
	return (
		<Stage cam={cam} bg="#101634" light={{x: 50, y: 20, o: 0.4, night: true}}>
			<Layer depth={1}>
				<Svg>
					<text x={960} y={140} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#9fd8ff" opacity={pop(f, at('017'))}>
						A TEEN'S DAY (24 HOURS)
					</text>
					<g transform="translate(700,560)">
						<circle r={R} fill="#1d2552" stroke="#3a4680" strokeWidth={6} />
						<path d={arc} fill="#e4473c" />
						{Array.from({length: 24}).map((_, i) => (
							<line key={i} x1={Math.sin((i / 24) * Math.PI * 2) * (R - 16)} y1={-Math.cos((i / 24) * Math.PI * 2) * (R - 16)} x2={Math.sin((i / 24) * Math.PI * 2) * R} y2={-Math.cos((i / 24) * Math.PI * 2) * R} stroke="#5a6078" strokeWidth={3} />
						))}
						<circle r={70} fill="#101634" />
					</g>
					<g transform="translate(1340,520)">
						<text textAnchor="middle" fontSize={150} fontFamily={FONT} fontWeight={900} fill="#ff6a5a">
							{(k * 24).toFixed(1)}h
						</text>
						<text y={80} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={800} fill="#fff">
							of screen fun
						</text>
						<text y={140} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={800} fill="#fff">
							every day
						</text>
					</g>
					<Cite text="Common Sense Media census, 2021 (teens 13–18)" t={f - at('017')} x={1880} y={1050} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 018 «That's eight and a half days of aging, every single day. Almost nine years for every year you live.» */
const A018: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const cam = usePush(camOn(960, 540, 1.05), camOn(960, 520, 1.18));
	const eq = pop(f, w('018', 0.55));
	return (
		<Stage cam={cam} bg="#101634" light={{x: 50, y: 20, o: 0.4, night: true}}>
			<Layer depth={1}>
				<Svg>
					{/* calendar pages flying off */}
					{Array.from({length: 12}).map((_, i) => {
						const t0 = at('018') + i * 6;
						const p = interpolate(f, [t0, t0 + 30], [0, 1], clamp);
						if (p <= 0) return null;
						return (
							<g key={i} transform={`translate(${520 + p * 900 + i * 10},${420 - p * 300 + Math.sin(i) * 40}) rotate(${p * 160})`} opacity={1 - p}>
								<rect x={-70} y={-80} width={140} height={160} rx={8} fill="#f4efe2" />
								<rect x={-70} y={-80} width={140} height={36} rx={8} fill="#d23b3b" />
								<text y={40} textAnchor="middle" fontSize={56} fontFamily={FONT} fontWeight={900} fill="#13203a">
									{i + 1}
								</text>
							</g>
						);
					})}
					<g transform="translate(560,440) scale(1.7)">
						<rect x={-90} y={-100} width={180} height={200} rx={10} fill="#f4efe2" />
						<rect x={-90} y={-100} width={180} height={44} rx={10} fill="#d23b3b" />
						<text y={-68} textAnchor="middle" fontSize={26} fontFamily={FONT} fontWeight={900} fill="#fff">
							TODAY
						</text>
						<text y={50} textAnchor="middle" fontSize={84} fontFamily={FONT} fontWeight={900} fill="#13203a">
							+8.5
						</text>
						<text y={88} textAnchor="middle" fontSize={24} fontFamily={FONT} fontWeight={800} fill="#5a6078">
							days older
						</text>
					</g>
					<g transform={`translate(1180,780) scale(${eq})`} opacity={Math.min(1, eq * 1.5)}>
						<rect x={-460} y={-70} width={920} height={140} rx={30} fill="#11142c" stroke="#ff6a5a" strokeWidth={6} />
						<text y={22} textAnchor="middle" fontSize={58} fontFamily={FONT} fontWeight={900} fill="#fff">
							1 YEAR LIVED = <tspan fill="#ff6a5a">8.5 YEARS</tspan> OLDER
						</text>
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 019 «At your pace, you graduate at thirty-six. By twenty-one, you'd get the senior discount.» */
const A019: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const second = f >= w('019', 0.5);
	const HX = 760;
	const cam = second ? usePush(camOn(1000, 560, 1.2), camOn(1060, 540, 1.4)) : usePush(camOn(820, 520, 1.5), camOn(820, 480, 1.75));
	const Cap = () => (
		<g transform="translate(0,-60)">
			<path d="M-60,0 L0,-24 L60,0 L0,24 Z" fill="#1b1a26" />
			<line x1={50} y1={2} x2={58} y2={40} stroke="#ffd34a" strokeWidth={4} />
		</g>
	);
	if (!second)
		return (
			<Stage cam={cam} bg="#141c44" light={{x: 20, y: 0, o: 0.45, c: '255,214,160'}}>
				<Layer depth={1.5}>
					<SchoolGate f={gf} />
				</Layer>
				<Layer depth={1}>
					<Svg>
						<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.2} look={[0.2, 0]} mouth="smile" age={0.85} pose={gesture('wave', idle(gf, 2), 1, f)} handItem={undefined} uid="h-grad" />
						<g transform={`translate(${HX + 12},${FL - 157 - 164 - 50})`}>
							<Cap />
						</g>
						<Tag f={f} t={w('019', 0.12)} x={HX + 330} y={360} text="GRADUATE AT 36" c="#11142c" fg="#ffb547" size={40} rot={4} />
						<Tag f={f} t={w('019', 0.02)} x={HX - 250} y={300} text="CLASS OF '28" c="#3a1d2a" fg="#fff" size={30} rot={-6} stroke="#ff6a5a" />
					</Svg>
				</Layer>
			</Stage>
		);
	return (
		<Stage cam={cam} bg="#2a1030" light={{x: 50, y: 0, o: 0.45, c: '255,200,220'}}>
			<Layer depth={1.4}>
				<Cinema f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<rect x={1120} y={712} width={600} height={22} rx={6} fill="#c9ccd6" />
					<rect x={1130} y={734} width={580} height={200} fill="#5a2a3a" />
					<Actor who="waiter" x={1480} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.6, 0.2]} mouth="smile" pose={idle(gf, 9)} uid="cashier" />
					<Actor who="hero" x={1000} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0]} mouth="smirk" age={1} pose={gesture('presentF', idle(gf, 3), 1, f)} uid="h-senior" />
					<g transform="translate(1380,560)">
						<rect x={-140} y={-50} width={280} height={100} rx={12} fill="#fff4cf" />
						<text y={-6} textAnchor="middle" fontSize={26} fontFamily={FONT} fontWeight={900} fill="#13203a">
							SENIOR DISCOUNT
						</text>
						<text y={30} textAnchor="middle" fontSize={30} fontFamily={FONT} fontWeight={900} fill="#d23b3b">
							65+ · −50%
						</text>
					</g>
					<Tag f={f} t={w('019', 0.62)} x={760} y={330} text="REAL AGE: 21" c="#11142c" fg="#9fd8ff" size={34} rot={-4} stroke="#9fd8ff" />
				</Svg>
			</Layer>
		</Stage>
	);
};

export const SHOTS_A: ShotDef[] = [
	{at: '001', C: A001},
	{at: '002', C: A002},
	{at: '003', C: A003},
	{at: '004', C: A004},
	{at: '005', C: A005},
	{at: '006', C: A006, whip: true},
	{at: '007', C: A007, whip: true},
	{at: '008', C: A008, whip: true},
	{at: '009', C: A009, whip: true},
	{at: '010', C: A010, whip: true},
	{at: '011', C: A011, whip: true},
	{at: '012', C: A012, whip: true},
	{at: '013', C: A013, whip: true},
	{at: '014', C: A014, whip: true},
	{at: '015', C: A015, whip: true},
	{at: '016', C: A016, whip: true},
	{at: '017', C: A017, whip: true},
	{at: '018', C: A018},
	{at: '019', C: A019, whip: true},
];
