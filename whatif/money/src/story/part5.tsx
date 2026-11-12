import React from 'react';
import {Easing, interpolate, spring} from 'remotion';
import {Pose, Stickman, toLocal} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {HeroBadge, Layer, Stage, Svg, camOn, clamp, ease, mixCam, usePush} from '../kit/kit';
import {Callout} from '../kit/graphics';
import {Bubble, FONT, HAND} from '../kit/ui';
import {CAST} from './cast';
import {Bang, CallSplit, Card, FL, HS, SFL, SmallPhone, StreetBG, badgeY} from './common';
import {Bedroom} from '../kit/sets';
import {Apartment, Envelope, Hallway, SEAT} from './places';
import {BusInside, FrontDesk, Hospital, PlasticChair, Validator} from './places5';

/* PART 5 (≈4:25–5:40): Mom's bill, the choice, the payment. */

const useW = () => {
	const {at, end} = useShot();
	return (id: string, frac: number) => at(id) + Math.round((end(id) - at(id)) * frac);
};
const pop = (f: number, t: number) => spring({frame: f - t, fps: 30, config: {damping: 11, stiffness: 160}});
const Big: React.FC<{f: number; t: number; x: number; y: number; text: string; c?: string; size?: number}> = ({f, t, x, y, text, c = '#fff', size = 64}) => {
	const k = pop(f, t);
	if (f < t) return null;
	return (
		<g transform={`translate(${x},${y}) scale(${k})`} opacity={Math.min(1, k * 1.5)}>
			<text textAnchor="middle" fontSize={size} fontFamily={FONT} fontWeight={900} fill={c} stroke="#11142c" strokeWidth={10} paintOrder="stroke">
				{text}
			</text>
		</g>
	);
};

/* 056 «And then, one night, the envelope slides under your door.» */
const T056: React.FC = () => {
	const {f, gf, at} = useShot();
	const slide = interpolate(f, [at('056') + 10, at('056') + 40], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const cam = usePush(camOn(1250, 820, 1.7, {farBlur: 6}), camOn(1200, 860, 2.0, {farBlur: 8}));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 70, y: 90, o: 0.4, c: '255,227,160'}}>
			<Layer depth={1.4}>
				<Hallway f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<g transform={`translate(${1340 - 200 * slide},${930}) rotate(${-8 + 12 * slide}) scale(0.32,0.12)`}>
						<rect x={-260} y={-150} width={520} height={300} rx={10} fill="#f2ecdc" />
						<rect x={60} y={-80} width={160} height={50} fill="none" stroke="#d23b3b" strokeWidth={14} />
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 057 «It's not your bill. It's Mom's.» 058 «Her surgery. Ninety thousand dollars… Due Friday.» */
const T057: React.FC<{reveal?: boolean}> = ({reveal}) => {
	const {f, gf} = useShot();
	const w = useW();
	const glow = 0.5 + 0.5 * Math.sin(gf / 5);
	const due = reveal ? interpolate(f, [w('058', 0.8), w('058', 0.88)], [0, 1], clamp) : 0;
	const amt = reveal && f > w('058', 0.3) ? '$90,000' : '$ ???,???';
	const cam = reveal ? usePush(camOn(960, 560, 1.12, {farBlur: 12}), camOn(1000, 600, 1.3, {farBlur: 12})) : usePush(camOn(960, 520, 1.0, {farBlur: 10}), camOn(900, 480, 1.18, {farBlur: 12}));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 50, y: 80, o: 0.4, c: '255,227,160'}}>
			<Layer depth={1.4}>
				<Hallway f={gf} />
			</Layer>
			<Layer depth={1} sharp>
				<Svg>
					<rect x={-400} y={700} width={2800} height={600} fill="#2e2840" opacity={0.9} />
					<Envelope x={960} y={560} s={1.45} rot={-5} glow={glow} amount={amt} patient="MOM" due={due} />
					{reveal && f > w('058', 0.55) ? (
						<g transform={`translate(960,${880}) scale(${pop(f, w('058', 0.55))})`}>
							<rect x={-300} y={-40} width={600} height={80} rx={14} fill="#11142c" stroke="#ff6a5a" strokeWidth={4} />
							<text y={14} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#ff6a5a">
								INSURANCE: NOT COVERED
							</text>
						</g>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};
const T057a: React.FC = () => <T057 />;
const T058: React.FC = () => <T057 reveal />;

/* 059 «Ninety thousand minutes. That's sixty-two days of your life.» */
const T059: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 760;
	const cam = usePush(camOn(HX + 200, 480, 1.6, {farBlur: 6}), camOn(HX + 220, 460, 1.8, {farBlur: 7}));
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 70, y: 90, o: 0.4, c: '255,227,160'}}>
			<Layer depth={1.4}>
				<Hallway f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.3} look={[0.1, -1]} expr="wide" mouth="open" pose={{...reach(idle(gf, 2), 'F', [40, -100], 1), head: -14}} handItem={<g transform="scale(0.12) rotate(-10)"><Envelope x={0} y={0} /></g>} uid="h-59" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					<Big f={f} t={at('059') + 4} x={HX + 470} y={380} text="90,000 MIN" c="#ffd34a" size={60} />
					<Big f={f} t={w('059', 0.55)} x={HX + 470} y={480} text="= 62 DAYS" c="#ff6a5a" size={72} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 060 «You know the trick. Rule two. Start a fundraiser, let strangers pay, lose nothing.»
   061 «But fundraisers take weeks. Mom has four days.» */
