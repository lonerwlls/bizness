import React from 'react';
import {interpolate, random} from 'remotion';
import * as THREE from 'three';
import {Pose} from '../engine/Stickman';
import {SIT, env, gesture, idle, reach, walkTo} from '../kit/actions';
import {Actor, useShot} from '../kit/core';
import {HeroBadge, clamp, ease, flash} from '../kit/kit';
import {Bubble, FONT} from '../kit/ui';
import {Onoma} from '../reference/PauseTime';
import {Lying, Tag, pop, useW} from './lib';
import {View3D, World, dressScene, standAt, toLocal} from '../three/View3D';
import {makeCabin, makeCart, makeChunk, makeCloud, makeDebris, makeJet, makePine, makeRidge, makeSlope} from '../three/models';
import {flat, skyTexture, toon} from '../three/toon';

/* The 3D shots of the Vesna short (native 9:16). Stickmen stand in the 3D world via proj. */

const DUSK: [number, string][] = [
	[0, '#1d2560'],
	[0.55, '#8a5a9a'],
	[1, '#f2a07a'],
];
const DAY: [number, string][] = [
	[0, '#6a9ad8'],
	[0.6, '#b8d2ea'],
	[1, '#e8f0f6'],
];
const sm = (k: number) => interpolate(k, [0, 1], [0, 1], {...clamp, easing: ease});
const look = (cam: THREE.PerspectiveCamera, p: [number, number, number], t: [number, number, number], roll = 0) => {
	cam.position.set(...p);
	cam.up.set(Math.sin(roll), Math.cos(roll), 0);
	cam.lookAt(...t);
};
const Wind: React.FC<{f: number; n?: number; speed?: number; o?: number}> = ({f, n = 26, speed = 60, o = 0.4}) => (
	<g>
		{Array.from({length: n}).map((_, i) => {
			const y = ((random('wy' + i) * 2200 - f * speed * (0.7 + random('wv' + i) * 0.6)) % 2200 + 2200) % 2200 - 140;
			const x = random('wx' + i) * 1080;
			return <line key={i} x1={x} y1={y} x2={x} y2={y + 160 + random('wl' + i) * 140} stroke="#fff" strokeWidth={3} opacity={o * (0.5 + random('wo' + i) * 0.5)} />;
		})}
	</g>
);

/* ---------------- the sky world: clouds that rush up past a falling camera ---------------- */
type SkyW = World & {clouds: THREE.Group[]; chunk?: THREE.Group; jet?: ReturnType<typeof makeJet>; debris?: THREE.Group; boom?: THREE.Group};
const makeSky = (opts: {chunk?: boolean; jet?: boolean; debris?: boolean}) => (): SkyW => {
	const scene = dressScene(new THREE.Scene(), {sky: skyTexture(DUSK), fog: ['#b88aa0', 40, 260], sun: [-8, 4, 10], sunColor: '#ffd2a8', sunI: 2.6, hemi: ['#ffe8f0', '#5a4a8a', 1.4]});
	const clouds: THREE.Group[] = [];
	for (let i = 0; i < 22; i++) {
		const c = makeCloud(i + 3, 1.2 + random('cs' + i) * 1.6);
		c.position.set((random('cx' + i) - 0.5) * 120, (random('cy' + i) - 0.5) * 160, -10 - random('cz' + i) * 110);
		c.userData.base = c.position.clone();
		scene.add(c);
		clouds.push(c);
	}
	const w: SkyW = {scene, clouds};
	if (opts.chunk) {
		w.chunk = makeChunk();
		scene.add(w.chunk);
	}
	if (opts.jet) {
		w.jet = makeJet();
		scene.add(w.jet.jet);
		const boom = new THREE.Group();
		const cols = ['#fff3a0', '#ffd34a', '#ff8a3a', '#e4473c', '#ff6a3a'];
		for (let i = 0; i < 9; i++) {
			const s = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), flat(cols[i % 5], {transparent: true}));
			s.userData.dir = new THREE.Vector3(random('bx' + i) - 0.5, random('by' + i) - 0.6, random('bz' + i) - 0.5).normalize();
			boom.add(s);
		}
		for (let i = 0; i < 7; i++) {
			const s = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), toon('#3a3044', {transparent: true}));
			s.userData.smoke = true;
			s.userData.dir = new THREE.Vector3(random('sx' + i) - 0.5, random('sy' + i) - 0.3, random('sz' + i) - 0.5).normalize();
			boom.add(s);
		}
		boom.visible = false;
		w.boom = boom;
		scene.add(boom);
	}
	if (opts.debris) {
		w.debris = makeDebris(26, 5);
		scene.add(w.debris);
	}
	return w;
};
/* clouds drift past: rise = how far the world has moved up past us (falling) */
const driftClouds = (w: SkyW, rise: number, side = 0) => {
	for (const c of w.clouds) {
		const b = c.userData.base as THREE.Vector3;
		c.position.set(b.x - side, ((b.y + rise + 80) % 160 + 160) % 160 - 80, b.z);
	}
};
const spinDebris = (g: THREE.Group, f: number, spread: number, center: THREE.Vector3) => {
	g.children.forEach((d, i) => {
		const v = d.userData.v as number[];
		const s = d.userData.s as number[];
		d.position.set(center.x + v[0] * spread, center.y + v[1] * spread + Math.sin(f / 20 + i) * 0.5, center.z + v[2] * spread);
		d.rotation.set(f * 0.02 * s[0], f * 0.02 * s[1], f * 0.02 * s[2]);
	});
};

