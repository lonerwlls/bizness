import React, {useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill} from 'remotion';
import * as THREE from 'three';
import {useShot} from '../kit/core';

/* A native 9:16 shot: a three.js world rendered behind (and optionally in front of) our flat
   stickmen. The overlay gets `proj` to stand 2D characters on 3D points at the right size. */
export const VW = 1080;
export const VH = 1920;

export type Proj = {
	p: (x: number, y: number, z: number) => {x: number; y: number; d: number};
	ppm: (d: number) => number; // pixels per metre at depth d
	sOf: (d: number, h?: number) => number; // Actor scale for a person h metres tall at depth d
	angle: (a: [number, number, number], b: [number, number, number]) => number; // screen angle (deg) of a→b
};
export type World = {scene: THREE.Scene; front?: THREE.Scene};

const makeRenderer = (canvas: HTMLCanvasElement, alpha: boolean) => {
	const r = new THREE.WebGLRenderer({canvas, antialias: true, alpha, preserveDrawingBuffer: true, powerPreference: 'high-performance'});
	r.setPixelRatio(1);
	r.setSize(VW, VH, false);
	r.outputColorSpace = THREE.SRGBColorSpace;
	if (alpha) r.setClearColor(0x000000, 0);
	return r;
};

export const View3D = <W extends World>({
	make,
	update,
	fov = 40,
	overlay,
	top,
	vignette = 0.45,
}: {
	make: () => W;
	update: (w: W, f: number, cam: THREE.PerspectiveCamera) => void;
	fov?: number;
	overlay?: (p: Proj, w: W) => React.ReactNode; // between the 3D back and the 3D front
	top?: (p: Proj, w: W) => React.ReactNode; // above everything
	vignette?: number;
}) => {
	const {f} = useShot();
	const back = useRef<HTMLCanvasElement>(null);
	const frontC = useRef<HTMLCanvasElement>(null);
	const rs = useRef<{b?: THREE.WebGLRenderer; fr?: THREE.WebGLRenderer}>({});
	const w = useMemo(make, []);
	const cam = useMemo(() => new THREE.PerspectiveCamera(fov, VW / VH, 0.1, 3000), []);
	cam.fov = fov;
	update(w, f, cam);
	cam.updateProjectionMatrix();
	cam.updateMatrixWorld(true);
	w.scene.updateMatrixWorld(true);
	w.front?.updateMatrixWorld(true);
	const proj: Proj = useMemo(() => {
		const v = new THREE.Vector3();
		const tanH = () => Math.tan(((cam.fov / 2) * Math.PI) / 180);
		const p = (x: number, y: number, z: number) => {
			v.set(x, y, z).applyMatrix4(cam.matrixWorldInverse);
			const d = -v.z;
			v.set(x, y, z).project(cam);
			return {x: ((v.x + 1) / 2) * VW, y: ((1 - v.y) / 2) * VH, d};
		};
		const ppm = (d: number) => VH / (2 * Math.max(0.05, d) * tanH());
		return {
			p,
			ppm,
			sOf: (d, h = 1.7) => (h * ppm(d)) / 371,
			angle: (a, b) => {
				const A = p(...a);
				const B = p(...b);
				return (Math.atan2(B.y - A.y, B.x - A.x) * 180) / Math.PI;
			},
		};
	}, [cam]);
	useLayoutEffect(() => {
		if (!rs.current.b && back.current) rs.current.b = makeRenderer(back.current, false);
		if (w.front && !rs.current.fr && frontC.current) rs.current.fr = makeRenderer(frontC.current, true);
		rs.current.b?.render(w.scene, cam);
		if (w.front) rs.current.fr?.render(w.front, cam);
	});
	useEffect(
		() => () => {
			for (const r of [rs.current.b, rs.current.fr]) {
				if (!r) continue;
				r.dispose();
				r.forceContextLoss();
			}
		},
		[],
	);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<canvas ref={back} width={VW} height={VH} style={{position: 'absolute', width: VW, height: VH}} />
			{overlay ? (
				<svg viewBox={`0 0 ${VW} ${VH}`} width={VW} height={VH} style={{position: 'absolute', overflow: 'visible'}}>
					{overlay(proj, w)}
				</svg>
			) : null}
			{w.front ? <canvas ref={frontC} width={VW} height={VH} style={{position: 'absolute', width: VW, height: VH}} /> : null}
			{top ? (
				<svg viewBox={`0 0 ${VW} ${VH}`} width={VW} height={VH} style={{position: 'absolute', overflow: 'visible'}}>
					{top(proj, w)}
				</svg>
			) : null}
			<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, rgba(8,8,24,0) 55%, rgba(8,8,24,${vignette}) 100%)`, pointerEvents: 'none'}} />
		</AbsoluteFill>
	);
};

/* lights + sky shared by the scenes */
export const dressScene = (scene: THREE.Scene, opts: {sky?: THREE.Texture; fog?: [string, number, number]; sun?: [number, number, number]; sunColor?: string; sunI?: number; hemi?: [string, string, number]}) => {
	if (opts.sky) scene.background = opts.sky;
	if (opts.fog) scene.fog = new THREE.Fog(opts.fog[0], opts.fog[1], opts.fog[2]);
	const h = opts.hemi ?? ['#fff0e0', '#5a5a9a', 1.3];
	scene.add(new THREE.HemisphereLight(h[0], h[1], h[2]));
	const d = new THREE.DirectionalLight(opts.sunColor ?? '#ffe2c0', opts.sunI ?? 2.4);
	d.position.set(...(opts.sun ?? [-6, 10, 8]));
	scene.add(d);
	scene.add(d.target);
	return scene;
};
/* the place where a 3D world point lands for an Actor standing there (x, floor) */
export const standAt = (p: Proj, x: number, y: number, z: number, h = 1.7) => {
	const q = p.p(x, y, z);
	return {x: q.x, floor: q.y, s: p.sOf(q.d, h), d: q.d};
};
/* a screen point → an Actor's local reach target (pose space) */
export const toLocal = (a: {x: number; floor: number; s: number}, facing: 1 | -1, sx: number, sy: number): [number, number] => [((sx - a.x) / a.s) * facing, (sy - (a.floor - 157 * a.s)) / a.s];
