import React, {useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {useShot} from '../kit/core';

/* A 3D prop living inside our 2D world. The canvas covers the world rectangle (x, y, w, h)
   (1920x1080 world px); an orthographic camera maps 1 world px = 1 unit, y down → -y.
   Put it inside a <Layer> next to the <Svg>: DOM order decides what is in front. */
export type PropWorld = {scene: THREE.Scene};
export const at = (o: THREE.Object3D, x: number, y: number, z = 0) => {
	o.position.set(x, -y, z);
	return o;
};
export const Prop3D = <W extends PropWorld>({x, y, w, h, make, update, dpr = 2}: {x: number; y: number; w: number; h: number; make: () => W; update?: (w: W, f: number, gf: number) => void; dpr?: number}) => {
	const {f, gf} = useShot();
	const ref = useRef<HTMLCanvasElement>(null);
	const r = useRef<THREE.WebGLRenderer | null>(null);
	const world = useMemo(make, []);
	const cam = useMemo(() => {
		const c = new THREE.OrthographicCamera(x, x + w, -y, -(y + h), -3000, 3000);
		c.position.set(0, 0, 1000);
		c.lookAt(0, 0, 0);
		return c;
	}, [x, y, w, h]);
	update?.(world, f, gf);
	useLayoutEffect(() => {
		if (!r.current && ref.current) {
			const g = new THREE.WebGLRenderer({canvas: ref.current, antialias: true, alpha: true, preserveDrawingBuffer: true});
			g.setPixelRatio(dpr);
			g.setSize(w, h, false);
			g.setClearColor(0x000000, 0);
			g.outputColorSpace = THREE.SRGBColorSpace;
			r.current = g;
		}
		world.scene.updateMatrixWorld(true);
		cam.updateMatrixWorld(true);
		r.current?.render(world.scene, cam);
	});
	useEffect(
		() => () => {
			r.current?.dispose();
			r.current?.forceContextLoss();
		},
		[],
	);
	return <canvas ref={ref} width={w * dpr} height={h * dpr} style={{position: 'absolute', left: x, top: y, width: w, height: h}} />;
};
/* a lit scene for props: soft sky light + a key light from the upper left */
export const propScene = (key = 2.3) => {
	const s = new THREE.Scene();
	s.add(new THREE.HemisphereLight('#fff6e8', '#7a7090', 1.6));
	const d = new THREE.DirectionalLight('#fff0d8', key);
	d.position.set(-400, 600, 900);
	s.add(d);
	return s;
};