/* 001 hook: the torn middle of the plane tumbles down through the clouds */
export const S001: React.FC = () => {
	const {f} = useShot();
	return (
		<View3D
			make={makeSky({chunk: true, debris: true})}
			fov={42}
			update={(w, ff, cam) => {
				driftClouds(w, ff * 0.9);
				w.chunk!.rotation.set(0.35 + ff * 0.006, 0.5 + ff * 0.004, -0.55 + Math.sin(ff / 25) * 0.12);
				w.chunk!.position.set(0, Math.sin(ff / 30) * 0.3, 0);
				spinDebris(w.debris!, ff, 9 + ff * 0.02, new THREE.Vector3(0, 2, 0));
				const k = sm(ff / 140);
				look(cam, [10 - 3 * k, -7 + 1 * k, 21 - 4 * k], [0, -0.5, 0], 0.08 + Math.sin(ff / 18) * 0.02);
			}}
			top={() => (
				<g>
					<Wind f={f} speed={70} o={0.35} />
					<HeroBadge x={540} y={560} s={1.0} />
				</g>
			)}
		/>
	);
};

/* ---------------- the cabin world (cut away, camera on +z) ---------------- */
type CabW = World & {cart: THREE.Group; cartF?: THREE.Group};
const makeCab = (cartFront = false) => (): CabW => {
	const scene = dressScene(new THREE.Scene(), {sky: skyTexture([[0, '#2a2240'], [1, '#4a3a5a']]), sun: [-4, 6, 8], sunColor: '#ffe0c0', sunI: 2.2, hemi: ['#fff0e0', '#6a5a7a', 1.5]});
	scene.add(makeCabin(16));
	const cart = makeCart();
	const w: CabW = {scene, cart};
	if (cartFront) {
		const front = dressScene(new THREE.Scene(), {sun: [-4, 6, 8], sunColor: '#ffe0c0', sunI: 2.2, hemi: ['#fff0e0', '#6a5a7a', 1.5]});
		front.add(cart);
		w.front = front;
	} else scene.add(cart);
	return w;
};
const ROWS = [-6.6, -5.78, -4.96, -4.14, -3.32, -2.5, -1.68, -0.86, -0.04, 0.78, 1.6, 2.42, 3.24, 4.06, 4.88, 5.7, 6.52];
const PAX = ['p0', 'p1', 'p2', 'p3', 'p4', 'p5'];
const paxLook = (i: number) => ({
	color: ['#3aa37a', '#7a5cc4', '#c98a3a', '#3d6fd6', '#8a5a3a', '#5a6a7a'][i % 6],
	head: 'peach' as const,
	skin: ['#f2c9a5', '#e8b48a', '#c98a5a', '#f6d7bd', '#a86b45', '#f2d0b5'][i % 6],
	hair: (['short', 'bob', 'grey', 'cap', 'ponytail', 'short'] as const)[i % 6],
	hairColor: ['#3a2418', '#2a1a12', '#d9d9e0', '#2a2f4a', '#6a3a1a', '#1d1d24'][i % 6],
	rim: '#fff0e0',
	rimW: 2.2,
	shoe: '#2a2633',
	legColor: '#2a2f4a',
});
/* passengers in the aisle seats (seat centre x = row + 0.4) */
const Passengers: React.FC<{p: Parameters<NonNullable<Parameters<typeof View3D>[0]['overlay']>>[0]; gf: number; from: number; to: number; skip?: number[]}> = ({p, gf, from, to, skip = []}) => (
	<g>
		{ROWS.map((r, i) => {
			const x = r + 0.4;
			if (x < from || x > to || skip.includes(i)) return null;
			const a = standAt(p, x + 0.02, -0.43, -0.55);
			return (
				<g key={i}>
					<Stickmanish i={i} a={a} gf={gf} />
				</g>
			);
		})}
	</g>
);
const Stickmanish: React.FC<{i: number; a: {x: number; floor: number; s: number}; gf: number}> = ({i, a, gf}) => (
	<Actor who="vesna" {...paxLook(i)} acc={[]} outfit="tee" x={a.x} floor={a.floor} seat={a.floor} s={a.s} facing={1} faceTurn={0.5} look={[0.6, 0]} expr="sleepy" pose={{...SIT, armF: [40, 60], armB: [30, 60]}} uid={'pax' + i} hic={false} />
);

