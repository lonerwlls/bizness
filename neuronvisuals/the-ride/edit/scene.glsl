// График-трасса: «площадь под графиком» — тёмный объём, по его передней кромке светится линия графика.
#define HZ 1.4
float sdChart(vec3 p){
  float y = chartY(p.x); float sl = (chartY(p.x + 0.05) - chartY(p.x - 0.05)) / 0.1;
  float dy = (p.y - y) / sqrt(1.0 + sl*sl);
  return max(max(dy, abs(p.z) - HZ), -(p.y + 4.0));
}
vec2 map(vec3 p){ return vec2(sdChart(p), 1.0); }
vec4 pixel(vec2 uv){
  vec2 p = screenP(uv, 0.0);
  vec3 ro = vec3(u_rox, u_roy, u_roz), ta = vec3(u_tax, u_tay, u_taz);
  vec3 rd = camRay(p, ro, ta, u_lens);
  vec3 col = vec3(1.0, 0.0, 2.0) / 255.0;
  vec2 m = march(ro, rd, 60.0);
  if (m.x > 0.0) {
    vec3 pos = ro + rd*m.x, n = calcNormal(pos);
    float y = chartY(pos.x), top = smoothstep(0.06, 0.0, abs(pos.y - y));
    vec3 c = vec3(0.0);
    if (n.z > 0.6) {   // передняя грань: заливка под графиком, тает книзу, горизонтальная сетка
      float fill = exp(-(y - pos.y) * 0.9) * 0.010;
      float grid = smoothstep(0.012, 0.0, abs(fract(pos.y * 1.0) - 0.5) - 0.48) * 0.006;
      c = vec3(0.9, 0.95, 1.0) * (fill + grid);
    } else {            // верх: тёмный глянец с дорожками
      float lane = smoothstep(0.02, 0.0, abs(fract((pos.z + HZ) / 0.633) - 0.5) - 0.47) * 0.006;
      c = vec3(0.0018, 0.0018, 0.0024) + vec3(lane);
      vec3 hp = vec3(u_hx, u_hy, u_hz); float dh = length(pos - hp);
      c += vec3(1.0, 0.45, 0.15) * 0.03 / (1.0 + dh*dh*2.5);               // отсвет неонового героя
    }
    float edge = smoothstep(0.05, 0.0, abs(pos.y - y)) * smoothstep(HZ - 0.12, HZ, pos.z);
    c += vec3(1.0) * edge * 1.2;                                              // светящаяся линия графика
    float fog = 1.0 - exp(-max(m.x - 6.0, 0.0) * 0.06);
    col = mix(pow(max(c, 0.0), vec3(0.4545)), col, fog);
  }
  // ореол линии графика в воздухе перед гранью
  return vec4(col, 1.0);
}
