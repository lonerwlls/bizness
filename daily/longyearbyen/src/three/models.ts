import * as THREE from 'three';
import {flat, ink, mesh, noInk, paint, rnd, toon} from './toon';

/* Models for the Vesna short, built from simple shapes (metres). Plane: a DC-9 (T-tail,
   two engines on the rear fuselage), white with a blue stripe, 1972. */

const R = 1.65; // fuselage radius
const WHITE = '#f4f5f8';
const BLUE = '#2f5fa8';
const CABIN = '#e9dfc6';
const SEAT = '#c0503a';

/* fuselage skin texture: u = around (u≈0.96 / 0.54 = the two sides, slightly above the middle), v = along */
const skin = (len: number) =>
	paint(512, 1024, (c) => {
		c.fillStyle = WHITE;
		c.fillRect(0, 0, 512, 1024);
		// blue stripe just under the windows on both sides
		c.fillStyle = BLUE;
		for (const u of [0.0, 0.465]) c.fillRect(u * 512, 0, (u ? 0.05 : 0.035) * 512, 1024);
		c.fillRect(0.985 * 512, 0, 0.015 * 512, 1024);
		// windows (one every ~0.9 m)
		const n = Math.floor(len / 0.9);
		c.fillStyle = '#26324e';
		for (const u of [0.935, 0.565])
			for (let i = 0; i < n; i++) {
				const y = ((i + 0.5) / n) * 1024;
				c.beginPath();
				c.ellipse(u * 512 + 7, y, 6, (1024 / n) * 0.22, 0, 0, Math.PI * 2);
				c.fill();
			}
		// panel lines
		c.strokeStyle = 'rgba(40,50,80,0.25)';
		c.lineWidth = 2;
		for (let i = 1; i < 6; i++) {
			c.beginPath();
			c.moveTo(0, (i / 6) * 1024);
			c.lineTo(512, (i / 6) * 1024);
			c.stroke();
		}
	});