/* 002 «Nineteen seventy-two. … wasn't even meant to work this flight. They'd mixed her up…» */
export const S002: React.FC = () => {
	const {f, gf} = useShot();
	const w8 = useW();
	const wk = walkTo(f, 0, w8('002', 0.55), -1.9, -0.2, 2, 0.16);
	const vx = wk.x; // metres along the aisle
	return (
		<View3D
			make={makeCab(true)}
			fov={40}
			update={(w, ff, cam) => {
				w.cart.position.set(vx + 0.78, -0.95, 0.18);
				w.cart.rotation.y = Math.PI;
				const k = sm(ff / 200);
				look(cam, [vx + 0.6 + 0.3 * k, 0.15 - 0.1 * k, 6.6 - 0.8 * k], [vx + 0.5, -0.05, -0.4]);
			}}
			overlay={(p) => {
				const a = standAt(p, vx, -0.95, 0.18);
				const h = p.p(vx + 0.36, 0.0, 0.18); // the trolley handle
				const pose = reach(reach(wk.moving ? wk.pose : idle(gf, 2), 'F', toLocal(a, 1, h.x, h.y), 1), 'B', toLocal(a, 1, h.x - 6, h.y + 4), 1);
				return (
					<g>
						<Passengers p={p} gf={gf} from={vx - 3} to={vx + 3} skip={[9]} />
						<Actor who="vesna" x={a.x} floor={a.floor} s={a.s} facing={1} faceTurn={0.5} look={[0.6, 0]} mouth="smile" pose={pose} vx={wk.vx * 60} bob={wk.bob} uid="v-cab3" />
					</g>
				);
			}}
			top={() => (
				<g>
					<Tag f={f} t={6} x={540} y={300} text="JANUARY 1972" c="#11142c" fg="#ffd34a" size={52} rot={-4} until={w8('002', 0.5)} />
					<Tag f={f} t={w8('002', 0.52)} x={540} y={330} text="NOT ON THE SCHEDULE" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={44} rot={3} />
					{f > w8('002', 0.75) ? (
						<Bubble x={560} y={480} w={520} h={120} t={f - w8('002', 0.75)} tail={[-40, 100]} thought>
							<text y={16} textAnchor="middle" fontSize={50} fontFamily={FONT} fontWeight={900} fill="#13203a">
								wrong Vesna!
							</text>
						</Bubble>
					) : null}
				</g>
			)}
		/>
	);
};

