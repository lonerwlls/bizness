// Тёмная площадка, четыре камня, над каждым — пятно света. Камень героя трескается и раскалывается.
const vec3 S0 = vec3(0.0, 0.0, 0.0), S1 = vec3(1.8, 0.0, -4.2), S2 = vec3(-1.6, 0.0, -8.5), S3 = vec3(1.2, 0.0, -12.8);
float rockN(vec3 p){ return sin(3.1*p.x + 1.7*sin(2.3*p.z)) * sin(2.7*p.y + 1.3*sin(1.9*p.x)) * sin(2.9*p.z + 1.1*sin(2.1*p.y)); }
float sdStone(vec3 q, float sd){
  q -= vec3(0.0, 0.98, 0.0);
  q.x += 0.06 * q.y * sin(sd * 1.7); q.z += 0.05 * q.y * cos(sd * 2.3);   // лёгкий наклон и неровность
  float d = sdRoundBox(q, vec3(0.56 + 0.04 * sin(sd), 0.82, 0.5 + 0.05 * cos(sd)), 0.26);
  return d + 0.07 * rockN(q * 1.2 + sd) + 0.025 * rockN(q * 3.7 + sd * 2.0) + 0.008 * rockN(q * 11.0);
}
float jag(vec3 q){ return 0.07 * sin(q.y * 5.3 + 0.7) + 0.035 * sin(q.y * 13.0 + 2.0) + 0.04 * sin(q.x * 4.1); }
float sdHero(vec3 q){
  float off = 0.34 * u_sp;
  if (off < 0.001) return sdStone(q, 0.0);
  vec3 a = q - vec3(0.0, 0.0, off), b = q + vec3(0.0, 0.0, off);
  float da = max(sdStone(a, 0.0), -(a.z - jag(a))), db = max(sdStone(b, 0.0), (b.z - jag(b)));
  return min(da, db) * 0.85;
}
// дешёвая оболочка: пока точка далеко от камня, считаем расстояние до шара вокруг него
float bound(vec3 q){ return length(q - vec3(0.0, 1.0, 0.0)) - 1.45; }
vec2 map(vec3 p){
  vec2 r = vec2(p.y, 0.0);
  vec3 q0 = p - S0, q1 = p - S1, q2 = p - S2, q3 = p - S3;
  float b0 = bound(q0) - 0.4 * u_sp, b1 = bound(q1), b2 = bound(q2), b3 = bound(q3);
  r = opU(r, vec2(b0 > 0.3 ? b0 : sdHero(q0), 1.0));
  r = opU(r, vec2(b1 > 0.3 ? b1 : sdStone(q1, 1.7), 2.0));
  r = opU(r, vec2(b2 > 0.3 ? b2 : sdStone(q2, 3.1), 3.0));
  r = opU(r, vec2(b3 > 0.3 ? b3 : sdStone(q3, 4.6), 4.0));
  return r;
}
float pool(vec3 p, vec3 s, float on){ vec2 d = p.xz - (s.xz + vec2(-1.0, 0.0)); return on * exp(-dot(d, d) / 3.2); }
float flash(vec3 p, vec3 s, float f){ vec3 h = s + vec3(-0.76, 1.05, 0.0); vec3 d = p - h; return f * exp(-dot(d, d) * 30.0); }
float crackLine(vec3 q, float w){ return smoothstep(w, 0.0, abs(q.z - jag(q))); }
vec4 pixel(vec2 uv){
  vec2 sp = screenP(uv, 0.0);
  vec3 ro = vec3(u_rox, u_roy, u_roz), ta = vec3(u_tax, u_tay, u_taz);
  vec3 rd = camRay(sp, ro, ta, u_lens);
  vec3 col = vec3(1.0, 0.0, 2.0) / 255.0;
  vec2 m = march(ro, rd, 60.0);
  if (m.x > 0.0) {
    vec3 pos = ro + rd * m.x, n = calcNormal(pos);
    float L = pool(pos, S0, u_l0) + pool(pos, S1, u_l1) + pool(pos, S2, u_l2) + pool(pos, S3, u_l3);
    float topK = clamp(n.y * 0.6 + 0.45, 0.0, 1.0);
    vec3 hp = vec3(-1.9, 1.3, 0.0);           // неоновый герой подсвечивает свой камень оранжевым
    float dh = length(pos - hp);
    vec3 orange = vec3(1.0, 0.42, 0.12);
    vec3 c;
    if (m.y < 0.5) {   // земля
      float g = 0.8 + 0.2 * rockN(pos * 2.3);
      c = vec3(0.0016, 0.0016, 0.002) + vec3(0.075, 0.072, 0.07) * L * g;
      c += orange * 0.05 / (1.0 + dh * dh * 1.4) * u_hg;
      vec2 dz = pos.xz - vec2(0.0, 0.0); c += orange * u_sp * 0.9 * exp(-dot(dz, dz) * 0.7);   // свет из раскола
    } else {
      float tex = 0.75 + 0.25 * rockN(pos * 6.0);
      c = vec3(0.075, 0.072, 0.07) * tex * (L * topK + 0.015);
      c += vec3(0.02, 0.022, 0.03) * clamp(dot(n, normalize(vec3(-0.4, 0.5, -0.6))), 0.0, 1.0);   // холодный контровой
      c += orange * 0.14 / (1.0 + dh * dh * 1.6) * u_hg * clamp(dot(n, normalize(hp - pos)) + 0.2, 0.0, 1.0);
      float fl = flash(pos, S0, u_f0) + flash(pos, S1, u_f1) + flash(pos, S2, u_f2) + flash(pos, S3, u_f3);
      c += vec3(1.0, 0.85, 0.65) * fl * 1.4;
      if (m.y < 1.5) {          // камень героя: трещина и свет изнутри
        vec3 q = pos - S0;
        float off = 0.34 * u_sp; vec3 qa = q - vec3(0.0, 0.0, sign(q.z - jag(q)) * off);
        float cr = crackLine(qa, 0.006 + 0.03 * u_c0) * u_c0;
        cr += crackLine(qa + vec3(0.0, 0.0, 0.18 * (qa.y - 1.05)), 0.006) * u_c0 * 0.5 * smoothstep(0.6, 1.0, u_c0) * step(abs(qa.y - 1.05), 0.55);
        c += vec3(1.0, 0.55, 0.2) * cr * 2.0;
        float inner = smoothstep(0.03, 0.0, abs(abs(q.z) - off - abs(jag(q))) ) * u_sp;
        c += orange * inner * 1.6 + orange * u_sp * 0.25 * exp(-abs(q.z) * 2.0);
      } else if (m.y < 2.5) {   // камень того, кто ушёл на 99: слабая трещина
        vec3 q = pos - S1;
        c += vec3(0.9, 0.9, 1.0) * crackLine(q, 0.006) * u_c1 * step(abs(q.y - 1.0), 0.75) * 0.9;
      }
    }
    float fog = 1.0 - exp(-max(m.x - 8.0, 0.0) * 0.06);
    col = mix(pow(max(c, 0.0), vec3(0.4545)), col, fog);
  }
  return vec4(col, 1.0);
}
