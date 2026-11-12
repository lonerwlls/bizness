float sdCard(vec3 p, vec3 c, vec3 h, float r){
  vec2 q = abs(p.xz - c.xz) - (h.xz - r); float dxz = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  float dy = abs(p.y - c.y) - h.y; return length(max(vec2(dxz, dy), 0.0)) + min(max(dxz, dy), 0.0);
}
float sdHouse(vec3 p){ float b = sdRoundBox(p - vec3(0.0, -0.06, 0.0), vec3(0.2, 0.14, 0.22), 0.01);
  vec3 q = p - vec3(0.0, 0.08, 0.0); float roof = max(max(abs(q.z) - 0.25, -q.y), (abs(q.x) * 0.9 + q.y) - 0.2); return min(b, roof); }
float sdCar(vec3 p){ float body = sdRoundBox(p - vec3(0.0, -0.03, 0.0), vec3(0.17, 0.06, 0.36), 0.04);
  float cab = sdRoundBox(p - vec3(0.0, 0.07, -0.03), vec3(0.14, 0.05, 0.17), 0.04);
  vec3 w = vec3(abs(p.x) - 0.15, p.y + 0.08, abs(p.z) - 0.22); float wh = length(vec2(length(w.yz) - 0.0, w.x)) ;
  float wheels = max(length(w.yz) - 0.07, abs(w.x) - 0.03);
  return min(min(body, cab), wheels); }
float sdSofa(vec3 p){ float seat = sdRoundBox(p - vec3(0.0, -0.06, 0.0), vec3(0.2, 0.08, 0.5), 0.05);
  float back = sdRoundBox(p - vec3(0.14, 0.06, 0.0), vec3(0.06, 0.12, 0.5), 0.05);
  float arms = sdRoundBox(vec3(p.x, p.y - 0.0, abs(p.z) - 0.47), vec3(0.2, 0.11, 0.05), 0.04);
  return min(min(seat, back), arms); }
