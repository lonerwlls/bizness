// Тёмное поле, три дорожки. Каждая дорожка светится тем сильнее, чем больше дней по ней прошли.
// У начала — неоновая дверь, в конце — столбик-цель. Дорожка героя тёплая оранжевая, у остальных — холодная.
const float Z0 = 0.0, Z1 = -1.7, Z2 = -3.4;
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash2(i), hash2(i+vec2(1,0)), f.x), mix(hash2(i+vec2(0,1)), hash2(i+vec2(1,1)), f.x), f.y); }
float sdProps(vec3 p, float z){
  vec3 q = p - vec3(0.0, 0.0, z);
  float door = min(min(sdCapsule(q, vec3(-6.75,0.0,-0.42), vec3(-6.75,1.95,-0.42), 0.035), sdCapsule(q, vec3(-6.75,0.0,0.42), vec3(-6.75,1.95,0.42), 0.035)), sdCapsule(q, vec3(-6.75,1.95,-0.42), vec3(-6.75,1.95,0.42), 0.035));
  float post = min(sdCapsule(q, vec3(6.75,0.0,0.0), vec3(6.75,1.25,0.0), 0.035), sdSphere(q - vec3(6.75,1.38,0.0), 0.11));
  return min(door, post);
}
vec2 map(vec3 p){
  vec2 r = vec2(p.y + 0.012 * vn(p.xz * 3.0), 0.0);
  r = opU(r, vec2(sdProps(p, Z0), 1.0));
  r = opU(r, vec2(sdProps(p, Z1), 2.0));
  r = opU(r, vec2(sdProps(p, Z2), 3.0));
  return r;
}
float lane(vec3 p, float z){ return smoothstep(0.36, 0.22, abs(p.z - z)) * smoothstep(6.45, 6.2, abs(p.x)); }
vec4 pixel(vec2 uv){
  vec2 sp = screenP(uv, 0.0);
  vec3 ro = vec3(u_rox, u_roy, u_roz), ta = vec3(u_tax, u_tay, u_taz);
  vec3 rd = camRay(sp, ro, ta, u_lens);
  vec3 col = vec3(1.0, 0.0, 2.0) / 255.0;
  // свечение реквизита вдоль луча
  float t = 0.0, gl0 = 0.0, gl1 = 0.0, gl2 = 0.0; vec2 h = vec2(-1.0);
  for (int i = 0; i < 90; i++) { vec3 p = ro + rd * t;
    float d0 = sdProps(p, Z0), d1 = sdProps(p, Z1), d2 = sdProps(p, Z2);
    gl0 += 0.006 / (0.02 + d0 * d0 * 40.0); gl1 += 0.006 / (0.02 + d1 * d1 * 40.0); gl2 += 0.006 / (0.02 + d2 * d2 * 40.0);
    vec2 m = map(p); if (m.x < 0.001 * max(1.0, t * 0.5)) { h = vec2(t, m.y); break; } t += m.x * 0.9; if (t > 70.0) break; }
  vec3 warm = vec3(1.0, 0.48, 0.16), cool = vec3(0.72, 0.78, 0.92);
  float e0 = 0.25 + 0.75 * clamp(u_p0, 0.0, 1.5), e1 = 0.2 + 0.8 * u_p1, e2 = 0.2 + 0.8 * u_p2;
  if (h.x > 0.0) {
    vec3 pos = ro + rd * h.x, n = calcNormal(pos);
    vec3 c;
    if (h.y < 0.5) {
      float g = 0.55 + 0.45 * vn(pos.xz * 1.7) + 0.25 * vn(pos.xz * 9.0);
      c = vec3(0.004, 0.0038, 0.0045) * g;
      float l0 = lane(pos, Z0), l1 = lane(pos, Z1), l2 = lane(pos, Z2);
      float wear = 0.6 + 0.4 * vn(vec2(pos.x * 6.0, pos.z * 14.0));
      c += warm * l0 * u_p0 * 0.55 * wear + cool * l1 * u_p1 * 0.35 * wear + cool * l2 * u_p2 * 0.35 * wear;
      c += warm * u_p0 * 0.06 * exp(-pow(pos.z - Z0, 2.0) * 2.5) * smoothstep(7.5, 5.5, abs(pos.x));
      c += cool * (u_p1 * exp(-pow(pos.z - Z1, 2.0) * 3.0) + u_p2 * exp(-pow(pos.z - Z2, 2.0) * 3.0)) * 0.035 * smoothstep(7.5, 5.5, abs(pos.x));
      vec3 hp = vec3(u_hx, u_hy, u_hz); float dh = length(pos - hp);
      c += warm * 0.07 * u_hg / (1.0 + dh * dh * 2.0);
    } else if (h.y < 1.5) c = mix(warm, vec3(1.0), 0.6) * e0;
    else if (h.y < 2.5) c = mix(cool, vec3(1.0), 0.6) * e1;
    else c = mix(cool, vec3(1.0), 0.6) * e2;
    float fog = 1.0 - exp(-max(h.x - 9.0, 0.0) * 0.05);
    col = mix(pow(max(c, 0.0), vec3(0.4545)), col, fog);
  }
  vec3 glow = warm * gl0 * e0 * 0.05 + cool * (gl1 * e1 + gl2 * e2) * 0.035;
  col += pow(glow, vec3(0.6)) * 0.6;
  return vec4(col, 1.0);
}
