import React from 'react';
import {interpolate, random} from 'remotion';
import * as THREE from 'three';
import {Pose} from '../engine/Stickman';
import {env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import type {ShotDef} from '../kit/coverage';
import {clamp, ease} from '../kit/kit';
import {FONT} from '../kit/ui';
import {Onoma} from '../reference/PauseTime';
import {Lying, Tag, pop, useW} from './lib';
import {View3D, World, dressScene, standAt, toLocal} from '../three/View3D';
import {skyTexture} from '../three/toon';
import {groundY, makeBearSign, makeCross, makeFence, makeHouse, makeMountain, makePit, makePlane, makeShovel, makeSign, makeSuitcase3, makeTent, makeTundra} from '../three/arctic';

/* Longyearbyen, native 9:16. One small Arctic town, a different spot for every beat. */
const sm = (k: number) => interpolate(k, [0, 1], [0, 1], {...clamp, easing: ease});
const look = (cam: THREE.PerspectiveCamera, p: [number, number, number], t: [number, number, number]) => {
	cam.position.set(...p);
	cam.up.set(0, 1, 0);
	cam.lookAt(...t);
};
const DUSK: [number, string][] = [
	[0, '#2a3a7a'],
	[0.55, '#9a7ab8'],
	[1, '#f6c0a8'],
];
const NIGHT: [number, string][] = [
	[0, '#060a24'],
	[0.6, '#14204a'],
	[1, '#2a3a6a'],
];
const HOUSES: [number, string][] = [
	[-22, '#c0503a'],
	[-13, '#f2b21c'],
	[-4, '#3d6fd6'],
	[5, '#3aa37a'],
	[14, '#d86a9a'],
	[23, '#e47a3c'],
];
type TownW = World & {plane?: THREE.Group; shovel?: THREE.Group; suitcase?: THREE.Group};
const makeTown = (night = false, extra?: (s: THREE.Scene, w: TownW) => void) => (): TownW => {
	const scene = dressScene(new THREE.Scene(), {sky: skyTexture(night ? NIGHT : DUSK), fog: [night ? '#14204a' : '#e8c8d0', 40, 240], sun: [-20, 18, 14], sunColor: night ? '#9fb0e0' : '#ffe0c8', sunI: night ? 1.2 : 2.3, hemi: night ? ['#6a7ab8', '#1a2048', 1.1] : ['#fff0f4', '#7a7ab0', 1.5]});
	scene.add(makeTundra());
	[[-70, 60, 34], [0, 80, 40], [80, 70, 30], [-140, 70, 36], [150, 90, 44]].forEach(([x, w, h], i) => {
		const m = makeMountain(w, h, i + 3);
		m.position.set(x, 0, -110 - (i % 2) * 20);
		scene.add(m);
	});
	HOUSES.forEach(([x, c], i) => {
		const h = makeHouse(c, 7, 5, 3 + (i % 2) * 0.6, i + 1);
		h.position.set(x, groundY(x, -12), -12);
		scene.add(h);
	});
	const sign = makeSign(['LONGYEARBYEN', 'POP. ~2,400'], {w: 3.4, h: 1.5});
	sign.position.set(0, groundY(0, 0), 0);
	sign.rotation.y = 0.15;
	scene.add(sign);
	const bear = makeBearSign();
	bear.position.set(7, groundY(7, -2), -2);
	bear.rotation.y = -0.2;
	scene.add(bear);
	// the cemetery on the slope east of town
	for (let r = 0; r < 3; r++)
		for (let c = 0; c < 6; c++) {
			const cr = makeCross();
			const x = 37 + c * 1.6 + (r % 2) * 0.5;
			const z = -14 + r * 1.6;
			cr.position.set(x, groundY(x, z), z);
			cr.rotation.set(random('ct' + r + c) * 0.1 - 0.05, random('cy' + r + c) * 0.4 - 0.2, random('cz' + r + c) * 0.12 - 0.06);
			scene.add(cr);
		}
	const fence = makeFence(12);
	fence.position.set(41, groundY(41, -9), -9);
	scene.add(fence);
	const cs = makeSign(['NO NEW BURIALS'], {w: 2.6, h: 0.7, post: 1.0, bg: '#2a2f4a', fg: '#ffffff'});
	cs.position.set(35.5, groundY(35.5, -8.6), -8.6);
	scene.add(cs);
	const pit = makePit();
	pit.position.set(-9, groundY(-9, 4) + 0.02, 4);
	scene.add(pit);
	// airstrip to the west
	const strip = new THREE.Mesh(new THREE.BoxGeometry(160, 0.05, 10), new THREE.MeshToonMaterial({color: '#5a6070'}));
	strip.position.set(-130, 0.3, -6);
	strip.userData.noInk = true;
	scene.add(strip);
	const w: TownW = {scene};
	extra?.(scene, w);
	return w;
};
const H = 1.75;

/* 001 hook: the town sign */
export const L001: React.FC = () => {
	const {f, gf} = useShot();
	return (
		<View3D
			make={makeTown()}
			fov={44}
			update={(w, ff, cam) => {
				const k = sm(ff / 140);
				look(cam, [0.9 - 0.2 * k, 1.7, 15.5 - 2.5 * k], [0.7, 1.7, 0]);
			}}
			overlay={(p) => {
				const a = standAt(p, 2.5, groundY(2.5, 1.4), 1.4, H);
				return <Actor who="hero" x={a.x} floor={a.floor} s={a.s} facing={-1} faceTurn={0.2} look={[-0.3, -0.5]} expr="wide" pose={gesture('rubChin', idle(gf, 2), env(f, 20, 1e9, 10, 1), f)} uid="h-l1" />;
			}}
		/>
	);
};

/* 002 the colourful houses on stilts; the polar-bear sign */
export const L002: React.FC = () => {
	const {f, gf} = useShot();
	const w8 = useW();
	const wk = walkTo(f, 0, w8('002', 0.85), -6, 2.5, 2, 0.12);
	return (
		<View3D
			make={makeTown()}
			fov={46}
			update={(w, ff, cam) => {
				const k = sm(ff / 210);
				look(cam, [-7 + 11 * k, 2.4, 9], [-6 + 12 * k, 2.2, -8]);
			}}
			overlay={(p) => {
				const a = standAt(p, wk.x, groundY(wk.x, -1), -1, H);
				return <Actor who="hero" x={a.x} floor={a.floor} s={a.s} facing={1} faceTurn={0.4} look={[0.6, 0]} pose={wk.moving ? wk.pose : idle(gf, 2)} vx={wk.vx * 50} bob={wk.bob} uid="h-l2" />;
			}}
			top={() => (
				<g>
					<Tag f={f} t={6} x={540} y={300} text="SVALBARD, NORWAY" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={46} rot={-3} />
					<Tag f={f} t={w8('002', 0.35)} x={540} y={410} text="≈ 2,400 PEOPLE" c="#11142c" fg="#ffd34a" size={50} rot={3} />
					<Tag f={f} t={w8('002', 0.7)} x={540} y={1560} text="POLAR BEARS" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={52} rot={-2} />
				</g>
			)}
		/>
	);
};

/* 003 the ground never thaws: the shovel hits ice */
export const L003: React.FC = () => {
	const {f, gf} = useShot();
	const w8 = useW();
	const hits = [w8('003', 0.25), w8('003', 0.6)];
	let dig = 0;
	for (const h of hits) {
		const t = f - h;
		if (t > -10 && t < 6) dig = t < 0 ? 1 - (t + 10) / 10 : 0;
	}
	const hx = -8.2;
	const hz = 4.6;
	return (
		<View3D
			make={makeTown(false, (s, w) => {
				w.shovel = makeShovel();
				s.add(w.shovel);
			})}
			fov={40}
			update={(w, ff, cam) => {
				const k = sm(ff / 120);
				look(cam, [-6.2 - 0.6 * k, 1.6, 9.5 - 1.2 * k], [-8.6, 0.9, 4]);
			}}
			overlay={(p, w) => {
				const a = standAt(p, hx, groundY(hx, hz), hz, H);
				// the shovel blade goes into the pit, the hands on the shaft
				const blade = new THREE.Vector3(-8.85, 0.05 + 0.5 * dig, 4.1);
				const top = new THREE.Vector3(-8.55, 1.15 + 0.4 * dig, 4.4);
				const sh = w.shovel!;
				sh.position.copy(blade).add(top).multiplyScalar(0.5);
				sh.lookAt(top);
				sh.rotateX(Math.PI / 2);
				sh.position.y += 0.05;
				const hand1 = p.p(top.x, top.y, top.z);
				const mid = p.p((top.x + blade.x) / 2 + 0.05, (top.y + blade.y) / 2 + 0.25, (top.z + blade.z) / 2);
				const pose: Pose = reach(reach({...idle(gf, 2), lean: 18}, 'F', toLocal(a, -1, mid.x, mid.y), 1), 'B', toLocal(a, -1, hand1.x, hand1.y), 1);
				return <Actor who="hero" x={a.x} floor={a.floor} s={a.s} facing={-1} faceTurn={0.4} look={[-0.5, 0.8]} expr={f > hits[0] ? 'worried' : 'normal'} pose={pose} uid="h-l3" />;
			}}
			top={() => (
				<g>
					{hits.map((h, i) => (f > h && f < h + 26 ? <Onoma key={i} x={420 + i * 120} y={1180} text="CLANK!" t={f - h} c="#9fd8ff" size={90} /> : null))}
					<Tag f={f} t={w8('003', 0.62)} x={540} y={330} text="PERMAFROST" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={60} rot={-3} />
					<Tag f={f} t={w8('003', 0.68)} x={540} y={440} text="FROZEN ALL YEAR" c="#11142c" fg="#ffffff" stroke="#9fd8ff" size={38} rot={2} />
				</g>
			)}
		/>
	);
};

/* 004 the tiny cemetery: no new burials since the 1950s */
export const L004: React.FC = () => {
	const {f, gf} = useShot();
	const w8 = useW();
	return (
		<View3D
			make={makeTown()}
			fov={42}
			update={(w, ff, cam) => {
				const k = sm(ff / 180);
				look(cam, [38.5 + 1.5 * k, 3.4, 5 - 1.5 * k], [40.5, 0.9, -10]);
			}}
			overlay={(p) => {
				const a = standAt(p, 38.4, groundY(38.4, -7.6), -7.6, H);
				return <Actor who="hero" x={a.x} floor={a.floor} s={a.s} facing={1} faceTurn={-0.2} look={[0.5, -0.2]} expr="sad" pose={idle(gf, 2)} uid="h-l4" />;
			}}
			top={() => (
				<g>
					<Tag f={f} t={w8('004', 0.1)} x={540} y={300} text="1950s" c="#11142c" fg="#ffd34a" size={60} rot={-3} />
					<Tag f={f} t={w8('004', 0.65)} x={540} y={1560} text="BODIES DON'T DECAY" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={46} rot={2} />
				</g>
			)}
		/>
	);
};

/* 005 1998: scientists in protective suits dig for traces of the 1918 flu */
export const L005: React.FC = () => {
	const {f, gf} = useShot();
	const w8 = useW();
	const dig = Math.abs(Math.sin(f / 9));
	return (
		<View3D
			make={makeTown(false, (s) => {
				const t = makeTent();
				t.position.set(46, groundY(46, -6), -6);
				t.rotation.y = 0.5;
				s.add(t);
			})}
			fov={42}
			update={(w, ff, cam) => {
				const k = sm(ff / 190);
				look(cam, [42 + 1.2 * k, 3.4, 4.5 - k], [42.5, 0.9, -9]);
			}}
			overlay={(p) => {
				const a = standAt(p, 41.2, groundY(41.2, -7.4), -7.4, H);
				const b = standAt(p, 43.4, groundY(43.4, -7.8), -7.8, H);
				return (
					<g>
						<Actor who="sci" x={a.x} floor={a.floor} s={a.s} facing={1} faceTurn={0.4} look={[0.5, 0.6]} pose={{...idle(gf, 3), lean: 20 * dig}} uid="sci-a" />
						<Actor who="sci" x={b.x} floor={b.floor} s={b.s} facing={-1} faceTurn={0.4} look={[-0.5, 0.4]} pose={gesture('point', idle(gf, 6), 1, f)} uid="sci-b" />
					</g>
				);
			}}
			top={() => (
				<g>
					<Tag f={f} t={4} x={540} y={300} text="1998" c="#11142c" fg="#ffd34a" size={64} rot={-3} />
					<Tag f={f} t={w8('005', 0.4)} x={540} y={420} text="1918 FLU VICTIMS" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={46} rot={3} />
					<Tag f={f} t={w8('005', 0.75)} x={540} y={1560} text="STILL PRESERVED" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={46} rot={-2} />
				</g>
			)}
		/>
	);
};

/* 006 seriously ill? you're flown to the mainland */
export const L006: React.FC = () => {
	const {f} = useShot();
	return (
		<View3D
			make={makeTown(false, (s, w) => {
				w.plane = makePlane();
				s.add(w.plane);
			})}
			fov={46}
			update={(w, ff, cam) => {
				const t = Math.max(0, ff - 10);
				const x = -150 + 0.012 * t * t * 3 + t * 0.2;
				const y = 1.6 + Math.max(0, t - 40) * Math.max(0, t - 40) * 0.006;
				w.plane!.position.set(x, y, -6);
				w.plane!.rotation.set(0, 0, Math.min(0.25, Math.max(0, t - 40) * 0.006));
				look(cam, [x - 6, 4, 22], [x + 4, y + 2, -6]);
			}}
			top={() => (
				<g>
					<Tag f={f} t={10} x={540} y={320} text="TO MAINLAND NORWAY" c="#11142c" fg="#ffd34a" size={50} rot={-3} />
				</g>
			)}
		/>
	);
};

/* 007 moms-to-be leave weeks before the due date */
export const L007: React.FC = () => {
	const {f, gf} = useShot();
	const w8 = useW();
	const wk = walkTo(f, 0, w8('007', 1.1), -138, -132.5, 4, 0.14);
	return (
		<View3D
			make={makeTown(false, (s, w) => {
				const pl = makePlane();
				pl.position.set(-126, 1.6, -9);
				pl.rotation.y = Math.PI;
				s.add(pl);
				w.suitcase = makeSuitcase3();
				s.add(w.suitcase);
			})}
			fov={42}
			update={(w, ff, cam) => {
				const k = sm(ff / 150);
				look(cam, [-136 + 1.6 * k, 1.9, 4.2], [-134.6 + 1.6 * k, 1.3, -5]);
			}}
			overlay={(p, w) => {
				const a = standAt(p, wk.x, 0.33, -4.5, 1.65);
				const handW = new THREE.Vector3(wk.x - 0.35, 0.33, -4.4);
				w.suitcase!.position.copy(handW).setY(0.33);
				w.suitcase!.rotation.set(0, 0.3, 0);
				const top = p.p(handW.x, 0.33 + 0.62, handW.z);
				const pose = reach(wk.moving ? wk.pose : idle(gf, 4), 'B', toLocal(a, 1, top.x, top.y), 1);
				return <Actor who="mom" x={a.x} floor={a.floor} s={a.s} facing={1} faceTurn={0.4} look={[0.5, 0]} mouth="smile" pose={pose} vx={wk.vx * 50} bob={wk.bob} uid="mom-l7" />;
			}}
			top={() => (
				<g>
					<Tag f={f} t={6} x={540} y={300} text="NO MATERNITY WARD" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={44} rot={-3} />
					<Tag f={f} t={w8('007', 0.55)} x={540} y={1560} text="LEAVE WEEKS EARLY" c="#11142c" fg="#ffd34a" size={50} rot={2} />
				</g>
			)}
		/>
	);
};

/* 008 not actually a law — under the northern lights */
export const L008: React.FC = () => {
	const {f, gf} = useShot();
	const w8 = useW();
	return (
		<View3D
			make={makeTown(true)}
			fov={46}
			update={(w, ff, cam) => {
				const k = sm(ff / 160);
				look(cam, [2, 1.8, 10 - 1.5 * k], [1, 3.6, -6]);
			}}
			overlay={(p) => {
				const a = standAt(p, 1.4, groundY(1.4, 1), 1, H);
				return (
					<g>
						{/* aurora ribbons */}
						{[0, 1, 2].map((i) => (
							<path key={i} d={`M-100,${300 + i * 90} C200,${180 + i * 80 + Math.sin(f / 20 + i) * 60} 600,${420 + i * 60 + Math.cos(f / 24 + i) * 60} 1180,${260 + i * 90}`} stroke={['#4cff9a', '#3fe0c8', '#a07aff'][i]} strokeWidth={70 - i * 18} opacity={0.22} fill="none" style={{filter: 'blur(14px)'}} />
						))}
						<Actor who="hero" x={a.x} floor={a.floor} s={a.s} facing={1} faceTurn={0.2} look={[0.2, -0.4]} mouth="smile" pose={gesture('shrug', idle(gf, 2), env(f, w8('008', 0.1), w8('008', 0.6), 10, 12), f)} uid="h-l8" />
					</g>
				);
			}}
			top={() => (
				<g>
					<Tag f={f} t={w8('008', 0.05)} x={540} y={320} text="NOT ACTUALLY A LAW" c="#11142c" fg="#9ff0b0" stroke="#3fcf7a" size={48} rot={-3} />
				</g>
			)}
		/>
	);
};

/* 009 the question */
export const L009: React.FC = () => {
	const {f, gf} = useShot();
	return (
		<View3D
			make={makeTown(true)}
			fov={44}
			update={(w, ff, cam) => {
				const k = sm(ff / 120);
				look(cam, [1.5, 1.6, 6.5 - k], [1.2, 1.7, 0]);
			}}
			overlay={(p) => {
				const a = standAt(p, 1.6, groundY(1.6, 1), 1, H);
				return <Actor who="hero" x={a.x} floor={a.floor} s={a.s} facing={1} faceTurn={0.1} look={[0, 0]} mouth="smile" pose={gesture('presentF', idle(gf, 2), env(f, 6, 1e9, 10, 1), f)} uid="h-l9" />;
			}}
			top={() => (
				<g transform={`translate(540,330) scale(${pop(f, 4)})`}>
					<text textAnchor="middle" fontSize={96} fontFamily={FONT} fontWeight={900} fill="#fff" stroke="#11142c" strokeWidth={14} paintOrder="stroke">
						WOULD YOU
					</text>
					<text y={110} textAnchor="middle" fontSize={96} fontFamily={FONT} fontWeight={900} fill="#ffd34a" stroke="#11142c" strokeWidth={14} paintOrder="stroke">
						LIVE HERE?
					</text>
				</g>
			)}
		/>
	);
};

const Dummy: React.FC = () => null;
export const SHOTS_L: ShotDef[] = [
	{at: '001', C: Dummy, V: L001},
	{at: '002', C: Dummy, V: L002, whip: true},
	{at: '003', C: Dummy, V: L003, whip: true},
	{at: '004', C: Dummy, V: L004, whip: true},
	{at: '005', C: Dummy, V: L005, whip: true},
	{at: '006', C: Dummy, V: L006, whip: true},
	{at: '007', C: Dummy, V: L007, whip: true},
	{at: '008', C: Dummy, V: L008, whip: true},
	{at: '009', C: Dummy, V: L009, whip: true},
];
export {Lying};