/* 003 the jet at cruise height, a bomb goes off in the luggage hold */
export const S003: React.FC = () => {
	const {f} = useShot();
	const w8 = useW();
	const bt = w8('003', 0.45);
	return (
		<View3D
			make={makeSky({jet: true})}
			fov={40}
			update={(w, ff, cam) => {
				driftClouds(w, 0, ff * 0.6);
				const j = w.jet!;
				const shake = ff > bt ? Math.exp(-(ff - bt) / 10) : 0;
				j.jet.position.set(0, Math.sin(ff * 2.1) * 0.4 * shake, 0);
				j.jet.rotation.set(0.04 + Math.sin(ff * 1.7) * 0.05 * shake, 0, 0.03 + 0.12 * (ff > bt ? 1 - Math.exp(-(ff - bt) / 14) : 0));
				const b = w.boom!;
				const k = ff - bt;
				b.visible = k > 0;
				b.position.set(-1.5, -1.6, 1.2);
				b.children.forEach((s, i) => {
					const d = s.userData.dir as THREE.Vector3;
					const g = Math.max(0, k);
					const r = s.userData.smoke ? 0.4 + g * 0.09 : (0.6 + g * 0.22) * (1 - Math.min(1, g / 40));
					s.scale.setScalar(Math.max(0.01, r * (1 + (i % 3) * 0.3)));
					s.position.copy(d).multiplyScalar(g * (s.userData.smoke ? 0.08 : 0.12));
					((s as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = s.userData.smoke ? Math.min(0.85, g / 10) : Math.max(0, 1 - g / 36);
				});
				const kk = sm(ff / 90);
				look(cam, [26 - 6 * kk, -8 + 2 * kk, 30 - 6 * kk], [-2, 0, 0], -0.06);
			}}
			top={() => (
				<g>
					<Tag f={f} t={4} x={540} y={420} text="33,000 FT" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={56} rot={-3} until={bt} />
					{f > bt && f < bt + 30 ? <Onoma x={540} y={520} text="BOOM!" t={f - bt} c="#ffd34a" size={150} /> : null}
					{flash(f, bt, 8) > 0 ? <rect x={0} y={0} width={1080} height={1920} fill="#fff2c8" opacity={flash(f, bt, 8)} /> : null}
				</g>
			)}
		/>
	);
};

/* 004 the plane breaks apart; nose and tail spin away, the middle tumbles */
export const S004: React.FC = () => {
	const {f} = useShot();
	const w8 = useW();
	return (
		<View3D
			make={makeSky({jet: true, debris: true})}
			fov={44}
			update={(w, ff, cam) => {
				const k = sm(ff / 60);
				const t = ff / 30;
				driftClouds(w, ff * 0.5 * k, ff * 0.3);
				const j = w.jet!;
				j.jet.rotation.set(0, 0, 0.12);
				j.front.position.set(8 * t, -2 * t * t, 1.5 * t);
				j.front.rotation.set(0.3 * t, 0, -0.5 * t);
				j.tail.position.set(-7 * t, -3 * t * t, -1.5 * t);
				j.tail.rotation.set(-0.4 * t, 0.2 * t, 0.7 * t);
				j.mid.position.set(0, -1.6 * t * t, 0);
				j.mid.rotation.set(0.5 * t, 0.15 * t, -0.35 * t);
				spinDebris(w.debris!, ff, 2 + 8 * k, new THREE.Vector3(0, -1.2 * t * t, 0));
				look(cam, [18 - 4 * k, -4 - 2 * k, 34 - 6 * k], [0, -1.2 * t * t, 0], 0.05);
			}}
			top={() => (
				<g>
					<HeroBadge x={540} y={330} s={1.0} />
					<Tag f={f} t={w8('004', 0.35)} x={540} y={1560} text="EVERYONE ELSE DIED" c="#3a1d2a" fg="#ff9a8a" stroke="#ff6a5a" size={50} rot={-2} />
				</g>
			)}
		/>
	);
};

/* 004b inside the falling piece: the cabin tilts and shakes, the trolley pins her down */
export const S004b: React.FC = () => {
	const {f, gf} = useShot();
	return (
		<View3D
			make={() => {
				const w = makeCab(true)();
				w.scene.background = skyTexture(DUSK);
				const cl = new THREE.Group();
				for (let i = 0; i < 10; i++) {
					const c = makeCloud(i + 40, 1.5);
					c.position.set((random('ix' + i) - 0.5) * 60, (random('iy' + i) - 0.5) * 80, -30 - random('iz' + i) * 40);
					c.userData.base = c.position.clone();
					cl.add(c);
				}
				w.scene.add(cl);
				(w as CabW & {cl: THREE.Group}).cl = cl;
				return w;
			}}
			fov={50}
			update={(w, ff, cam) => {
				const roll = 0.32 + Math.sin(ff / 9) * 0.06;
				const sh = Math.sin(ff * 2.3) * 0.03;
				(w as CabW & {cl: THREE.Group}).cl.children.forEach((c) => {
					const b = c.userData.base as THREE.Vector3;
					c.position.set(b.x, ((b.y + ff * 1.4 + 40) % 80) - 40, b.z);
				});
				// the trolley tipped over, lying across her legs
				w.cart.position.set(-0.05, -0.95, 0.3);
				w.cart.rotation.set(0, 0, 1.15);
				look(cam, [0.1 + sh, 0.3 + sh, 3.4], [0.1, -0.7, 0], roll);
			}}
			overlay={(p) => {
				const a = p.p(0.15, -0.86, 0.2);
				const ang = p.angle([-1, -0.86, 0.2], [1, -0.86, 0.2]);
				return (
					<g>
						<Lying who="vesna" x={a.x} y={a.y} s={p.sOf(a.d)} rot={90 + ang} f={gf} id="v-pin3" expr="sleepy" pose={{lean: 0, head: -6, armB: [-60 + Math.sin(gf / 5) * 10, 20], armF: [70 + Math.sin(gf / 4) * 12, 30], legB: [0, 0], legF: [4, 0]}} />
					</g>
				);
			}}
			top={() => (
				<g>
					<Wind f={f} speed={80} o={0.3} />
					<HeroBadge x={540} y={330} s={1.0} />
					<Tag f={f} t={20} x={540} y={1500} text="PINNED BY A FOOD CART" c="#11142c" fg="#ffd34a" size={44} rot={3} />
				</g>
			)}
		/>
	);
};

/* ---------------- the snowy wooded mountainside ---------------- */
const TILT = 0.32; // the slope rises away from the camera
const gy = (x: number, z: number) => -z * Math.tan(TILT) + Math.sin(x * 0.11) * 0.25;
type SnowW = World & {chunk: THREE.Group; snow: THREE.Group};
const makeSnow = (): SnowW => {
	const scene = dressScene(new THREE.Scene(), {sky: skyTexture(DAY), fog: ['#dce6f2', 30, 160], sun: [-10, 14, 8], sunColor: '#fff4e0', sunI: 2.2, hemi: ['#ffffff', '#8aa0c8', 1.6]});
	const slope = makeSlope();
	slope.rotation.x = -Math.PI / 2 + TILT;
	scene.add(slope);
	scene.add(makeRidge(3, '#9aaccc', -120, 40), makeRidge(5, '#b8c6dc', -90, 24));
	for (let i = 0; i < 70; i++) {
		const x = (random('px' + i) - 0.5) * 70;
		const z = -random('pz' + i) * 60 + 6;
		if (Math.abs(x - 2) < 3 && z > -6) continue; // keep the landing spot open
		const t = makePine(5 + random('ph' + i) * 4, i + 9);
		t.position.set(x, gy(x, z) - 0.2, z);
		scene.add(t);
	}
	const chunk = makeChunk();
	scene.add(chunk);
	const snow = new THREE.Group();
	for (let i = 0; i < 40; i++) {
		const s = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), toon('#ffffff', {transparent: true}));
		s.userData.noInk = true;
		s.userData.dir = new THREE.Vector3(random('sdx' + i) - 0.3, random('sdy' + i) * 0.9 + 0.3, random('sdz' + i) - 0.5).normalize();
		snow.add(s);
	}
	scene.add(snow);
	return {scene, chunk, snow};
};
const REST = new THREE.Vector3(6, 0, -4);