const T060: React.FC<{weeks?: boolean}> = ({weeks}) => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 640;
	const raised = weeks ? 2140 : Math.floor(interpolate(f, [w('060', 0.6), w('060', 1)], [0, 2140], clamp));
	const bar = raised / 90000;
	const cam = usePush(camOn(960, 540, 1.1), camOn(1000, 520, 1.22));
	const cal = weeks ? pop(f, w('061', 0.1)) : 0;
	const days = weeks ? pop(f, w('061', 0.55)) : 0;
	return (
		<Stage cam={cam} bg="#1b2045" light={{x: 10, y: 30, o: 0.45, c: '255,214,150'}}>
			<Layer depth={1.6}>
				<Apartment f={gf} page={1} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.8, 0]} expr={weeks ? 'sad' : 'worried'} pose={weeks ? gesture('facepalm', idle(gf, 3), env(f, w('061', 0.6), 1e9, 10, 1), f) : gesture('rubChin', idle(gf, 3), 1, f)} armOver={weeks && f > w('061', 0.65)} uid="h-fund" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					<g transform="translate(1240,500)">
						<rect x={-330} y={-260} width={660} height={520} rx={30} fill="#f4f6fb" />
						<rect x={-330} y={-260} width={660} height={90} rx={30} fill="#3fcf7a" />
						<text y={-200} textAnchor="middle" fontSize={40} fontFamily={FONT} fontWeight={900} fill="#fff">
							HELP MOM'S SURGERY
						</text>
						<text y={-80} textAnchor="middle" fontSize={70} fontFamily={FONT} fontWeight={900} fill="#13203a">
							${raised.toLocaleString('en-US')}
						</text>
						<text y={-30} textAnchor="middle" fontSize={28} fontFamily={FONT} fill="#5a6078">
							raised of $90,000
						</text>
						<rect x={-270} y={10} width={540} height={36} rx={18} fill="#dde1ec" />
						<rect x={-270} y={10} width={Math.max(36, 540 * bar)} height={36} rx={18} fill="#3fcf7a" />
						{weeks ? (
							<g transform={`scale(${cal})`} opacity={Math.min(1, cal * 1.5)}>
								<text y={130} textAnchor="middle" fontSize={44} fontFamily={FONT} fontWeight={900} fill="#5a6078">
									TYPICAL: 3–4 WEEKS
								</text>
							</g>
						) : (
							<text y={130} textAnchor="middle" fontSize={34} fontFamily={HAND} fontWeight={700} fill="#3aa37a">
								strangers pay → 0 min for you
							</text>
						)}
						{weeks ? (
							<g transform={`translate(0,210) rotate(-4) scale(${days})`} opacity={Math.min(1, days * 1.5)}>
								<rect x={-260} y={-44} width={520} height={88} rx={14} fill="#d23b3b" />
								<text y={16} textAnchor="middle" fontSize={46} fontFamily={FONT} fontWeight={900} fill="#fff">
									MOM HAS 4 DAYS
								</text>
							</g>
						) : null}
					</g>
				</Svg>
			</Layer>
		</Stage>
	);
};
const T060a: React.FC = () => <T060 />;
const T061: React.FC = () => <T060 weeks />;

