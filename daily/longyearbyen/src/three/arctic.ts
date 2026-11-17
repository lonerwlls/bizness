import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {flat, ink, mesh, noInk, paint, rnd, toon} from './toon';

/* Svalbard in our toon 3D: no trees, flat-topped snowy mountains, colourful wooden houses on
   stilts, a polar-bear warning sign, a tiny cemetery of white crosses, a small plane. Metres. */

/* snowy valley floor (gentle bumps), y = 0 */
export const makeTundra = () => {
	const geo = new THREE.PlaneGeometry(400, 400, 80, 80);
	const p = geo.getAttribute('position');
	for (let i = 0; i < p.count; i++) {
		const x = p.getX(i);
		const y = p.getY(i);
		p.setZ(i, Math.sin(x * 0.07) * 0.25 + Math.cos(y * 0.05 + x * 0.02) * 0.3);
	}
	geo.computeVertexNormals();
	return noInk(mesh(geo, toon('#eef3fa'), [0, 0, 0], [-Math.PI / 2, 0, 0]));
};
export const groundY = (x: number, z: number) => Math.sin(x * 0.07) * 0.25 + Math.cos(-z * 0.05 + x * 0.02) * 0.3;

/* a flat-topped Svalbard mountain: snowy slopes with dark rock bands */
export const makeMountain = (w: number, h: number, seed: number) => {
	const g = new THREE.Group();
	const r = rnd(seed);
	const shape = new THREE.Shape();
	shape.moveTo(-w / 2, 0);
	shape.lineTo(-w * 0.28, h * 0.95);
	shape.lineTo(-w * 0.1, h);
	shape.lineTo(w * 0.18, h * 0.97);
	shape.lineTo(w * 0.32, h * 0.9);
	shape.lineTo(w / 2, 0);
	shape.lineTo(-w / 2, 0);
	const m = mesh(new THREE.ExtrudeGeometry(shape, {depth: w * 0.4, bevelEnabled: false}), toon('#e6edf6'));
	m.position.z = -w * 0.2;
	g.add(m);
	for (let i = 0; i < 5; i++) {
		const y = h * (0.25 + i * 0.15);
		const band = mesh(new THREE.BoxGeometry(w * (0.75 - i * 0.1) * (0.6 + r() * 0.4), h * 0.025, 1), toon('#5a5f70'), [(r() - 0.5) * w * 0.2, y, w * 0.2 + 0.5]);
		band.userData.noInk = true;
		g.add(band);
	}
	return ink(g, 0.0014);
};

/* wooden house on stilts; roof pitched along x */
export const makeHouse = (color: string, w = 7, d = 5, h = 3.2, seed = 1) => {
	const g = new THREE.Group();
	const r = rnd(seed);
	const lift = 0.9;
	for (const x of [-w / 2 + 0.4, w / 2 - 0.4]) for (const z of [-d / 2 + 0.4, d / 2 - 0.4]) g.add(mesh(new THREE.BoxGeometry(0.25, lift, 0.25), toon('#4a3a2e'), [x, lift / 2, z]));
	const wall = paint(256, 128, (c) => {
		c.fillStyle = color;
		c.fillRect(0, 0, 256, 128);
		c.strokeStyle = 'rgba(0,0,0,0.18)';
		c.lineWidth = 3;
		for (let x = 0; x < 256; x += 16) {
			c.beginPath();
			c.moveTo(x, 0);
			c.lineTo(x, 128);
			c.stroke();
		}
	});
	g.add(mesh(new THREE.BoxGeometry(w, h, d), toon('#ffffff', {map: wall}), [0, lift + h / 2, 0]));
	const roof = new THREE.Shape();
	roof.moveTo(-d / 2 - 0.3, 0);
	roof.lineTo(0, 1.6);
	roof.lineTo(d / 2 + 0.3, 0);
	roof.lineTo(-d / 2 - 0.3, 0);
	const rm = mesh(new THREE.ExtrudeGeometry(roof, {depth: w + 0.6, bevelEnabled: false}), toon('#3a3a48'), [-(w + 0.6) / 2, lift + h, 0], [0, Math.PI / 2, 0]);
	g.add(rm);
	const snow = mesh(new THREE.ExtrudeGeometry(roof, {depth: w + 0.62, bevelEnabled: false}), toon('#ffffff'), [-(w + 0.62) / 2, lift + h + 0.12, 0], [0, Math.PI / 2, 0], [1, 0.75, 1]);
	g.add(snow);
	for (let i = 0; i < 3; i++) {
		const win = mesh(new THREE.BoxGeometry(0.9, 0.9, 0.08), flat(r() > 0.3 ? '#ffd27a' : '#2a3a5a'), [-w / 2 + 1.3 + i * (w - 2.6) / 2, lift + h * 0.55, d / 2 + 0.05]);
		win.userData.noInk = true;
		g.add(win);
	}
	g.add(mesh(new THREE.BoxGeometry(1, 1.9, 0.1), toon('#5a3a2a'), [w / 2 - 1.2, lift + 0.95, d / 2 + 0.06]));
	return ink(g, 0.0024);
};