/* 005 the piece hits the slope at an angle and slides into the pines */
export const S005: React.FC = () => {
	const {f} = useShot();
	const w8 = useW();
	const hit = w8('005', 0.4);
	return (
		<View3D
			make={makeSnow}
			fov={50}
			update={(w, ff, cam) => {
				const k = Math.min(1, ff / hit);
				const after = Math.max(0, ff - hit);
				const slide = 1 - Math.exp(-after / 16);
				const ix = -2;
				const iz = -6;
				let pos: THREE.Vector3;
				if (ff < hit) pos = new THREE.Vector3(ix - 16 * (1 - k), gy(ix, iz) + 1.6 + 22 * (1 - k) * (1 - k), iz - 4 * (1 - k));
				else pos = new THREE.Vector3(ix + (REST.x - ix) * slide, gy(ix + (REST.x - ix) * slide, iz + (REST.z - iz) * slide) + 1.6, iz + (REST.z - iz) * slide);
				w.chunk.position.copy(pos);
				w.chunk.rotation.set(0.15, -0.5 + 0.3 * slide, ff < hit ? -0.9 + 0.5 * k : -0.4 + 0.25 * slide);
				w.snow.visible = after > 0;
				w.snow.children.forEach((s, i) => {
					const d = s.userData.dir as THREE.Vector3;
					const t = after / 30;
					s.position.set(ix + 2 + d.x * 14 * t, gy(ix, iz) + 0.5 + d.y * 12 * t - 9 * t * t, iz + d.z * 8 * t);
					s.scale.setScalar(0.4 + (i % 4) * 0.25 + t * 0.8);
					((s as THREE.Mesh).material as THREE.MeshToonMaterial).opacity = Math.max(0, 1 - t * 0.9);
				});
				const shake = after > 0 ? Math.exp(-after / 8) : 0;
				const sx = Math.sin(ff * 3.1) * 0.5 * shake;
				look(cam, [7 + sx, 5 + sx, 21], [-1.5, 3.5, -6], 0.04);
			}}
			top={() => (
				<g>
					<HeroBadge x={540} y={330} s={1.0} />
					{f > hit && f < hit + 30 ? <Onoma x={540} y={700} text="CRASH!" t={f - hit} c="#ffffff" size={140} /> : null}
					<Tag f={f} t={hit + 10} x={540} y={1560} text="JUST THE RIGHT ANGLE" c="#11142c" fg="#9ff0b0" stroke="#9ff0b0" size={46} rot={-3} />
				</g>
			)}
		/>
	);
};

