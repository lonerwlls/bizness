// Ночной песчаный остров в тёмной реке. Деревья растут по клеткам сетки: дерево есть, если край леса (u_R) уже прошёл его,
// и растёт тем выше, чем дальше край ушёл. Кроны светятся мягким бирюзово-зелёным неоном.
#define C 1.6
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash2(i), hash2(i+vec2(1,0)), f.x), mix(hash2(i+vec2(0,1)), hash2(i+vec2(1,1)), f.x), f.y); }
float groundH(vec2 xz){ float r = length(xz); return mix(-0.22, 0.04, smoothstep(16.0, 14.2, r)) + 0.05 * vn(xz * 0.6) * smoothstep(16.0, 13.0, r); }
// стилизованное дерево: тонкий ствол и крона из двух вытянутых шаров (радиус не выходит за клетку)
float sdTreeAt(vec3 q, float h){
  float trunk = sdCapsule(q, vec3(0.0), vec3(0.0, h * 0.7, 0.0), 0.02 + 0.015 * h);
  float rc = min(0.24 * h, 0.54);
  float a = length((q - vec3(0.0, h * 0.62, 0.0)) / vec3(1.0, 1.35, 1.0)) - rc;
  float b = length((q - vec3(0.0, h * 0.86, 0.0)) / vec3(1.0, 1.25, 1.0)) - rc * 0.72;
  return min(trunk, min(a, b) * 0.78);
}
vec2 cellTC(vec2 id){ return (id + 0.5) * C + (vec2(hash2(id), hash2(id + 7.3)) - 0.5) * 0.5; }
float treeH(vec2 id){ vec2 tc = cellTC(id); float d = length(tc);
  if (hash2(id + 3.1) > 0.8 || d > 13.0 || d < 0.9) return -1.0; float age = u_R - d; if (age <= 0.0) return -1.0;
  return (1.6 + 2.3 * hash2(id + 11.0)) * smoothstep(0.0, 4.5, age) + 0.08; }
float sdForest(vec3 p){ vec2 id = floor(p.xz / C); float h = treeH(id); if (h < 0.0) return 1e3; vec2 tc = cellTC(id);
  return sdTreeAt(vec3(p.x - tc.x, p.y - groundH(tc), p.z - tc.y), h); }
float firstH(){ return 2.4 * smoothstep(110.0, 520.0, u_st) + 0.25 * smoothstep(110.0, 150.0, u_st); }
float sdFirst(vec3 p){ float fh = firstH(); if (fh < 0.01) return 1e3; return sdTreeAt(p - vec3(0.0, groundH(vec2(0.0)), 0.0), fh); }
vec2 map(vec3 p){
  vec2 r = vec2(p.y - groundH(p.xz), 0.0);
  r = opU(r, vec2(sdForest(p), 1.0));
  r = opU(r, vec2(sdFirst(p), 1.0));
  return r;
}
// шаг не дальше выхода из текущей клетки (деревья проверяются только в своей клетке)
float cellExit(vec3 p, vec3 rd){ vec2 id = floor(p.xz / C); vec2 lo = id * C, hi = lo + C;
  float tx = rd.x > 0.0 ? (hi.x - p.x) / rd.x : (rd.x < 0.0 ? (lo.x - p.x) / rd.x : 1e3);
  float tz = rd.z > 0.0 ? (hi.y - p.z) / rd.z : (rd.z < 0.0 ? (lo.y - p.z) / rd.z : 1e3);
  return min(tx, tz) + 0.01; }
vec4 pixel(vec2 uv){
  vec2 sp = screenP(uv, 0.0);
  vec3 ro = vec3(u_rox, u_roy, u_roz), ta = vec3(u_tax, u_tay, u_taz);
  vec3 rd = camRay(sp, ro, ta, u_lens);
  vec3 sky = vec3(1.5, 1.0, 3.0) / 255.0 + vec3(0.0, 0.012, 0.01) * u_fg * smoothstep(-0.1, 0.3, rd.y) * (1.0 - smoothstep(0.3, 0.9, rd.y));
  vec3 col = sky;
  float t = 0.0; vec2 h = vec2(-1.0);
  for (int i = 0; i < 160; i++) { vec3 p = ro + rd * t; vec2 m = map(p); if (m.x < 0.0015 * max(1.0, t * 0.4)) { h = vec2(t, m.y); break; } float st = m.x * 0.85; if (p.y < 4.5) st = min(st, cellExit(p, rd)); t += max(st, 0.002); if (t > 80.0) break; }
  vec3 teal = vec3(0.25, 1.0, 0.62), warm = vec3(1.0, 0.48, 0.16);
  if (h.x > 0.0) {
    vec3 pos = ro + rd * h.x, n = calcNormal(pos);
    float rr = length(pos.xz), inF = smoothstep(u_R + 1.5, u_R - 1.0, rr);
    vec3 hp = vec3(u_hx, u_hy, u_hz); float dh = length(pos - hp);
    vec3 c;
    if (h.y < 0.5) {
      float gh = groundH(pos.xz);
      if (gh < -0.12) {   // вода
        float rip = 0.5 + 0.5 * sin(pos.x * 3.0 + 2.0 * vn(pos.xz * 0.8) * 6.0 + pos.z * 1.3);
        c = vec3(0.002, 0.003, 0.006) + teal * 0.012 * u_fg * rip * exp(-max(rr - 15.0, 0.0) * 0.15);
      } else {
        float g = 0.7 + 0.3 * vn(pos.xz * 4.0);
        c = vec3(0.012, 0.010, 0.008) * g;                                   // песок в лунном свете
        c += teal * 0.03 * inF * u_fg * g;                                    // отсвет леса на земле
        c += vec3(0.004, 0.006, 0.004) * inF;
      }
      c += warm * 0.08 / (1.0 + dh * dh * 1.8);
    } else {   // деревья
      float fres = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 2.5);
      float isCan = smoothstep(0.25, 0.45, (pos.y - groundH(pos.xz)) / 3.0);
      c = mix(vec3(0.006, 0.004, 0.003), vec3(0.002, 0.008, 0.006), isCan);
      c += teal * (0.035 + 0.9 * pow(fres, 1.6)) * u_fg * mix(0.3, 1.0, isCan);
      c += teal * 0.03 * clamp(n.y, 0.0, 1.0) * u_fg * isCan;
      c += warm * 0.12 / (1.0 + dh * dh * 1.5);
    }
    float fog = 1.0 - exp(-max(h.x - 14.0, 0.0) * 0.03);
    col = mix(pow(max(c, 0.0), vec3(0.4545)), col, fog);
  } else col = pow(sky, vec3(0.4545));
  return vec4(col, 1.0);
}