/* a sign on two posts; lines of text painted on the board */
export const makeSign = (lines: string[], opts: {w?: number; h?: number; bg?: string; fg?: string; post?: number} = {}) => {
	const {w = 3.2, h = 1.4, bg = '#fbfaf4', fg = '#1d2a4a', post = 1.6} = opts;
	const g = new THREE.Group();
	for (const x of [-w / 2 + 0.3, w / 2 - 0.3]) g.add(mesh(new THREE.BoxGeometry(0.14, post + h, 0.14), toon('#5a4a3a'), [x, (post + h) / 2, -0.06]));
	const tex = paint(512, Math.round((512 * h) / w), (c) => {
		const H = Math.round((512 * h) / w);
		c.fillStyle = bg;
		c.fillRect(0, 0, 512, H);
		c.strokeStyle = fg;
		c.lineWidth = 10;
		c.strokeRect(10, 10, 492, H - 20);
		c.fillStyle = fg;
		c.textAlign = 'center';
		const size = Math.min(96, (H - 40) / lines.length);
		lines.forEach((l, i) => {
			c.font = `900 ${i === 0 ? size : size * 0.6}px Rubik, sans-serif`;
			c.fillText(l, 256, 20 + (i + 0.8) * ((H - 30) / lines.length));
		});
	});
	g.add(mesh(new THREE.BoxGeometry(w, h, 0.1), [toon(bg), toon(bg), toon(bg), toon(bg), new THREE.MeshBasicMaterial({map: tex}), toon(bg)], [0, post + h / 2, 0]));
	return ink(g, 0.0024);
};
/* the famous red-triangle polar bear warning sign */
export const makeBearSign = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.BoxGeometry(0.12, 2.4, 0.12), toon('#8a9aa8'), [0, 1.2, -0.08]));
	const tex = paint(256, 256, (c) => {
		c.fillStyle = 'rgba(0,0,0,0)';
		c.clearRect(0, 0, 256, 256);
		c.fillStyle = '#d23b3b';
		c.beginPath();
		c.moveTo(128, 8);
		c.lineTo(250, 236);
		c.lineTo(6, 236);
		c.closePath();
		c.fill();
		c.fillStyle = '#ffffff';
		c.beginPath();
		c.moveTo(128, 48);
		c.lineTo(218, 214);
		c.lineTo(38, 214);
		c.closePath();
		c.fill();
		c.fillStyle = '#1b1a26';
		c.beginPath();
		c.ellipse(132, 170, 52, 24, 0, 0, Math.PI * 2);
		c.fill();
		c.beginPath();
		c.ellipse(80, 158, 18, 14, -0.3, 0, Math.PI * 2);
		c.fill();
		for (const x of [96, 120, 146, 170]) c.fillRect(x - 6, 178, 12, 26);
	});
	const plate = mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({map: tex, transparent: true}), [0, 2.2, 0]);
	plate.userData.noInk = true;
	g.add(plate);
	return ink(g, 0.0024);
};
export const makeCross = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.BoxGeometry(0.14, 1.4, 0.1), toon('#f4f6fa'), [0, 0.7, 0]));
	g.add(mesh(new THREE.BoxGeometry(0.7, 0.13, 0.1), toon('#f4f6fa'), [0, 1.05, 0]));
	return ink(g, 0.0026);
};
export const makeFence = (len: number) => {
	const g = new THREE.Group();
	for (let x = -len / 2; x <= len / 2; x += 0.5) g.add(mesh(new THREE.BoxGeometry(0.08, 0.9, 0.06), toon('#f4f1e6'), [x, 0.45, 0]));
	for (const y of [0.3, 0.7]) g.add(mesh(new THREE.BoxGeometry(len, 0.07, 0.05), toon('#f4f1e6'), [0, y, 0.04]));
	return ink(g, 0.0022);
};
export const makeTent = () => {
	const g = new THREE.Group();
	const s = new THREE.Shape();
	s.moveTo(-1.6, 0);
	s.lineTo(0, 2);
	s.lineTo(1.6, 0);
	s.lineTo(-1.6, 0);
	g.add(mesh(new THREE.ExtrudeGeometry(s, {depth: 3, bevelEnabled: false}), toon('#e47a3c'), [0, 0, -1.5]));
	return ink(g, 0.0024);
};
/* a small twin-prop plane (nose +x) */
export const makePlane = () => {
	const g = new THREE.Group();
	const body = new THREE.CapsuleGeometry(0.9, 8, 8, 20);
	body.rotateZ(Math.PI / 2);
	g.add(mesh(body, toon('#f4f6fa'), [0, 0, 0]));
	g.add(mesh(new THREE.BoxGeometry(8.4, 0.12, 0.3), toon('#d23b3b'), [0, -0.1, 0.88]));
	g.add(mesh(new THREE.BoxGeometry(2.2, 0.2, 15), toon('#dfe4ec'), [0.4, 0.75, 0]));
	for (const z of [-3, 3]) {
		const e = new THREE.CylinderGeometry(0.45, 0.5, 2, 14);
		e.rotateZ(Math.PI / 2);
		g.add(mesh(e, toon('#dfe4ec'), [1.4, 0.55, z]));
		g.add(mesh(new THREE.BoxGeometry(0.06, 2.4, 0.2), toon('#2a2a34'), [2.45, 0.55, z]));
	}
	g.add(mesh(new THREE.BoxGeometry(1.6, 2.2, 0.2), toon('#d23b3b'), [-4.4, 1.3, 0], [0, 0, 0.3]));
	g.add(mesh(new THREE.BoxGeometry(1.2, 0.14, 4.4), toon('#dfe4ec'), [-4.4, 0.4, 0]));
	for (let i = 0; i < 6; i++) g.add(noInk(mesh(new THREE.BoxGeometry(0.4, 0.35, 0.05), flat('#26324e'), [2.2 - i * 0.9, 0.25, 0.86])));
	for (const z of [-1.4, 1.4]) g.add(mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12), toon('#1b1a26'), [1, -1.3, z], [Math.PI / 2, 0, 0]));
	return ink(g, 0.0022);
};
export const makeShovel = () => {
	const g = new THREE.Group();
	g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8), toon('#8a5a3a'), [0, 0.6, 0]));
	g.add(mesh(new RoundedBoxGeometry(0.28, 0.34, 0.04, 2, 0.02), toon('#9aa0ae'), [0, -0.12, 0]));
	return ink(g, 0.0024);
};
/* a dug hole showing the frozen ground (blue ice) */
export const makePit = () => {
	const g = new THREE.Group();
	g.add(noInk(mesh(new THREE.CylinderGeometry(0.7, 0.6, 0.3, 20), toon('#9fc8e8'), [0, -0.1, 0])));
	g.add(mesh(new THREE.TorusGeometry(0.75, 0.12, 8, 24), toon('#ffffff'), [0, 0.05, 0], [Math.PI / 2, 0, 0]));
	return g;
};
export const makeSuitcase3 = () => {
	const g = new THREE.Group();
	g.add(mesh(new RoundedBoxGeometry(0.42, 0.56, 0.22, 3, 0.04), toon('#d23b3b'), [0, 0.32, 0]));
	g.add(mesh(new THREE.TorusGeometry(0.07, 0.02, 8, 12, Math.PI), toon('#2a2a34'), [0, 0.62, 0]));
	return ink(g, 0.0024);
};
