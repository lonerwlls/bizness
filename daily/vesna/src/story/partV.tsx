import React from 'react';
import {AbsoluteFill, interpolate, random} from 'remotion';
import {Pose} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {HeroBadge, Layer, Stage, Svg, camOn, clamp, flash, usePush} from '../kit/kit';
import {Board, Bubble, FONT} from '../kit/ui';
import {Onoma} from '../reference/PauseTime';
import {FL, badgeY} from './common';
import {Lying, Tag, camPath, pop, useW} from './lib';
import {Heart, beatK} from './placesH';
import {S001, S002, S003, S004, S004b, S005, S006, S009b, S011} from './scenes3d';
import {Cabin, Cart, Certificate, Chunk, Gauge, Jet, SkyFall, SnowSlope, Ward, XRay} from './placesV';

/* The Vesna Vulović short. 16:9 scenes built for a 9:16 crop around x = 960:
   everything that matters stays inside x ≈ 680–1240. */
const C = 960;

/* Vesna pinned under the trolley inside the torn fuselage (local coords of Chunk) */
const Pinned: React.FC<{f: number; eyes?: 'sleepy' | 'wide'}> = ({f, eyes = 'sleepy'}) => (
	<g>
		<Lying who="vesna" x={-40} y={40} s={0.62} rot={84} f={f} id="v-pin" expr={eyes} />
		<Cart x={-90} y={70} rot={-70} s={0.62} />
	</g>
);

