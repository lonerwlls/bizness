import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Pose} from '../engine/Stickman';
import {env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {HeroBadge, Layer, Stage, Svg, camOn, clamp, ease, usePush} from '../kit/kit';
import {Bubble, Cite, FONT} from '../kit/ui';
import {FL, HS, SFL, SmallPhone, StreetBG, badgeY} from './common';
import {PhoneLight, SchoolGate} from './placesP';
import {ScreenTime, Tag, camPath, phonePose, pop, useW} from './partA';

/* PART E (5:27–6:15): the real numbers, the mirror ending at the gate, the question. */

/* 061 «Here's the real part. Your phone can't age your face.» */
const E061: React.FC = () => {
	const {f, gf, at} = useShot();
	const HX = 960;
	const hp = phonePose(gf, 2, 8);
	const stamp = pop(f, at('061') + 10);
	const cam = usePush(camOn(960, 520, 1.5), camOn(960, 480, 1.8));
	return (
		<Stage cam={cam} bg="#0b0e22" light={{x: 50, y: 0, o: 0.5, c: '255,240,200'}}>
			<Layer depth={1}>
				<Svg>
					<polygon points="890,-200 1030,-200 1260,900 660,900" fill="#fff4cf" opacity={0.1} />
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.05} look={[0, 0.8]} age={0} pose={hp} handItem={<SmallPhone />} uid="h-61" />
					<PhoneLight pose={hp} x={HX} floor={FL} />
					<g transform={`translate(${HX + 290},${420}) rotate(-10) scale(${1 + (1 - Math.min(1, stamp)) * 1.4})`} opacity={Math.min(1, stamp * 1.5)}>
						<rect x={-170} y={-50} width={340} height={100} rx={10} fill="none" stroke="#3fcf7a" strokeWidth={8} />
						<text y={18} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#3fcf7a">
							REAL LIFE
						</text>
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 062 «But the average American spends around four and a half hours a day on their phone.» */
const E062: React.FC = () => {
	const {f, gf, at} = useShot();
	const cam = usePush(camOn(960, 540, 1.0, {farBlur: 10}), camOn(1000, 520, 1.15, {farBlur: 12}));
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 50, y: 50, o: 0.4, c: '190,220,255'}}>
			<StreetBG gf={gf} />
			<Layer depth={1} sharp>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1400} fill="#05060f" opacity={0.45} />
					<g transform={`rotate(${3 + Math.sin(f / 30)} 1000 540)`}>
						<ScreenTime x={1000} y={540} s={1.25} t={f - at('062') + 10} hours="4h 30m" up="average American adult" />
					</g>
					<Cite text="Phone-use surveys, 2023–2024 (estimate)" t={f - at('062')} x={1880} y={1050} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 063 «From age ten to eighty, that's about thirteen years of your life. Awake. Looking down.» */
const E063: React.FC = () => {
	const {f, at} = useShot();
	const w = useW();
	const k = interpolate(f, [at('063') + 10, w('063', 0.55)], [0, 1], {...clamp, easing: ease});
	const cam = usePush(camOn(960, 540, 1.0), camOn(960, 530, 1.12));
	const X0 = 260;
	const W = 1400;
	return (
		<Stage cam={cam} bg="#101634" light={{x: 50, y: 20, o: 0.4, night: true}}>
			<Layer depth={1}>
				<Svg>
					<text x={960} y={200} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#9fd8ff" opacity={pop(f, at('063'))}>
						YOUR LIFE, AGE 10 → 80
					</text>
					<rect x={X0} y={420} width={W} height={120} rx={20} fill="#1d2552" />
					{Array.from({length: 70}).map((_, i) => {
						const on = i / 70 < k;
						const phone = on && i % 70 < 70 * 0.188 * 0 + 70 && (i * 7) % 37 < 7;
						return <rect key={i} x={X0 + 6 + i * (W / 70)} y={430} width={W / 70 - 4} height={100} rx={3} fill={phone ? '#e4473c' : on ? '#3a5a8a' : '#1d2552'} />;
					})}
					<text x={X0} y={600} fontSize={34} fontFamily={FONT} fontWeight={800} fill="#fff">
						10
					</text>
					<text x={X0 + W} y={600} textAnchor="end" fontSize={34} fontFamily={FONT} fontWeight={800} fill="#fff">
						80
					</text>
					<Tag f={f} t={w('063', 0.6)} x={960} y={760} text="≈ 13 YEARS ON A PHONE" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={50} rot={-2} />
					<Cite text="4.5 h/day × 70 years ≈ 13 years" t={f - w('063', 0.6)} x={1880} y={1050} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 064 «Nobody gives those years back. You just get to choose what the next ones look like.» — eyes up at the stars */
const E064: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 900;
	const up = interpolate(f, [w('064', 0.45), w('064', 0.6)], [0, 1], {...clamp, easing: ease});
	const hp: Pose = {...idle(gf, 2), head: -20 * up};
	const cam = camPath(f, [
		[at('064'), camOn(900, 560, 1.6, {farBlur: 6})],
		[w('064', 0.6), camOn(1000, 380, 1.2)],
	]);
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 60, y: 0, o: 0.35, night: true}}>
			<StreetBG gf={gf} />
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={SFL} s={HS} facing={1} faceTurn={0.3} look={up > 0.5 ? [0.3, -1] : [0.3, 0.8]} mouth={up > 0.5 ? 'smile' : 'line'} pose={hp} uid="h-64" />
					<HeroBadge x={HX} y={badgeY(SFL)} s={0.8} />
					{Array.from({length: 5}).map((_, i) => {
						const t = f - w('064', 0.6) - i * 8;
						if (t < 0) return null;
						return <path key={i} d={`M${700 + i * 180},${120 + (i % 2) * 60} l${30 * Math.min(1, t / 20)},${14 * Math.min(1, t / 20)}`} stroke="#fff6c8" strokeWidth={4} strokeLinecap="round" opacity={0.8} />;
					})}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 065 «So you keep the phone. You just stop letting it hold you.» */
