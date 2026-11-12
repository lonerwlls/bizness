// Телефон лежит экраном вверх: стекло — пол, иконки приложений, «островок» и полоска внизу. Кресло в центре.
float sdChair(vec3 p){
  float seat = sdRoundBox(p - vec3(0.0, 0.38, 0.0), vec3(0.42, 0.1, 0.38), 0.07);
  float back = sdRoundBox(p - vec3(0.0, 0.78, -0.34), vec3(0.42, 0.42, 0.08), 0.07);
  float arms = sdRoundBox(vec3(abs(p.x) - 0.46, p.y - 0.52, p.z), vec3(0.07, 0.16, 0.38), 0.06);
  float legs = sdRoundBox(vec3(abs(p.x) - 0.38, p.y - 0.12, abs(p.z) - 0.3), vec3(0.03, 0.12, 0.03), 0.01);
  return min(min(seat, back), min(arms, legs));
}
float sdPhone(vec3 p){
  vec3 c = vec3(0.0, -0.35, (PH_Z0 + PH_Z1) * 0.5); vec3 h = vec3(PH_HX + 0.45, 0.35, (PH_Z1 - PH_Z0) * 0.5 + 0.45); float r = 1.6;
  vec2 q = abs(p.xz - c.xz) - (h.xz - r); float dxz = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  float dy = abs(p.y - c.y) - h.y; return length(max(vec2(dxz, dy), 0.0)) + min(max(dxz, dy), 0.0) - 0.05;
}
vec2 map(vec3 p){
  vec2 r = vec2(sdPhone(p), 0.0);
  r = opU(r, vec2(sdChair(p), 1.0));
  return r;
}
// иконка под точкой: (индекс подписки или -1, маска иконки, оттенок)
vec3 iconAt(vec2 xz){
  float cx = floor((xz.x + 3.6) / 1.8); float colx = -2.7 + cx * 1.8;
  int c = int(cx); int r = -1; float rowz = 0.0;
  if (abs(xz.y - DOCK_Z) < 0.9) { r = 4; rowz = DOCK_Z; }
  else { float ry = floor((xz.y + 10.0) / 2.0); rowz = -9.0 + ry * 2.0; if (ry >= 0.0 && ry <= 3.0) r = int(ry); }
  if (cx < 0.0 || cx > 3.0 || r < 0) return vec3(-2.0, 0.0, 0.0);
  vec2 d = abs(xz - vec2(colx, rowz)) - vec2(0.42); float sd = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - 0.26;
  float m = smoothstep(0.02, -0.02, sd);
  return vec3(subIndex(c, r), m, fract(sin(cx * 7.1 + float(r) * 3.3) * 43758.5));
}
vec3 albedo(float id, vec3 pos, vec3 n){
  if (id < 0.5) {
    vec3 c = lin(vec3(10.0,9.0,12.0)/255.0);
    float glass = step(abs(pos.x), PH_HX) * step(PH_Z0, pos.z) * step(pos.z, PH_Z1) * step(-0.02, pos.y);
    if (glass < 0.5) return lin(vec3(48.0,46.0,52.0)/255.0);    // корпус
    vec3 ic = iconAt(pos.xz);
    if (ic.x > -1.5) c = mix(c, lin(vec3(44.0 + 30.0 * ic.z, 42.0 + 24.0 * ic.z, 50.0 + 20.0 * ic.z)/255.0), ic.y);
    float island = smoothstep(0.03, -0.03, length(max(abs(pos.xz - vec2(0.0, PH_Z0 + 0.7)) - vec2(0.9, 0.0), 0.0)) - 0.28);
    float bar = smoothstep(0.03, -0.03, length(max(abs(pos.xz - vec2(0.0, PH_Z1 - 0.5)) - vec2(1.3, 0.0), 0.0)) - 0.07);
    c = mix(c, vec3(0.0), island); c = mix(c, lin(vec3(150.0,148.0,155.0)/255.0), bar);
    return c;
  }
  return lin(vec3(58.0,52.0,60.0)/255.0);
}
vec3 emission(vec3 pos){   // подключённые иконки светятся оранжевым: туда утекает свет героя
  vec3 ic = iconAt(pos.xz);
  if (ic.x < -0.5 || ic.x >= u_plugged) return vec3(0.0);
  return vec3(1.0, 0.42, 0.12) * ic.y * 0.8;
}
vec3 lighting(vec3 pos, vec3 n, vec3 rd, float id, bool sh){
  vec3 L1 = normalize(vec3(0.3, 1.0, 0.45));
  float s1 = sh ? mix(0.45, 1.0, softShadow(pos + n*0.01, L1, 8.0, 6.0)) : 1.0;
  vec3 key = vec3(0.07, 0.07, 0.09) * clamp((dot(n, L1) + 0.3) / 1.3, 0.0, 1.0) * s1 * (1.0 + 1.8 * u_rev);
  vec3 hp = vec3(u_hx, u_hy, u_hz); vec3 ld = hp - pos; float dl = length(ld); ld /= dl;
  float shn = sh ? mix(0.35, 1.0, softShadow(pos + n*0.01, ld, 10.0, dl - 0.25)) : 1.0;
  vec3 neon = vec3(1.0, 0.42, 0.12) * u_glow * 1.5 / (1.0 + dl*dl*1.6) * clamp(dot(n, ld)*0.8 + 0.2, 0.0, 1.0) * shn;
  vec3 h = normalize(ld - rd);
  float spec = pow(clamp(dot(n, h), 0.0, 1.0), 40.0) * (id < 0.5 ? 0.7 : 0.15) * u_glow / (1.0 + dl*dl);
  return key + neon + vec3(0.008, 0.007, 0.01) + vec3(1.0, 0.5, 0.2) * spec;
}
vec4 pixel(vec2 uv){
  vec2 p = screenP(uv, 0.0);
  vec3 ro = vec3(u_rox, u_roy, u_roz), ta = vec3(u_tax, u_tay, u_taz);
  vec3 rd = camRay(p, ro, ta, u_lens);
  vec3 bg = vec3(1.0, 0.0, 2.0) / 255.0;
  vec2 m = march(ro, rd, 70.0);
  vec3 col = bg;
  if (m.x > 0.0) {
    vec3 pos = ro + rd*m.x, n = calcNormal(pos);
    vec3 c = albedo(m.y, pos, n) * lighting(pos, n, rd, m.y, true) * mix(0.6, 1.0, calcAO(pos, n));
    if (m.y < 0.5 && n.y > 0.5) {
      c += emission(pos) * u_scr;
      vec3 rr = reflect(rd, n); vec2 mr = marchLo(pos + n*0.01, rr, 8.0);
      if (mr.x > 0.0) { vec3 rp = pos + n*0.01 + rr*mr.x, rn = calcNormal(rp); c += albedo(mr.y, rp, rn) * lighting(rp, rn, rr, mr.y, false) * 0.3 * exp(-mr.x*0.4); }
      float dh = length(pos.xz - vec2(u_hx, u_hz)); c += vec3(1.0, 0.4, 0.1) * u_glow * 0.05 / (1.0 + dh*dh*3.0);
      c += lin(vec3(30.0,30.0,40.0)/255.0) * 0.25 * u_rev * u_scr;          // экран слегка светится при отъезде
    }
    float fog = 1.0 - exp(-max(m.x - 5.0, 0.0) * 0.15 * (1.0 - 0.9 * u_rev));
    c = mix(c, lin(bg), fog);
    col = pow(max(c, 0.0), vec3(0.4545));
  }
  col *= mix(0.0, 1.0, u_scr * 0.85 + 0.15 * u_scr * u_scr) ;
  return vec4(col, 1.0);
}