/* 001 hook: the wreck falling through the clouds, altitude dropping */
const V001: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(C, 560, 1.25), camOn(C, 540, 1.45));
	return (
		<Stage cam={cam} bg="#1d2560" light={{x: 50, y: 0, o: 0.4, c: '255,214,190'}}>
			<Layer depth={2}>
				<SkyFall f={gf} speed={7} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Chunk x={C + Math.sin(f / 14) * 10} y={600} rot={-12 + Math.sin(f / 9) * 6} s={0.9}>
						<Pinned f={gf} />
					</Chunk>
					<HeroBadge x={C} y={420} s={0.75} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 002 the cabin, 1972: Vesna with the trolley; she wasn't on the schedule */
const V002: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const wk = walkTo(f, 0, w('002', 0.5), 820, 930, 2, 0.18);
	const p = reach(reach(wk.moving ? wk.pose : idle(gf, 2), 'F', [86, -46], 1), 'B', [80, -40], 1);
	const cam = camPath(f, [
		[0, camOn(C + 20, 560, 1.15)],
		[w('002', 0.5), camOn(C + 20, 520, 1.35)],
		[w('002', 1), camOn(C + 30, 510, 1.5)],
	]);
	return (
		<Stage cam={cam} bg="#2a2240" light={{x: 70, y: 20, o: 0.45, c: '255,200,160'}}>
			<Layer depth={1.3}>
				<Cabin f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="vesna" x={wk.x} floor={FL} s={1} facing={1} faceTurn={0.5} look={[0.6, 0]} mouth="smile" pose={p} vx={wk.vx} bob={wk.bob} uid="v-cab" />
					<Cart x={wk.x + 150} y={FL} />
					<Tag f={f} t={6} x={C + 20} y={330} text="JANUARY 1972" c="#11142c" fg="#ffd34a" size={30} rot={-4} until={w('002', 0.48)} />
					<Tag f={f} t={w('002', 0.52)} x={C + 30} y={420} text="NOT ON SCHEDULE" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={26} rot={3} />
					{f > w('002', 0.75) ? (
						<Bubble x={C + 40} y={300} w={360} h={90} t={f - w('002', 0.75)} tail={[-60, 80]} thought>
							<text y={14} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#13203a">
								wrong Vesna!
							</text>
						</Bubble>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 003 the jet at cruise height; a bomb in the luggage hold */
const V003: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const bt = w('003', 0.45);
	const b = interpolate(f, [bt, bt + 14], [0, 1], clamp);
	const cam = usePush(camOn(C, 540, 1.0), camOn(C, 540, 1.2));
	return (
		<Stage cam={cam} bg="#1d2560" light={{x: 50, y: 0, o: 0.35, c: '255,214,190'}}>
			<Layer depth={2}>
				<SkyFall f={gf} dusk={1} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<g transform={`translate(${Math.sin(f * 3) * 8 * b},${Math.cos(f * 2.4) * 6 * b})`}>
						<Jet x={C + 40 - f * 0.6} y={560} s={0.72} rot={-3 + 8 * b} />
						{b > 0 ? (
							<g transform={`translate(${C - 70 - f * 0.6},${580})`}>
								{[0, 1, 2, 3, 4].map((i) => (
									<circle key={i} cx={Math.cos(i * 1.3) * 60 * b} cy={Math.sin(i * 1.3) * 40 * b} r={(40 + i * 12) * b} fill={['#ffd34a', '#ff8a3a', '#e4473c', '#ffef9a', '#ff6a3a'][i]} opacity={1 - b * 0.4} />
								))}
							</g>
						) : null}
					</g>
					<Tag f={f} t={4} x={C} y={300} text="33,000 FT" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={40} rot={-3} until={bt} />
					{f > bt && f < bt + 30 ? <Onoma x={C} y={380} text="BOOM!" t={f - bt} c="#ffd34a" size={110} /> : null}
				</Svg>
			</Layer>
			{flash(f, bt, 8) > 0 ? <AbsoluteFill style={{background: '#fff2c8', opacity: flash(f, bt, 8)}} /> : null}
		</Stage>
	);
};

/* 004 the plane breaks apart; Vesna pinned by the trolley in a falling piece */
const V004: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const split = interpolate(f, [0, w('004', 0.3)], [0, 1], clamp);
	const inside = interpolate(f, [w('004', 0.55), w('004', 0.7)], [0, 1], clamp);
	const cam = camPath(f, [
		[0, camOn(C, 540, 1.0)],
		[w('004', 0.3), camOn(C, 560, 1.15)],
		[w('004', 0.55), camOn(C, 600, 1.35)],
		[w('004', 0.75), camOn(C - 30, 620, 1.9, {farBlur: 8})],
		[w('004', 1.05), camOn(C - 30, 620, 2.05, {farBlur: 8})],
	]);
	return (
		<Stage cam={cam} bg="#1d2560" light={{x: 50, y: 0, o: 0.35, c: '255,214,190'}}>
			<Layer depth={2}>
				<SkyFall f={gf} speed={2 + 6 * split} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					{/* nose and tail spin away */}
					<g opacity={1 - inside}>
						<g transform={`translate(${C + 260 * split},${520 - 120 * split}) rotate(${40 * split})`}>
							<path d="M0,-40 L200,-40 Q260,-30 280,0 Q260,30 200,40 L0,40 L-20,10 L10,-10 Z" fill="#f2f4f8" stroke="#8a90a0" strokeWidth={4} />
						</g>
						<g transform={`translate(${C - 280 * split},${520 + 60 * split}) rotate(${-60 * split})`}>
							<path d="M-200,-40 L0,-40 L20,0 L0,40 L-200,40 Z M-200,-40 L-260,-170 L-200,-170 L-120,-40 Z" fill="#f2f4f8" stroke="#8a90a0" strokeWidth={4} />
						</g>
						{[0, 1, 2, 3, 4, 5, 6].map((i) => (
							<rect key={i} x={C + Math.cos(i) * 300 * split} y={560 + Math.sin(i * 2) * 240 * split + split * 60} width={20} height={14} fill="#c8ccd8" transform={`rotate(${i * 50 + f * 4} ${C + Math.cos(i) * 300 * split} ${560 + Math.sin(i * 2) * 240 * split})`} />
						))}
					</g>
					<Chunk x={C} y={560 + 40 * split} rot={-10 * split + Math.sin(f / 10) * 5 * split} s={0.7 + 0.3 * inside}>
						<Pinned f={gf} eyes={inside > 0.5 ? 'sleepy' : 'wide'} />
					</Chunk>
					<HeroBadge x={C} y={330} s={0.7} />
					<Tag f={f} t={w('004', 0.35)} x={C} y={860} text="EVERYONE ELSE DIED" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={30} rot={-2} until={w('004', 0.6)} />
					<Tag f={f} t={w('004', 0.75)} x={C - 40} y={720} text="FOOD CART" c="#11142c" fg="#ffd34a" size={24} rot={3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 005 into the snowy wooded mountainside at an angle */
const V005: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const hit = w('005', 0.4);
	const k = interpolate(f, [0, hit], [0, 1], clamp);
	const shake = env(f, hit, hit + 12, 1, 14);
	const x = interpolate(k, [0, 1], [C - 420, C + 20]);
	const y = interpolate(k, [0, 1], [-60, 740]);
	const cam = usePush(camOn(C, 560, 1.15), camOn(C, 600, 1.3));
	return (
		<Stage cam={{...cam, x: cam.x + Math.sin(f * 3) * 20 * shake, y: cam.y + Math.cos(f * 2.7) * 16 * shake}} bg="#8fb0d8" light={{x: 30, y: 0, o: 0.35}}>
			<Layer depth={1.2}>
				<SnowSlope f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Chunk x={x} y={y} rot={interpolate(k, [0, 1], [-35, -18])} s={0.75}>
						<Pinned f={gf} />
					</Chunk>
					{f >= hit
						? Array.from({length: 26}).map((_, i) => {
								const t = (f - hit) / 30;
								const a = -Math.PI * (0.1 + 0.8 * random('sa' + i));
								const v = 180 + random('sv' + i) * 260;
								return <circle key={i} cx={C + 20 + Math.cos(a) * v * t} cy={790 + Math.sin(a) * v * t + 300 * t * t} r={8 + random('sr' + i) * 14} fill="#fff" opacity={Math.max(0, 1 - t * 1.2)} />;
							})
						: null}
					<HeroBadge x={C} y={330} s={0.7} />
					{f > hit && f < hit + 30 ? <Onoma x={C} y={500} text="CRASH!" t={f - hit} c="#ffffff" size={96} /> : null}
					<Tag f={f} t={hit + 10} x={C} y={890} text="JUST THE RIGHT ANGLE" c="#11142c" fg="#9ff0b0" stroke="#9ff0b0" size={26} rot={-3} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 006 the villager, once a war medic, finds her in the snow */
const V006: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const wk = walkTo(f, 0, w('006', 0.4), 1260, 1060, 4, 0.4);
	const bend = env(f, w('006', 0.4), 1e9, 12, 1);
	const base = wk.moving ? wk.pose : idle(gf, 4);
	const bp: Pose = reach({...base, lean: base.lean + 30 * bend, head: base.head + 14 * bend}, 'F', [80, 40], bend);
	const cam = usePush(camOn(C + 40, 640, 1.3), camOn(C + 20, 680, 1.55));
	return (
		<Stage cam={cam} bg="#8fb0d8" light={{x: 30, y: 0, o: 0.35}}>
			<Layer depth={1.3}>
				<SnowSlope f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Chunk x={760} y={760} rot={-18} s={0.75} />
					<Lying who="vesna" x={930} y={FL - 24} s={0.95} rot={88} f={gf} id="v-snow" expr="sleepy" />
					<Actor who="bruno" x={wk.x} floor={FL} s={1} facing={-1} faceTurn={0.4} look={[-0.6, 0.7]} expr="worried" mouth="open" pose={bp} vx={wk.vx} bob={wk.bob} uid="bruno" />
					<Tag f={f} t={w('006', 0.25)} x={C + 40} y={470} text="FORMER WAR MEDIC" c="#11142c" fg="#ffd34a" size={26} rot={3} />
					<Tag f={f} t={w('006', 0.75)} x={C - 20} y={570} text="ALIVE" c="#1d3a2a" fg="#9ff0b0" stroke="#3fcf7a" size={40} rot={-4} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 007 Doctor ROO at the X-ray: every injury circled as it is named */
const V007: React.FC = () => {
	const {f, gf} = useShot();
	const w = useW();
	const marks = [pop(f, w('007', 0.02)), pop(f, w('007', 0.2)), pop(f, w('007', 0.42))];
	const para = interpolate(f, [w('007', 0.7), w('007', 0.8)], [0, 1], clamp);
	const target = f < w('007', 0.2) ? [130, -230] : f < w('007', 0.42) ? [130, 60] : [130, -60];
	const dp = reach(idle(gf, 3), 'F', target as [number, number], env(f, 4, 1e9, 10, 1));
	const cam = camPath(f, [
		[0, camOn(C, 500, 1.04)],
		[w('007', 0.2), camOn(C, 600, 1.1)],
		[w('007', 0.42), camOn(C, 520, 1.1)],
		[w('007', 1), camOn(C, 540, 1.04)],
	]);
	return (
		<Stage cam={cam} bg="#1d3a44" light={{x: 60, y: 0, o: 0.45, c: '200,240,255'}}>
			<Layer depth={1.4}>
				<Ward f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<XRay x={1070} y={500} marks={marks} f={f} />
					{para > 0 ? <rect x={890} y={520} width={380} height={380} rx={10} fill="#ff4a4a" opacity={0.18 * para} /> : null}
					<Actor who="doc" x={810} floor={FL} s={1} facing={1} faceTurn={0.4} look={[0.7, -0.2]} expr="worried" pose={dp} handF="point" uid="doc-x" />
					<Tag f={f} t={w('007', 0.02)} x={1070} y={150} text="SKULL" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={30} rot={-3} />
					<Tag f={f} t={w('007', 0.2)} x={1120} y={860} text="LEGS" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={30} rot={4} />
					<Tag f={f} t={w('007', 0.42)} x={930} y={350} text="SPINE" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={30} rot={-4} />
					<Tag f={f} t={w('007', 0.72)} x={C + 60} y={960} text="PARALYZED" c="#11142c" fg="#ffffff" stroke="#ff6a5a" size={40} rot={-2} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 008 why she lived: blood pressure dropped, she blacked out, the heart held */
const V008: React.FC = () => {
	const {f} = useShot();
	const w = useW();
	const needle = interpolate(f, [w('008', 0.1), w('008', 0.4)], [0.25, 1], clamp);
	const dp = gesture('point', idle(f, 3), env(f, 6, 1e9, 10, 1), f);
	return (
		<Board tint="#1a2150">
			<g transform={`translate(${C + 90},300) scale(${0.8 * pop(f, 2)})`}>
				<Gauge x={0} y={0} k={needle} />
			</g>
			<Tag f={f} t={w('008', 0.12)} x={C + 60} y={510} text="LOW BLOOD PRESSURE" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={30} rot={-3} />
			<g transform={`translate(${C + 110},720) scale(${1.4 * pop(f, w('008', 0.5))})`}>
				<Heart k={beatK(f, 40)} />
			</g>
			<Tag f={f} t={w('008', 0.45)} x={C - 60} y={600} text="BLACKED OUT" c="#11142c" fg="#ffd34a" size={30} rot={4} />
			<Tag f={f} t={w('008', 0.78)} x={C + 100} y={880} text="HEART HELD" c="#1d3a2a" fg="#9ff0b0" stroke="#3fcf7a" size={34} rot={-3} />
			<Actor who="doc" x={790} floor={1000} s={0.85} facing={1} faceTurn={0.4} look={[0.7, -0.4]} mouth="open" pose={dp} handF="point" uid="doc-g" />
		</Board>
	);
};

/* 009 ten months later she walks again (limp, a cane) */
const V009: React.FC = () => {
	const {f, gf} = useShot();
	const wk = walkTo(f, 0, 80, 800, 960, 6, 0.16);
	const limp = wk.moving ? Math.abs(Math.sin(f / 4)) * 8 : 0;
	const p = reach(wk.moving ? wk.pose : idle(gf, 6), 'F', [40, 110], 1);
	const cam = usePush(camOn(C + 20, 560, 1.1), camOn(C + 40, 540, 1.25));
	return (
		<Stage cam={cam} bg="#1d3a44" light={{x: 70, y: 0, o: 0.5, c: '255,240,210'}}>
			<Layer depth={1.4}>
				<Ward f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="vesna" x={wk.x} floor={FL} s={1} facing={1} faceTurn={0.5} look={[0.6, 0]} mouth="smile" pose={{...p, lean: p.lean + limp * 0.4}} vx={wk.vx} bob={wk.bob} handItem={<rect x={-4} y={-6} width={8} height={130} rx={4} fill="#7a4e34" />} uid="v-walk" />
					<Actor who="doc" x={1160} floor={FL} s={1} facing={-1} faceTurn={0.4} look={[-0.6, 0]} mouth="smile" pose={gesture('wave', idle(gf, 3), env(f, 20, 1e9, 10, 1), f)} uid="doc-w" />
					<Tag f={f} t={4} x={C} y={300} text="10 MONTHS LATER" c="#11142c" fg="#ffd34a" size={34} rot={-3} />
				</Svg>
			</Layer>
		</Stage>
	);
};
/* 009b she remembers nothing — not afraid to fly */
const V009b: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(C, 560, 1.3), camOn(C, 540, 1.5));
	return (
		<Stage cam={cam} bg="#2a2240" light={{x: 70, y: 20, o: 0.45, c: '255,200,160'}}>
			<Layer depth={1.3}>
				<Cabin f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<rect x={C - 110} y={560} width={220} height={300} rx={36} fill="#c0503a" />
					<Actor who="vesna" x={C} floor={FL} seat={790} s={1} facing={1} faceTurn={0.5} look={[0.5, -0.2]} mouth="smile" pose={{...SIT, armF: [40, 60]}} uid="v-seat" />
					<Bubble x={C + 70} y={340} w={180} h={120} t={f - 6} tail={[-50, 100]} thought>
						<text y={30} textAnchor="middle" fontSize={90} fontFamily={FONT} fontWeight={900} fill="#13203a">
							?
						</text>
					</Bubble>
					<Tag f={f} t={20} x={C} y={940} text="REMEMBERS NOTHING" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={30} rot={2} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 010 the record */
const V010: React.FC = () => {
	const {f} = useShot();
	return (
		<Board tint="#3a2a10">
			{Array.from({length: 40}).map((_, i) => {
				const t = Math.max(0, f - 8);
				return <rect key={i} x={C - 300 + random('cfx' + i) * 600 + Math.sin(t / 8 + i) * 20} y={-40 + ((random('cfy' + i) * 300 + t * (3 + random('cfv' + i) * 3)) % 1200)} width={12} height={20} fill={['#ffd34a', '#ff6a5a', '#9fd8ff', '#9ff0b0'][i % 4]} transform={`rotate(${t * 6 + i * 40} ${C} 540)`} opacity={f > 8 ? 0.9 : 0} />;
			})}
			<Certificate x={C} y={540} k={pop(f, 2)} s={0.92} />
		</Board>
	);
};

/* 011 the question */
const V011: React.FC = () => {
	const {f, gf} = useShot();
	const cam = usePush(camOn(C, 560, 1.1), camOn(C, 540, 1.25));
	return (
		<Stage cam={cam} bg="#1d2560" light={{x: 50, y: 0, o: 0.4, c: '255,214,190'}}>
			<Layer depth={2}>
				<SkyFall f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Jet x={C - 300 + f * 6} y={260} s={0.4} />
					<Actor who="vesna" x={C} floor={FL + 40} s={1} facing={1} faceTurn={0.2} look={[0.1, -0.1]} mouth="smile" pose={gesture('wave', idle(gf, 2), env(f, 6, 1e9, 10, 1), f)} uid="v-end" />
					<g transform={`translate(${C},470) scale(${pop(f, 4)})`}>
						<text textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#fff" stroke="#11142c" strokeWidth={12} paintOrder="stroke">
							WOULD YOU
						</text>
						<text y={74} textAnchor="middle" fontSize={64} fontFamily={FONT} fontWeight={900} fill="#ffd34a" stroke="#11142c" strokeWidth={12} paintOrder="stroke">
							FLY AGAIN?
						</text>
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

export const SHOTS_V: ShotDef[] = [
	{at: '001', C: V001, V: S001},
	{at: '002', C: V002, V: S002, whip: true},
	{at: '003', C: V003, V: S003, whip: true},
	{at: '004', C: V004, V: S004},
	{at: '004', off: 84, C: V004, V: S004b, whip: true},
	{at: '005', C: V005, V: S005, whip: true},
	{at: '006', C: V006, V: S006},
	{at: '007', C: V007, whip: true},
	{at: '008', C: V008, whip: true},
	{at: '009', C: V009, whip: true},
	{at: '009', off: 72, C: V009b, V: S009b, whip: true},
	{at: '010', C: V010, whip: true},
	{at: '011', C: V011, V: S011, whip: true},
];