/* one tube segment along x from x0 to x1; open = show a torn end + cabin inside */
const tube = (x0: number, x1: number, open: boolean) => {
	const g = new THREE.Group();
	const len = x1 - x0;
	const geo = new THREE.CylinderGeometry(R, R, len, 40, 1, open);
	geo.rotateZ(-Math.PI / 2);
	const outer = mesh(geo, toon(WHITE, {map: skin(len), side: open ? THREE.FrontSide : THREE.FrontSide}), [(x0 + x1) / 2, 0, 0]);
	g.add(outer);
	if (open) {
		const inGeo = new THREE.CylinderGeometry(R - 0.08, R - 0.08, len, 40, 1, true);
		inGeo.rotateZ(-Math.PI / 2);
		const inner = mesh(inGeo, toon(CABIN, {side: THREE.BackSide}), [(x0 + x1) / 2, 0, 0]);
		inner.userData.noInk = true;
		g.add(inner);
		// cabin floor
		g.add(noInk(mesh(new THREE.BoxGeometry(len, 0.08, 2.9), toon('#6a5a7a'), [(x0 + x1) / 2, -0.95, 0])));
	}
	return g;
};
/* torn edge: jagged bent panels around an open end at x */
const tornEdge = (x: number, dir: 1 | -1, seed: number) => {
	const g = new THREE.Group();
	const r = rnd(seed);
	for (let i = 0; i < 16; i++) {
		const a = (i / 16) * Math.PI * 2 + r() * 0.2;
		const l = 0.3 + r() * 0.9;
		const p = mesh(new THREE.BoxGeometry(l, 0.06, 0.5 + r() * 0.4), toon(WHITE), [x + dir * l * 0.4, Math.cos(a) * R, Math.sin(a) * R]);
		p.rotation.x = -a;
		p.rotation.z = dir * (r() - 0.5) * 0.9;
		g.add(p);
	}
	return g;
};
/* an airliner seat facing +x, origin on the floor at the seat centre */
export const makeSeat = (color = SEAT) => {
	const g = new THREE.Group();
	const m = toon(color);
	g.add(mesh(new THREE.BoxGeometry(0.5, 0.14, 0.46), m, [0, 0.45, 0]));
	g.add(mesh(new THREE.BoxGeometry(0.14, 0.72, 0.46), m, [-0.25, 0.85, 0], [0, 0, -0.12]));
	g.add(mesh(new THREE.BoxGeometry(0.06, 0.24, 0.47), toon('#f2ead8'), [-0.29, 1.1, 0], [0, 0, -0.12]));
	g.add(mesh(new THREE.BoxGeometry(0.42, 0.06, 0.06), toon('#4a3a3a'), [-0.02, 0.62, 0.24]));
	g.add(mesh(new THREE.BoxGeometry(0.06, 0.42, 0.4), toon('#3a3a44'), [0, 0.2, 0]));
	return g;
};
/* catering trolley, origin on the floor; long side along x */
export const makeCart = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.BoxGeometry(0.8, 0.95, 0.32), toon('#c9ced8'), [0, 0.52, 0]));
	for (const y of [0.3, 0.62]) g.add(mesh(new THREE.BoxGeometry(0.72, 0.22, 0.02), toon('#aab0bc'), [0, y, 0.17]));
	g.add(mesh(new THREE.BoxGeometry(0.82, 0.05, 0.34), toon('#e4473c'), [0, 1.0, 0]));
	g.add(mesh(new THREE.BoxGeometry(0.04, 0.04, 0.3), toon('#8a90a0'), [0.42, 0.9, 0]));
	for (const x of [-0.32, 0.32]) for (const z of [-0.12, 0.12]) g.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 12), toon('#1b1a26'), [x, 0.04, z], [Math.PI / 2, 0, 0]));
	return ink(g);
};
/* rows of seats in a section, two seats each side of the aisle (DC-9: 2+3, simplified) */
const seats = (x0: number, x1: number, sides: ('near' | 'far')[] = ['near', 'far']) => {
	const g = new THREE.Group();
	for (let x = x0 + 0.4; x < x1 - 0.3; x += 0.82)
		for (const side of sides)
			for (const k of [0, 1]) {
				const s = makeSeat();
				s.position.set(x, -0.95, (side === 'far' ? -1 : 1) * (0.55 + k * 0.48));
				g.add(s);
			}
	return g;
};
/* bins + ceiling inside a section */
const bins = (x0: number, x1: number) => {
	const g = new THREE.Group();
	for (const z of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(x1 - x0, 0.38, 0.5), toon('#ddd2b8'), [(x0 + x1) / 2, 0.95, z * 1.05]));
	return g;
};
const wing = (side: 1 | -1, span = 13, stub = false) => {
	const g = new THREE.Group();
	const w = mesh(new THREE.BoxGeometry(5.2, 0.32, stub ? span * 0.35 : span), toon('#dfe2ea'), [0, 0, side * (stub ? span * 0.35 : span) * 0.5]);
	g.add(w);
	g.position.set(0.5, -1.05, side * 1.2);
	g.rotation.y = -side * 0.42;
	g.rotation.x = side * -0.05;
	return g;
};
const engine = (side: 1 | -1) => {
	const g = new THREE.Group();
	const e = new THREE.CylinderGeometry(0.62, 0.55, 4.2, 24);
	e.rotateZ(-Math.PI / 2);
	g.add(mesh(e, toon('#dfe2ea'), [0, 0, 0]));
	g.add(mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 20).rotateZ(-Math.PI / 2), flat('#2a2f3a'), [2.12, 0, 0]));
	g.add(mesh(new THREE.BoxGeometry(1.6, 0.18, 0.9), toon('#dfe2ea'), [0, 0, -side * 0.7]));
	g.position.set(-9.8, 0.8, side * 2.55);
	return g;
};
const tailFin = () => {
	const g = new THREE.Group();
	const shape = new THREE.Shape();
	shape.moveTo(0, 0);
	shape.lineTo(-4.2, 0);
	shape.lineTo(-6.6, 5.6);
	shape.lineTo(-4.4, 5.6);
	shape.lineTo(0, 0);
	const fin = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {depth: 0.3, bevelEnabled: false}), toon(WHITE));
	fin.position.set(-11.4, 1.2, -0.15);
	g.add(fin);
	const band = new THREE.Shape();
	band.moveTo(-3.3, 4.2);
	band.lineTo(-6.0, 4.2);
	band.lineTo(-6.6, 5.6);
	band.lineTo(-4.4, 5.6);
	band.lineTo(-3.3, 4.2);
	const stripe = new THREE.Mesh(new THREE.ExtrudeGeometry(band, {depth: 0.34, bevelEnabled: false}), toon(BLUE));
	stripe.position.set(-11.4, 1.2, -0.17);
	g.add(stripe);
	g.add(mesh(new THREE.BoxGeometry(2.6, 0.24, 9.5), toon('#dfe2ea'), [-17.2, 6.8, 0], [0, 0, 0.04]));
	return g;
};
const nose = () => {
	const s = new THREE.SphereGeometry(R, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2);
	s.rotateZ(-Math.PI / 2);
	const m = mesh(s, toon(WHITE), [14, 0, 0], undefined, [2.4, 1, 1]);
	const g = new THREE.Group();
	g.add(m);
	// cockpit windows
	for (const z of [-0.55, 0.55]) g.add(mesh(new THREE.BoxGeometry(0.9, 0.36, 0.3), flat('#26324e'), [15.6, 0.62, z * 1.5], [0, z > 0 ? 0.5 : -0.5, 0]));
	return g;
};
const tailCone = () => {
	const c = new THREE.CylinderGeometry(R, 0.45, 6, 40, 1, false);
	c.rotateZ(Math.PI / 2);
	return mesh(c, toon(WHITE), [-17, 0.45, 0]);
};