vec2 map(vec3 p){
  vec2 r = vec2(1e5, 0.0);
  r = opU(r, vec2(sdCard(p, vec3(0.0, BELT_Y - 0.03 - CARD_HY, CARD_CZ), vec3(CARD_HX, CARD_HY, CARD_HZ), CARD_R), 4.0));   // карта
  float belt = sdRoundBox(p - vec3(0.0, BELT_Y - 0.03, 0.0), vec3(CARD_HX - 0.02, 0.03, BELT_HW), 0.01);
  r = opU(r, vec2(belt, 1.0));                                                                  // полоса = лента
  vec3 q = vec3(p.x, p.y - (BELT_Y + 0.02), abs(p.z) - (BELT_HW + 0.05));
  r = opU(r, vec2(sdRoundBox(q, vec3(CARD_HX - 0.05, 0.03, 0.03), 0.015), 2.0));                 // кромки полосы
  r = opU(r, vec2(sdRoundBox(p - vec3(u_tvx, u_tvy, u_tvz), vec3(0.04, 0.24, 0.36), 0.015), 3.0));
  r = opU(r, vec2(sdSofa(p - vec3(u_sfx, u_sfy, u_sfz)), 5.0));
  r = opU(r, vec2(sdCar(p - vec3(u_cax, u_cay, u_caz)), 6.0));
  r = opU(r, vec2(sdHouse(p - vec3(u_hox, u_hoy, u_hoz)), 7.0));
  // терминал: блок со щелью на уровне карты, едет вдоль x
  vec3 tq = p - vec3(u_trx, BELT_Y + 0.4, CARD_CZ);
  float term = max(sdRoundBox(tq, vec3(1.0, 2.2, CARD_HZ + 0.6), 0.25), -sdRoundBox(tq - vec3(0.0, -0.45, 0.0), vec3(1.5, 0.12, CARD_HZ + 0.2), 0.0));
  r = opU(r, vec2(term, 8.0));
  return r;
}
vec3 albedo(float id, vec3 pos, vec3 n){
  if (id < 1.5) { float rib = smoothstep(0.42, 0.5, abs(fract((pos.x - u_off) * 3.0) - 0.5)); return mix(lin(vec3(30.0,28.0,32.0)/255.0), lin(vec3(10.0,9.0,11.0)/255.0), rib); }
  if (id < 2.5) return lin(vec3(110.0,108.0,114.0)/255.0);
  if (id < 3.5) return lin(vec3(40.0,38.0,44.0)/255.0);
  if (id < 4.5) {   // обратная сторона карты
    vec3 c = lin(vec3(38.0,37.0,44.0)/255.0);
    if (n.y > 0.5) {
      float sig = step(1.35, pos.z) * step(pos.z, 2.85) * step(-6.6, pos.x) * step(pos.x, 1.6);
      float lines = 0.92 + 0.08 * step(0.5, fract((pos.x + pos.z) * 2.2));
      c = mix(c, lin(vec3(206.0,202.0,196.0)/255.0) * lines, sig);
      float cvv = step(1.55, pos.z) * step(pos.z, 2.65) * step(1.85, pos.x) * step(pos.x, 3.3);
      c = mix(c, lin(vec3(236.0,234.0,230.0)/255.0), cvv);
      float prt = step(3.7, pos.z) * step(pos.z, 4.9) * step(-6.6, pos.x) * step(pos.x, 2.5) * step(0.6, fract(pos.z * 3.3)) * step(0.25, fract(pos.x * 0.9 + floor(pos.z * 3.3) * 0.37));
      c = mix(c, lin(vec3(70.0,68.0,76.0)/255.0), prt);
      float logo = smoothstep(0.92, 0.88, length(pos.xz - vec2(5.3, 6.4)));
      c = mix(c, lin(vec3(255.0,122.0,46.0)/255.0) * 0.8, logo);
    }
    return c;
  }
  if (id < 5.5) return lin(vec3(150.0,146.0,140.0)/255.0);   // диван
  if (id < 6.5) return lin(vec3(176.0,174.0,180.0)/255.0);   // машина
  if (id < 7.5) return lin(vec3(196.0,192.0,186.0)/255.0);   // дом
  return lin(vec3(52.0,50.0,58.0)/255.0);                    // терминал
}
vec3 lighting(vec3 pos, vec3 n, vec3 rd, float id, bool sh){
  vec3 L1 = normalize(vec3(0.3, 1.0, 0.45));
  float s1 = sh ? mix(0.45, 1.0, softShadow(pos + n*0.01, L1, 8.0, 8.0)) : 1.0;
  vec3 key = vec3(0.2, 0.2, 0.24) * clamp((dot(n, L1) + 0.3) / 1.3, 0.0, 1.0) * s1;
  vec3 hp = vec3(u_hx, u_hy, u_hz); vec3 ld = hp - pos; float dl = length(ld); ld /= dl;
  vec3 neon = vec3(1.0, 0.42, 0.12) * u_glow * 1.6 / (1.0 + dl*dl*2.2) * clamp(dot(n, ld)*0.8 + 0.2, 0.0, 1.0);
  vec3 h = normalize(ld - rd);
  float spec = pow(clamp(dot(n, h), 0.0, 1.0), 30.0) * 0.5 * u_glow / (1.0 + dl*dl);
  return key + neon + vec3(0.015, 0.014, 0.018) + vec3(1.0, 0.5, 0.2) * spec;
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
    if (m.y > 2.5 && m.y < 3.5 && abs(n.x) > 0.7) { vec3 tq = pos - vec3(u_tvx, u_tvy, u_tvz);
      float inside = step(abs(tq.z), 0.33) * step(abs(tq.y), 0.21);
      float streak = smoothstep(0.03, 0.0, abs(tq.y + tq.z * 0.6 - 0.05)) * 0.5 + 0.04;
      c = mix(c, vec3(0.004) + vec3(1.0, 0.55, 0.3) * streak * u_glow * 0.6, inside); }
    if (m.y > 7.5 && n.y > 0.5) { vec3 tq = pos - vec3(u_trx, 0.0, CARD_CZ);   // экран терминала сверху
      float scr = step(abs(tq.x), 0.7) * step(abs(tq.z), 2.6);
      c = mix(c, lin(vec3(14.0,12.0,16.0)/255.0) + vec3(1.0, 0.45, 0.15) * u_appr * 0.25, scr); }
    float fog = 1.0 - exp(-max(m.x - 9.0, 0.0) * 0.05);
    c = mix(c, lin(bg), fog);
    col = pow(max(c, 0.0), vec3(0.4545));
  }
  return vec4(col, 1.0);
}