const E065: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 860;
	const pocket = env(f, w('065', 0.35), 1e9, 10, 1);
	let hp: Pose = phonePose(gf, 2, 8 * (1 - pocket));
	hp = reach(hp, 'F', [20 - 4 * pocket, -100 + 60 * pocket], 1);
	const cam = usePush(camOn(880, 560, 1.4), camOn(920, 520, 1.6));
	return (
		<Stage cam={cam} bg="#0b1030" light={{x: 60, y: 20, o: 0.35, night: true}}>
			<StreetBG gf={gf} />
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={SFL} s={HS} facing={1} faceTurn={0.3} look={pocket > 0.5 ? [0.6, -0.2] : [0.2, 0.9]} mouth={pocket > 0.5 ? 'smile' : 'line'} pose={hp} handItem={pocket < 0.6 ? <SmallPhone /> : undefined} uid="h-65" />
					<PhoneLight pose={hp} x={HX} floor={SFL} on={1 - pocket} />
					<HeroBadge x={HX} y={badgeY(SFL)} s={0.8} />
					<Tag f={f} t={w('065', 0.5)} x={HX + 320} y={380} text="PHONE → POCKET" c="#1d3a2a" fg="#9ff0b0" stroke="#3fcf7a" size={32} rot={3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 066–068 the gate again: the same guard, a different answer */
const Gate2: React.FC<{beat: '066' | '067' | '068'}> = ({beat}) => {
	const {f, gf, at} = useShot();
	const w = useW();
	const GX = 1180;
	const HXG = 820;
	const hw = beat === '066' ? walkTo(f, -6, w('066', 0.7), -250, HXG, 2, 0.28) : beat === '068' && f > w('068', 0.65) ? walkTo(f, w('068', 0.65), w('068', 1) + 20, HXG, 1060, 2, 0.3) : {x: HXG, pose: idle(gf, 2), vx: 0, bob: 0, moving: false};
	const gwalk = beat === '068' ? walkTo(f, w('068', 0.55), w('068', 0.85), GX, 1420, 5, 0.3) : {x: GX, pose: idle(gf, 5), vx: 0, bob: 0, moving: false};
	const gp = gwalk.moving ? gwalk.pose : gesture('stop', idle(gf, 5), beat === '068' ? env(f, -99, w('068', 0.4), 1, 12) : env(f, beat === '066' ? w('066', 0.75) : -99, 1e9, 10, 1), f);
	const cam =
		beat === '066'
			? usePush(camOn(700, 560, 1.05), camOn(960, 560, 1.2))
			: beat === '067'
				? usePush(camOn(GX - 40, 470, 1.9, {farBlur: 7}), camOn(GX - 60, 460, 2.1, {farBlur: 8}))
				: camPath(f, [
						[at('068'), camOn(HXG + 40, 470, 1.8, {farBlur: 6})],
						[w('068', 0.6), camOn(1000, 540, 1.2)],
					]);
	return (
		<Stage cam={cam} bg="#141c44" light={{x: 20, y: 0, o: 0.5, c: '255,214,160'}}>
			<Layer depth={1.5}>
				<SchoolGate f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="kai" x={beat === '068' ? 1640 - 300 * interpolate(f, [w('068', 0.6), w('068', 0.95)], [0, 1], clamp) : 1640} floor={FL} s={0.92} facing={-1} faceTurn={0.4} look={[-0.7, 0]} mouth="smile" pose={gesture('wave', idle(gf, 7), beat === '068' ? 1 : 0, f)} uid="kai-end" />
					<Actor who="guard" x={gwalk.x} floor={FL} s={1.02} facing={gwalk.moving ? 1 : -1} faceTurn={0.5} look={[-0.8, 0]} mouth={beat === '068' ? 'smile' : 'flat'} pose={gp} vx={gwalk.vx} bob={gwalk.bob} uid="guard2" />
					<Actor who="hero" x={hw.x} floor={FL} s={HS} facing={1} faceTurn={0.5} look={[0.8, 0]} mouth={beat === '068' ? 'smile' : 'line'} pose={hw.moving ? hw.pose : idle(gf, 2)} vx={hw.vx} bob={hw.bob} uid="h-gate2" />
					<HeroBadge x={hw.x} y={badgeY(FL) - hw.bob} s={0.8} />
					{beat === '067' ? (
						<Bubble x={GX - 60} y={300} w={560} h={110} t={f - at('067')} tail={[40, 90]}>
							<text y={14} textAnchor="middle" fontSize={36} fontFamily={FONT} fontWeight={900} fill="#13203a">
								Teachers use the back, sir.
							</text>
						</Bubble>
					) : null}
					{beat === '068' && f > w('068', 0.15) && f < w('068', 0.7) ? (
						<Bubble x={HXG + 60} y={300} w={560} h={130} t={f - w('068', 0.15)} tail={[-40, 100]}>
							<text y={-6} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#13203a">
								Not today.
							</text>
							<text y={34} textAnchor="middle" fontSize={28} fontFamily={FONT} fontWeight={800} fill="#13203a">
								I've got a class to catch up on.
							</text>
						</Bubble>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};
const E066: React.FC = () => <Gate2 beat="066" />;
const E067: React.FC = () => <Gate2 beat="067" />;
const E068: React.FC = () => <Gate2 beat="068" />;

/* 069 «So tell me. What did your screen time say yesterday? Be honest…» 070 subscribe */
const E069: React.FC<{sub?: boolean}> = ({sub}) => {
	const {f, gf, at, dur} = useShot();
	const w = useW();
	const HX = 960;
	const hp = sub ? gesture('point', idle(gf, 2), 1, f) : reach(idle(gf, 2), 'F', [60, -150], 1);
	const q = pop(f, sub ? at('070') : w('069', 0.15));
	const press = sub ? interpolate(f, [w('070', 0.3), w('070', 0.38)], [0, 1], clamp) : 0;
	const out = sub ? interpolate(f, [dur - 20, dur - 2], [0, 1], clamp) : 0;
	const cam = usePush(camOn(960, 560, 1.2), camOn(960, 520, 1.42));
	return (
		<>
			<Stage cam={cam} bg="#0b1030" light={{x: 60, y: 20, o: 0.35, night: true}}>
				<StreetBG gf={gf} />
				<Layer depth={1}>
					<Svg>
						<Actor who="hero" x={HX} floor={SFL} s={HS} facing={1} faceTurn={0} look={[0, 0]} mouth="smile" pose={hp} handItem={sub ? undefined : <SmallPhone />} handF={sub ? 'point' : undefined} uid="h-end" />
						<HeroBadge x={HX} y={badgeY(SFL)} s={0.8} />
						{sub ? (
							<g transform={`translate(${HX + 330},${560}) scale(${1 - 0.08 * Math.sin(press * Math.PI)})`}>
								<rect x={-220} y={-60} width={440} height={120} rx={26} fill={press >= 1 ? '#5a6078' : '#e4473c'} />
								<text y={20} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#fff">
									{press >= 1 ? 'SUBSCRIBED ✓' : 'SUBSCRIBE'}
								</text>
							</g>
						) : null}
						{sub && press >= 1 ? <Tag f={f} t={w('070', 0.4)} x={HX - 280} y={badgeY(SFL) + 120} text="+0 days" c="#1d3a2a" fg="#9ff0b0" stroke="#3fcf7a" size={34} rot={-4} /> : null}
					</Svg>
				</Layer>
			</Stage>
			<AbsoluteFill style={{pointerEvents: 'none', alignItems: 'center', paddingTop: 60, flexDirection: 'column', gap: 18}}>
				{!sub ? (
					<>
						<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 78, color: '#fff', WebkitTextStroke: '3px #11142c', textShadow: '0 6px 0 #11142c', transform: `scale(${q})`, opacity: Math.min(1, q * 1.5), textAlign: 'center', lineHeight: 1.05}}>
							WHAT DID YOUR
							<br />
							<span style={{color: '#ffb547'}}>SCREEN TIME</span> SAY?
						</div>
						<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 44, color: '#11142c', background: '#ffd34a', borderRadius: 18, padding: '8px 26px', transform: `scale(${pop(f, w('069', 0.6))})`}}>BE HONEST · COMMENTS</div>
					</>
				) : null}
			</AbsoluteFill>
			<AbsoluteFill style={{background: '#000', opacity: out}} />
		</>
	);
};
const E069a: React.FC = () => <E069 />;
const E070: React.FC = () => <E069 sub />;

export const SHOTS_E: ShotDef[] = [
	{at: '061', C: E061, whip: true},
	{at: '062', C: E062, whip: true},
	{at: '063', C: E063, whip: true},
	{at: '064', C: E064, whip: true},
	{at: '065', C: E065},
	{at: '066', C: E066, whip: true},
	{at: '067', C: E067},
	{at: '068', C: E068},
	{at: '069', C: E069a, whip: true},
	{at: '070', C: E070},
];