/* the whole airliner (x forward). split → front / mid / tail groups for the break-up */
export const makeJet = () => {
	const front = new THREE.Group();
	front.add(tube(4, 14, false), nose());
	const mid = new THREE.Group();
	mid.add(tube(-4, 4, false), wing(1), wing(-1));
	const tail = new THREE.Group();
	tail.add(tube(-14, -4, false), tailCone(), engine(1), engine(-1), tailFin());
	const jet = new THREE.Group();
	jet.add(front, mid, tail);
	ink(jet);
	return {jet, front, mid, tail};
};
/* the torn middle section: open both ends, stubs of the wings, seats inside */
export const makeChunk = () => {
	const g = new THREE.Group();
	g.add(tube(-4, 4, true), tornEdge(4, 1, 7), tornEdge(-4, -1, 11), seats(-4, 4), bins(-4, 4), wing(1, 13, true), wing(-1, 13, true));
	ink(g);
	return g;
};
/* cut-away cabin (far half only), for scenes inside with the camera on +z */
export const makeCabin = (len = 14) => {
	const g = new THREE.Group();
	const half = new THREE.CylinderGeometry(R, R, len, 40, 1, true, Math.PI * 0.5, Math.PI);
	half.rotateZ(-Math.PI / 2);
	// windows painted on the inside wall
	const tex = paint(512, 1024, (c) => {
		c.fillStyle = CABIN;
		c.fillRect(0, 0, 512, 1024);
		const n = Math.floor(len / 0.82);
		for (let i = 0; i < n; i++) {
			const y = ((i + 0.5) / n) * 1024;
			c.fillStyle = '#b8ac90';
			c.beginPath();
			c.ellipse(0.62 * 512, y, 22, (1024 / n) * 0.26, 0, 0, Math.PI * 2);
			c.fill();
			c.fillStyle = '#e88a6a';
			c.beginPath();
			c.ellipse(0.62 * 512, y, 15, (1024 / n) * 0.2, 0, 0, Math.PI * 2);
			c.fill();
		}
	});
	const wall = mesh(half, toon(CABIN, {map: tex, side: THREE.BackSide}), [0, 0, 0]);
	g.add(wall);
	g.add(mesh(new THREE.BoxGeometry(len, 0.1, 3.4), toon('#6a5a7a'), [0, -1.0, 0]));
	g.add(mesh(new THREE.BoxGeometry(len, 0.02, 0.7), toon('#4a8a7a'), [0, -0.94, 0.15]));
	g.add(mesh(new THREE.BoxGeometry(len, 0.4, 0.55), toon('#ddd2b8'), [0, 0.95, -1.05]));
	g.add(seats(-len / 2, len / 2, ['far']));
	ink(g);
	return g;
};
/* a puffy cloud (no ink: soft) */
export const makeCloud = (seed: number, size = 1) => {
	const g = new THREE.Group();
	const r = rnd(seed);
	const m = toon('#fbeee8');
	for (let i = 0; i < 7; i++) {
		const s = (1.4 + r() * 1.8) * size;
		g.add(mesh(new THREE.SphereGeometry(s, 16, 12), m, [(r() - 0.5) * 6 * size, (r() - 0.3) * 1.6 * size, (r() - 0.5) * 3 * size]));
	}
	return noInk(g);
};
/* pine with snow */
export const makePine = (h = 7, seed = 1) => {
	const g = new THREE.Group();
	const r = rnd(seed);
	g.add(mesh(new THREE.CylinderGeometry(0.15, 0.22, h * 0.25, 8), toon('#5a3e2a'), [0, h * 0.12, 0]));
	for (let i = 0; i < 3; i++) {
		const y = h * (0.28 + i * 0.22);
		const rad = h * (0.3 - i * 0.07);
		g.add(mesh(new THREE.ConeGeometry(rad, h * 0.38, 9), toon('#2f5a4a'), [0, y + h * 0.12, 0], [0, r() * 3, 0]));
		g.add(mesh(new THREE.ConeGeometry(rad * 0.62, h * 0.18, 9), toon('#f4f8fc'), [0, y + h * 0.24, 0], [0, r() * 3, 0]));
	}
	return ink(g);
};
/* snowy slope: a wide tilted plane with soft bumps */
export const makeSlope = () => {
	const geo = new THREE.PlaneGeometry(220, 220, 60, 60);
	const p = geo.getAttribute('position');
	for (let i = 0; i < p.count; i++) {
		const x = p.getX(i);
		const y = p.getY(i);
		p.setZ(i, Math.sin(x * 0.11) * 0.8 + Math.cos(y * 0.09 + x * 0.03) * 0.9);
	}
	geo.computeVertexNormals();
	const m = mesh(geo, toon('#eef3fa'), [0, 0, 0], [-Math.PI / 2, 0, 0]);
	m.userData.noInk = true;
	return m;
};
/* a far ridge line for the horizon */
export const makeRidge = (seed: number, color: string, z: number, h: number) => {
	const r = rnd(seed);
	const shape = new THREE.Shape();
	shape.moveTo(-200, -5);
	for (let x = -200; x <= 200; x += 20) shape.lineTo(x, h * (0.4 + r() * 0.6));
	shape.lineTo(200, -5);
	const m = mesh(new THREE.ShapeGeometry(shape), toon(color), [0, 0, z]);
	return noInk(m);
};
export const makeDebris = (n: number, seed: number) => {
	const g = new THREE.Group();
	const r = rnd(seed);
	for (let i = 0; i < n; i++) {
		const d = mesh(new THREE.BoxGeometry(0.2 + r() * 0.6, 0.05, 0.2 + r() * 0.5), toon(r() > 0.5 ? WHITE : '#c8ccd8'));
		d.userData.v = [(r() - 0.5) * 2, (r() - 0.5) * 2, (r() - 0.5) * 2];
		d.userData.s = [r() * 6, r() * 6, r() * 6];
		g.add(d);
	}
	return ink(g);
};