/* 006 a villager, once a wartime medic, kneels by her in the snow */
export const S006: React.FC = () => {
	const {f, gf} = useShot();
	const w8 = useW();
	// Vesna in the snow in front of the wreck; Bruno comes from the right and kneels BEHIND her
	const VX = 3.2;
	const VZ = 1.5;
	const BZ = 0.8;
	const wk = walkTo(f, 0, w8('006', 0.42), 7.2, 3.7, 4, 0.34);
	const kneel = env(f, w8('006', 0.42), 1e9, 14, 1);
	return (
		<View3D
			make={() => {
				const w = makeSnow();
				w.chunk.position.set(9, gy(9, -10) + 1.6, -10);
				w.chunk.rotation.set(0.12, -0.9, -0.12);
				w.snow.visible = false;
				return w;
			}}
			fov={40}
			update={(w, ff, cam) => {
				const k = sm(ff / 90);
				look(cam, [3.4 - 0.3 * k, gy(3.4, VZ) + 0.85, 7.2 - 0.8 * k], [4.2, gy(4.2, VZ) + 0.9, -4]);
			}}
			overlay={(p) => {
				const b = standAt(p, wk.x, gy(wk.x, BZ), BZ);
				const base = wk.moving ? wk.pose : idle(gf, 4);
				// kneeling: shins on the snow, leaning over her
				const kneelPose: Pose = {...base, lean: base.lean + 26 * kneel, head: base.head + 14 * kneel, legF: [base.legF[0] + (6 - base.legF[0]) * kneel, base.legF[1] + (100 - base.legF[1]) * kneel], legB: [base.legB[0] + (-10 - base.legB[0]) * kneel, base.legB[1] + (96 - base.legB[1]) * kneel]};
				const v = p.p(VX, gy(VX, VZ) + 0.12, VZ);
				const reachP = p.p(VX + 0.1, gy(VX, VZ) + 0.3, VZ);
				const bp = reach(kneelPose, 'F', toLocal({x: b.x, floor: b.floor + 70 * b.s * kneel, s: b.s}, -1, reachP.x, reachP.y), kneel);
				const ang = p.angle([VX - 1, gy(VX - 1, VZ), VZ], [VX + 1, gy(VX + 1, VZ), VZ]);
				return (
					<g>
						<Actor who="bruno" x={b.x} floor={b.floor} seat={b.floor - 157 * b.s + 70 * b.s * kneel} s={b.s} facing={-1} faceTurn={0.4} look={[-0.6, 0.8]} expr="worried" mouth="open" pose={bp} vx={wk.vx * 60} bob={wk.bob} uid="bruno3" />
						<Lying who="vesna" x={v.x} y={v.y} s={p.sOf(v.d)} rot={90 + ang} f={gf} id="v-snow3" expr="sleepy" />
					</g>
				);
			}}
			top={() => (
				<g>
					<Tag f={f} t={w8('006', 0.2)} x={540} y={330} text="FORMER WAR MEDIC" c="#11142c" fg="#ffd34a" size={48} rot={3} />
					<Tag f={f} t={w8('006', 0.75)} x={540} y={450} text="ALIVE" c="#1d3a2a" fg="#9ff0b0" stroke="#3fcf7a" size={64} rot={-4} />
				</g>
			)}
		/>
	);
};