/* 062 «You sit on the kitchen floor with the envelope and run the numbers again and again…» */
const T062: React.FC = () => {
	const {f, gf, at} = useShot();
	const HX = 900;
	const hp: Pose = {lean: 10, head: 18, armB: [40, 90], armF: [50, 80], legB: [80, 100], legF: [70, 110]};
	const cam = usePush(camOn(900, 640, 1.3), camOn(900, 660, 1.6));
	const notes = ['90,000', '÷ 1,440', '= 62.5', '62 days', '90,000', '÷ 1,440', '= 62.5', '...'];
	return (
		<Stage cam={cam} bg="#101430" light={{x: 70, y: 20, o: 0.3, night: true}}>
			<Layer depth={1.6}>
				<Apartment f={gf} page={1} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<rect x={-400} y={-300} width={2800} height={1400} fill="#05060f" opacity={0.4} />
					<Actor who="hero" x={HX} floor={FL} seat={860} s={HS} facing={1} faceTurn={0.3} look={[0.4, 0.9]} expr="sad" mouth="frown" pose={hp} handItem={<g transform="scale(0.1) rotate(10)"><Envelope x={0} y={0} amount="$90,000" /></g>} uid="h-floor" />
					<HeroBadge x={HX} y={860 - 164 - 118} s={0.8} />
					{notes.map((n, i) => {
						const t = f - at('062') - i * 16;
						if (t < 0) return null;
						const a = i * 0.8 + t / 60;
						return (
							<text key={i} x={HX + Math.cos(a) * 340} y={560 + Math.sin(a) * 160} textAnchor="middle" fontSize={44} fontFamily={HAND} fontWeight={700} fill="#9fd8ff" opacity={Math.max(0, 0.8 - t / 120)}>
								{n}
							</text>
						);
					})}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 063 «You call Marco. You haven't talked in a month. He picks up on the first ring.»
   064 «He says just one thing. Go. I'm coming with you.» */
const T063: React.FC<{talk?: boolean}> = ({talk}) => {
	const {f, gf, at} = useShot();
	const w = useW();
	const pickAt = talk ? -999 : w('063', 0.75);
	const picked = talk || f > pickAt;
	const k = talk ? 1 : spring({frame: f - pickAt, fps: 30, config: {damping: 16, stiffness: 140}});
	const ear = (seed: number): Pose => ({...reach(idle(gf, seed), 'F', [30, -175], 1), head: 4});
	const HX = 960;
	const hero = (
		<Stage cam={camOn(HX + 60, 520, picked ? 1.3 : 1.2)} bg="#101430" light={{x: 10, y: 30, o: 0.4, c: '255,214,150'}}>
			<Layer depth={1.6}>
				<Apartment f={gf} page={1} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.7, 0.2]} expr={picked ? 'wide' : 'worried'} pose={ear(3)} handItem={<SmallPhone />} armOver uid="h-call" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					{!picked ? (
						<g transform={`translate(${HX + 260},${600})`}>
							<rect x={-150} y={-36} width={300} height={72} rx={36} fill="#11142c" stroke="#4f7dd8" strokeWidth={4} />
							<text y={12} textAnchor="middle" fontSize={32} fontFamily={FONT} fontWeight={900} fill="#9fd8ff">
								CALLING MARCO
							</text>
							<circle cx={-170} cy={0} r={20 + ((f * 2) % 30)} fill="none" stroke="#4f7dd8" strokeWidth={4} opacity={1 - ((f * 2) % 30) / 30} />
						</g>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
	if (!picked) return hero;
	const MX = 820;
	const marco = (
		<Stage cam={camOn(MX - 60, 510, 1.3)} bg="#1d2550" light={{x: 70, y: 20, o: 0.4, night: true}}>
			<Layer depth={1.3}>
				<Bedroom night f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="friend" x={MX} floor={880} s={1.02} facing={-1} faceTurn={0.4} look={[-0.7, 0.1]} expr="normal" mouth={talk ? undefined : 'line'} pose={ear(6)} handItem={<SmallPhone />} armOver talk={talk && f > w('064', 0.3) && f < w('064', 0.95) ? 0.3 + 0.3 * Math.abs(Math.sin(f / 3)) : 0} uid="m-call" />
					{talk && f > w('064', 0.35) ? (
						<Bubble x={MX - 60} y={300} w={460} h={110} t={f - w('064', 0.35)} tail={[60, 90]}>
							<text y={14} textAnchor="middle" fontSize={34} fontFamily={FONT} fontWeight={900} fill="#13203a">
								Go. I'm coming with you.
							</text>
						</Bubble>
					) : null}
					{!talk ? <Bang f={f} t={pickAt + 2} x={MX - 60} y={330} text="1st RING!" c="#9ff0b0" /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
	return <CallSplit left={hero} right={marco} k={k} />;
};
const T063a: React.FC = () => <T063 />;
const T064: React.FC = () => <T063 talk />;

/* 065 «You take the first bus to the hospital. Four dollars. You don't even look up.» */
const T065: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	// inside the bus: taps the card on the validator, holds the pole, eyes stay on the envelope
	const HX = 860;
	const VX = 960;
	const hip = FL - 157 * HS;
	const tapK = env(f, w('065', 0.32), w('065', 0.55), 8, 10);
	const sway = Math.sin(gf / 14) * 1.5;
	let hp: Pose = {...idle(gf, 2), lean: sway, head: 14};
	hp = reach(hp, 'F', tapK > 0.01 ? toLocal(VX + 30, 600, HX, hip, HS, 1) : [42, -100], tapK > 0.01 ? tapK : 1);
	hp = reach(hp, 'B', toLocal(VX - 6, 560, HX, hip, HS, 1), 1);
	const cam = usePush(camOn(900, 540, 1.3), camOn(900, 520, 1.45));
	return (
		<Stage cam={cam} bg="#24305a" light={{x: 50, y: 0, o: 0.35, c: '220,235,255'}}>
			<Layer depth={1.4}>
				<BusInside f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.4} look={[0.3, 1]} expr="worried" mouth="frown" pose={hp} handItem={tapK > 0.3 ? <Card /> : <g transform="scale(0.1) rotate(-10)"><Envelope x={0} y={0} amount="$90,000" /></g>} uid="h-bus" />
					<Validator x={VX} ok={f > w('065', 0.45) ? 1 : 0} />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 066 «Mom is sitting in a plastic chair, holding the same envelope… we'll figure it out, honey.» */
const T066: React.FC = () => {
	const {f, gf, at} = useShot();
	const w = useW();
	const hw = walkTo(f, at('066') + 10, w('066', 0.35), -200, 760, 5, 0.4);
	const momP: Pose = reach(reach({...SIT, lean: 0, head: 4}, 'F', [52, -28], 1), 'B', [44, -26], 1);
	const cam = usePush(camOn(1000, 560, 1.15), camOn(1050, 520, 1.35));
	return (
		<Stage cam={cam} bg="#1f4a50" light={{x: 40, y: 0, o: 0.45, c: '220,255,250'}}>
			<Layer depth={1.4}>
				<Hospital f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					{[1060, 1200, 1340, 1480].map((x) => (
						<PlasticChair key={x} x={x} facing={-1} c={x === 1200 ? '#3d6fd6' : '#e47a3c'} />
					))}
					<Actor who="mom" x={1228} floor={FL} seat={SEAT} s={0.98} facing={-1} faceTurn={0.4} look={f > w('066', 0.35) ? [-0.8, -0.2] : [-0.3, 0.6]} expr="sad" mouth={f > w('066', 0.55) ? 'smile' : 'frown'} pose={momP} handItem={<g transform="scale(0.1)"><Envelope x={0} y={0} amount="$90,000" /></g>} uid="mom-h" />
					<Actor who="hero" x={hw.x} floor={FL} s={HS} facing={1} faceTurn={0.5} look={[0.8, 0.2]} expr="worried" pose={hw.pose} vx={hw.vx} bob={hw.bob} uid="h-hos" />
					<HeroBadge x={hw.x} y={badgeY(FL) - hw.bob} s={0.8} />
					{f > w('066', 0.62) ? (
						<Bubble x={1300} y={330} w={560} h={110} t={f - w('066', 0.62)} tail={[-60, 90]}>
							<text y={14} textAnchor="middle" fontSize={38} fontFamily={FONT} fontWeight={900} fill="#13203a">
								We'll figure it out, honey.
							</text>
						</Bubble>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};

/* 067 «At the front desk, you open the payment screen. Ninety thousand. Pay.» 068 «Click.»
   069 «The number rolls down. Two months, gone in a second.» */
const DX = 900;
const T067: React.FC<{stage: 0 | 1 | 2}> = ({stage}) => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 720;
	const hip = FL - 157;
	const press = stage === 0 ? env(f, w('067', 0.75), 1e9, 8, 1) : stage === 1 ? 1 : env(f, -99, at('069') + 10, 1, 10);
	let hp: Pose = reach(idle(gf, 3), 'F', toLocal(DX + 120, 712 - 122, HX, hip, HS, 1), press);
	if (stage === 2) hp = {...hp, head: -16};
	const paid = stage === 0 ? 0 : 1;
	const cam =
		stage === 0
			? usePush(camOn(900, 560, 1.2), camOn(960, 540, 1.45))
			: stage === 1
				? camOn(DX + 100, 560, 2.0, {farBlur: 8})
				: mixCam(camOn(DX + 60, 560, 1.8, {farBlur: 8}), camOn(HX + 120, 470, 1.9, {farBlur: 8}), interpolate(f, [at('069'), at('069') + 18], [0, 1], {...clamp, easing: ease}));
	return (
		<Stage cam={cam} bg="#1f4a50" light={{x: 40, y: 0, o: 0.45, c: '220,255,250'}}>
			<Layer depth={1.4}>
				<Hospital f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					<Actor who="clerk" x={1450} floor={FL} s={0.98} facing={-1} faceTurn={0.4} look={[-0.6, 0.3]} pose={idle(gf, 14)} uid="nurse" />
					<FrontDesk x={DX} paid={paid} amount="$90,000" />
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={1} faceTurn={0.4} look={stage === 2 ? [0.1, -1] : [0.7, -0.3]} expr={stage === 2 ? 'wide' : 'normal'} mouth={stage === 2 ? 'open' : 'line'} pose={hp} handF={press > 0.3 ? 'point' : undefined} uid="h-desk" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					{stage === 1 ? <Bang f={f} t={at('068')} x={DX + 330} y={430} text="CLICK." c="#ffd34a" /> : null}
					{stage === 2 ? <Callout f={f} t0={w('069', 0.55)} t1={1e9} from={[HX + 180, badgeY(FL) - 20]} to={[HX + 260, badgeY(FL) - 130]} text="−62 DAYS" c="#ff6a5a" size={30} /> : null}
				</Svg>
			</Layer>
		</Stage>
	);
};
const T067a: React.FC = () => <T067 stage={0} />;
const T068: React.FC = () => <T067 stage={1} />;
const T069: React.FC = () => <T067 stage={2} />;

/* 070 «And all you feel is relief…» 071 «Marco puts a hand on your shoulder…»
   072 «Mom sees the number over your head for the first time… she understands your face.» */
const Relief: React.FC<{beat: 0 | 1 | 2}> = ({beat}) => {
	const {f, gf, at} = useShot();
	const w = useW();
	const HX = 860;
	const mw = beat === 1 ? walkTo(f, at('071') - 6, w('071', 0.25), 2200, 1080, 4, 0.34) : {x: 1080, pose: idle(gf, 4), vx: 0, bob: 0, moving: false};
	const touch = beat === 1 ? env(f, w('071', 0.25), 1e9, 10, 1) : beat === 2 ? 1 : 0;
	const mp = reach(mw.pose, 'F', toLocal(HX + 26, FL - 157 - 110, mw.x, FL - 157 * 1.02, 1.02, -1), touch);
	const exhale = beat === 0 ? Math.sin(Math.min(1, (f - at('070')) / 40) * Math.PI) : 0;
	let hp: Pose = {...idle(gf, 2), lean: -4 * exhale, head: beat === 2 ? 8 : -6 * exhale};
	if (beat === 2) hp = reach(reach(hp, 'F', [60, -100], env(f, w('072', 0.6), 1e9, 10, 1)), 'B', [55, -105], env(f, w('072', 0.6), 1e9, 10, 1));
	const momX = 600;
	const momLook: [number, number] = beat === 2 && f < w('072', 0.5) ? [0.6, -1] : [0.8, -0.2];
	const momP = beat === 2 ? reach(reach(idle(gf, 9), 'F', [60, -110], env(f, w('072', 0.6), 1e9, 10, 1)), 'B', [55, -100], env(f, w('072', 0.6), 1e9, 10, 1)) : idle(gf, 9);
	const momXX = beat === 2 ? momX + 140 * env(f, w('072', 0.55), 1e9, 14, 1) : momX;
	const cam = beat === 0 ? usePush(camOn(HX, 470, 1.9, {farBlur: 8}), camOn(HX, 450, 2.1, {farBlur: 8})) : beat === 1 ? usePush(camOn(980, 520, 1.3), camOn(980, 500, 1.45)) : usePush(camOn(800, 520, 1.3), camOn(780, 480, 1.55));
	return (
		<Stage cam={cam} bg="#1f4a50" light={{x: 40, y: 0, o: 0.45, c: '255,240,210'}}>
			<Layer depth={1.4}>
				<Hospital f={gf} />
			</Layer>
			<Layer depth={1}>
				<Svg>
					{beat === 2 ? <Actor who="mom" x={momXX} floor={FL} s={0.98} facing={1} faceTurn={0.4} look={momLook} expr={f < w('072', 0.5) ? 'wide' : 'sad'} mouth="smile" pose={momP} uid="mom-r" /> : null}
					<Actor who="hero" x={HX} floor={FL} s={HS} facing={beat === 2 ? -1 : 1} faceTurn={0.4} look={beat === 2 ? [-0.8, 0] : [0.2, 0]} mouth="smile" lidL={beat === 0 ? 0.7 * exhale : 0} lidR={beat === 0 ? 0.7 * exhale : 0} pose={hp} uid="h-rel" />
					<HeroBadge x={HX} y={badgeY(FL)} s={0.8} />
					{beat >= 1 ? <Actor who="friend" x={mw.x} floor={FL} s={1.02} facing={-1} faceTurn={0.5} look={[-0.8, 0]} mouth="smile" pose={mp} vx={mw.vx} bob={mw.bob} uid="m-rel" /> : null}
					{beat === 0 ? <Big f={f} t={w('070', 0.5)} x={HX - 270} y={400} text="2 MONTHS" c="#ffd34a" size={44} /> : null}
					{beat === 0 ? <Big f={f} t={w('070', 0.75)} x={HX - 270} y={460} text="FOR YEARS OF HERS" c="#9ff0b0" size={34} /> : null}
					{beat === 1 && f > w('071', 0.35) ? (
						<Bubble x={1300} y={260} w={560} h={150} t={f - w('071', 0.35)} tail={[-80, 120]}>
							<text y={-8} textAnchor="middle" fontSize={36} fontFamily={FONT} fontWeight={900} fill="#13203a">
								Two months.
							</text>
							<text y={38} textAnchor="middle" fontSize={32} fontFamily={FONT} fontWeight={800} fill="#13203a">
								Let's make the rest good ones.
							</text>
						</Bubble>
					) : null}
				</Svg>
			</Layer>
		</Stage>
	);
};
const T070: React.FC = () => <Relief beat={0} />;
const T071: React.FC = () => <Relief beat={1} />;
const T072: React.FC = () => <Relief beat={2} />;

export const SHOTS5: ShotDef[] = [
	{at: '056', C: T056, whip: true},
	{at: '057', C: T057a},
	{at: '058', C: T058},
	{at: '059', C: T059},
	{at: '060', C: T060a, whip: true},
	{at: '061', C: T061},
	{at: '062', C: T062},
	{at: '063', C: T063a},
	{at: '064', C: T064},
	{at: '065', C: T065, whip: true},
	{at: '066', C: T066, whip: true},
	{at: '067', C: T067a},
	{at: '068', C: T068},
	{at: '069', C: T069},
	{at: '070', C: T070},
	{at: '071', C: T071},
	{at: '072', C: T072},
];
