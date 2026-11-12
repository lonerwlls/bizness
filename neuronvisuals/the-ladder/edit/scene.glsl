float sdLadder(vec3 p){
  vec3 q = p - LAD_B; float s = dot(q, LAD_DIR);
  vec3 xa = vec3(1.0,0.0,0.0);
  vec3 c0 = LAD_B, c1 = LAD_B + LAD_DIR*LAD_LEN;
  float rails = min(sdCapsule(p, c0 - xa*LAD_HW, c1 - xa*LAD_HW, 0.035), sdCapsule(p, c0 + xa*LAD_HW, c1 + xa*LAD_HW, 0.035));
  float k = clamp(floor(s/RUNG + 0.5), 1.0, floor(LAD_LEN/RUNG) - 1.0);
  vec3 c = LAD_B + LAD_DIR*(k*RUNG);
  float rung = sdCapsule(p, c - xa*LAD_HW, c + xa*LAD_HW, 0.022);
  return min(rails, rung);
}
float sdChair(vec3 p, vec3 c, float sg){
  vec3 q0 = p - c; vec3 q = vec3(q0.z, q0.y, sg*q0.x);
  float seat = sdRoundBox(q - vec3(0.0,0.45,0.0), vec3(0.2,0.02,0.2), 0.015);
  float back = sdRoundBox(q - vec3(0.0,0.72,-0.2), vec3(0.2,0.25,0.015), 0.015);
  vec3 l = vec3(abs(q.x)-0.18, q.y-0.22, abs(q.z)-0.18);
  float legs = sdRoundBox(l, vec3(0.015,0.22,0.015), 0.005);
  return min(min(seat, back), legs);
}
vec2 map(vec3 p){
  vec2 r = vec2(p.y, 0.0);
  r = opU(r, vec2(sdRoundBox(p - vec3(0.0, WALL_H*0.5, -WALL_D*0.5), vec3(WALL_HX, WALL_H*0.5, WALL_D*0.5) - 0.02, 0.02), 1.0));
  r = opU(r, vec2(sdLadder(p), 2.0));
  vec3 tq = p - TABLE;
  float table = min(sdCylinder(tq - vec3(0.0, TABLE_H - 0.02, 0.0), 0.02, TABLE_R), sdCylinder(tq - vec3(0.0, TABLE_H*0.5, 0.0), TABLE_H*0.5, 0.045));
  table = min(table, sdCylinder(tq - vec3(0.0, 0.015, 0.0), 0.015, 0.25));
  r = opU(r, vec2(table, 3.0));
  vec3 lq = p - vec3(LAMP.x, TABLE_H, LAMP.z);
  float lampBase = min(sdCylinder(lq - vec3(0.0,0.015,0.0), 0.015, 0.09), sdCapsule(lq, vec3(0.0,0.02,0.0), vec3(0.0,0.36,0.0), 0.012));
  r = opU(r, vec2(lampBase, 4.0));
  vec3 sq = lq - vec3(0.0, 0.42, 0.0);
  float cone = max(sdCylinder(sq, 0.09, 0.2 - 0.6*(sq.y+0.09)*0.5), -sdCylinder(sq - vec3(0.0,-0.02,0.0), 0.09, 0.17 - 0.6*(sq.y+0.09)*0.5));
  r = opU(r, vec2(cone, 5.0));
  r = opU(r, vec2(min(sdChair(p, CHAIR_KID, 1.0), sdChair(p, CHAIR_WIFE, -1.0)), 6.0));
  return r;
}
vec3 albedo(float id, vec3 pos, vec3 n){
  if (id < 0.5) return lin(vec3(21.0,18.0,22.0)/255.0);
  if (id < 1.5) { vec3 c = lin(vec3(44.0,41.0,45.0)/255.0); if (n.y > 0.5) c = lin(vec3(62.0,58.0,63.0)/255.0); float e = smoothstep(0.06, 0.0, abs(pos.y - WALL_H)) * smoothstep(0.06, 0.0, abs(pos.z)); c = mix(c, lin(vec3(164.0,161.0,165.0)/255.0), e); return c; }
  if (id < 2.5) return lin(vec3(143.0,140.0,144.0)/255.0);
  if (id < 3.5) return lin(vec3(74.0,69.0,73.0)/255.0);
  if (id < 4.5) return lin(vec3(44.0,41.0,45.0)/255.0);
  if (id < 5.5) return lin(vec3(250.0,230.0,175.0)/255.0);
  return lin(vec3(58.0,53.0,57.0)/255.0);
}
vec3 lightAt(vec3 pos, vec3 n, vec3 rd, float id, bool shadows){
  vec3 L1 = normalize(vec3(0.35, 1.0, 0.55));
  float sh1 = shadows ? mix(0.4, 1.0, softShadow(pos + n*0.01, L1, 8.0, 10.0)) : 1.0;
  vec3 key = vec3(0.30,0.30,0.33) * clamp((dot(n,L1)+0.3)/1.3, 0.0, 1.0) * sh1;
  vec3 lp = LAMP + vec3(0.0, -0.06, 0.0); vec3 ld = lp - pos; float dl = length(ld); ld /= dl;
  float shl = (shadows && dl < 5.0) ? mix(0.25, 1.0, softShadow(pos + n*0.01, ld, 10.0, dl - 0.1)) : 1.0;
  float spot = id > 4.5 && id < 5.5 ? 1.0 : 1.0;
  vec3 warm = lin(vec3(250.0,230.0,175.0)/255.0) * u_lamp * 2.4 / (1.0 + dl*dl*1.1);
  vec3 lampL = warm * clamp(dot(n, ld)*0.85 + 0.15, 0.0, 1.0) * shl * spot;
  vec3 amb = vec3(0.022,0.021,0.025) * (0.6 + 0.4*n.y);
  vec3 h = normalize(L1 - rd);
  float spec = (id > 1.5 && id < 2.5) ? pow(clamp(dot(n,h),0.0,1.0), 40.0)*0.5*sh1 : 0.0;
  vec3 hl = normalize(ld - rd);
  spec += (id < 0.5 || (id > 1.5 && id < 2.5)) ? pow(clamp(dot(n,hl),0.0,1.0), 60.0)*0.6*u_lamp/(1.0+dl*dl) : 0.0;
  return key + lampL + amb + vec3(spec);
}
vec4 pixel(vec2 uv){
  vec2 p = screenP(uv, 0.0);
  vec3 ro = vec3(u_rox, u_roy, u_roz), ta = vec3(u_tax, u_tay, u_taz);
  vec3 rd = camRay(p, ro, ta, u_lens);
  vec3 bg = vec3(1.0, 0.0, 2.0) / 255.0;
  vec2 m = march(ro, rd, 40.0);
  vec3 col = bg;
  if (m.x > 0.0) {
    vec3 pos = ro + rd*m.x, n = calcNormal(pos);
    vec3 alb = albedo(m.y, pos, n);
    vec3 c;
    if (m.y > 4.5 && m.y < 5.5) {
      c = alb * (0.35 + 1.6*u_lamp) * (n.y < -0.2 ? 1.6 : 1.0);
    } else {
      float ao = calcAO(pos, n);
      c = alb * lightAt(pos, n, rd, m.y, true) * mix(0.6, 1.0, ao);
      if (m.y < 0.5) {
        vec3 rr = reflect(rd, n); vec2 mr = marchLo(pos + n*0.01, rr, 14.0);
        if (mr.x > 0.0) { vec3 rp = pos + n*0.01 + rr*mr.x, rn = calcNormal(rp); vec3 ra = albedo(mr.y, rp, rn);
          vec3 rc = (mr.y > 4.5 && mr.y < 5.5) ? ra*(0.12+0.5*u_lamp) : ra*lightAt(rp, rn, rr, mr.y, false);
          c += rc * 0.22 * exp(-mr.x*0.35); }
      }
    }
    float fog = 1.0 - exp(-max(m.x - 9.0, 0.0)*0.08);
    c = mix(c, lin(bg), fog);
    col = pow(max(c, 0.0), vec3(0.4545));
  }
  // ореол лампы
  vec3 lv = LAMP - ro; float tl = dot(lv, rd);
  if (tl > 0.0 && (m.x < 0.0 || m.x > tl - 0.3)) {
    float d = length(lv - rd*tl);
    col += vec3(0.98,0.88,0.62) * u_lamp * (0.10*exp(-d*d*28.0) + 0.05*exp(-d*3.5));
  }
  return vec4(col, 1.0);
}