/* 009b she remembers nothing, so she isn't afraid to fly: a passenger, smiling */
export const S009b: React.FC = () => {
	const {f, gf} = useShot();
	const SX = 0.4 + 0.4; // her aisle seat (row -0.04 → x 0.36)
	return (
		<View3D
			make={() => {
				const w = makeCab(false)();
				w.cart.visible = false;
				return w;
			}}
			fov={40}
			update={(w, ff, cam) => {
				const k = sm(ff / 120);
				look(cam, [0.6 + 0.2 * k, 0.1, 3.6 - 0.5 * k], [0.4, -0.2, -0.5]);
			}}
			overlay={(p) => {
				const a = standAt(p, 0.38, -0.43, -0.55);
				return (
					<g>
						<Passengers p={p} gf={gf} from={-3} to={4} skip={[8]} />
						<Actor who="vesna" x={a.x} floor={a.floor} seat={a.floor} s={a.s} facing={1} faceTurn={0.6} look={[0.5, -0.2]} mouth="smile" pose={{...SIT, armF: [40, 60]}} uid="v-seat3" />
					</g>
				);
			}}
			top={() => (
				<g>
					<Bubble x={720} y={470} w={240} h={170} t={f - 6} tail={[-70, 140]} thought>
						<text y={40} textAnchor="middle" fontSize={130} fontFamily={FONT} fontWeight={900} fill="#13203a">
							?
						</text>
					</Bubble>
					<Tag f={f} t={20} x={540} y={1560} text="REMEMBERS NOTHING" c="#11142c" fg="#9fd8ff" stroke="#9fd8ff" size={48} rot={2} />
				</g>
			)}
		/>
	);
};

/* 011 the question, a jet crossing the sunset */
export const S011: React.FC = () => {
	const {f} = useShot();
	return (
		<View3D
			make={makeSky({jet: true})}
			fov={40}
			update={(w, ff, cam) => {
				driftClouds(w, 0, ff * 0.4);
				w.jet!.jet.position.set(-30 + ff * 0.5, 4, -20);
				w.jet!.jet.rotation.set(0.05, 0.25, 0.04);
				look(cam, [0, -6, 40], [0, 2, 0]);
			}}
			top={() => (
				<g transform={`translate(540,1200) scale(${pop(f, 4)})`}>
					<text textAnchor="middle" fontSize={110} fontFamily={FONT} fontWeight={900} fill="#fff" stroke="#11142c" strokeWidth={16} paintOrder="stroke">
						WOULD YOU
					</text>
					<text y={130} textAnchor="middle" fontSize={110} fontFamily={FONT} fontWeight={900} fill="#ffd34a" stroke="#11142c" strokeWidth={16} paintOrder="stroke">
						FLY AGAIN?
					</text>
				</g>
			)}
		/>
	);
};
export {SIT, gesture};
