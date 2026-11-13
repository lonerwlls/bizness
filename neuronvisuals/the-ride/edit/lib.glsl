float sdSphere(vec3 p, float r){ return length(p)-r; }
float sdCapsule(vec3 p, vec3 a, vec3 b, float r){ vec3 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0); return length(pa-ba*h)-r; }
float sdRoundBox(vec3 p, vec3 b, float r){ vec3 q=abs(p)-b; return length(max(q,0.0))+min(max(q.x,max(q.y,q.z)),0.0)-r; }
float sdCylinder(vec3 p, float h, float r){ vec2 d=abs(vec2(length(p.xz),p.y))-vec2(r,h); return min(max(d.x,d.y),0.0)+length(max(d,0.0)); }
vec2 opU(vec2 a, vec2 b){ return a.x<b.x ? a : b; }
float hash2(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
vec3 lin(vec3 c){ return pow(c, vec3(2.2)); }
vec2 map(vec3 p);
vec2 screenP(vec2 uv, float pad){ vec2 p=(uv*u_resolution-0.5*u_resolution)/(u_resolution.y-2.0*pad); p.y=-p.y; return p; }
vec3 camRay(vec2 p, vec3 ro, vec3 ta, float lens){
  vec3 ww=normalize(ta-ro), uu=normalize(cross(ww,vec3(0.0,1.0,0.0))), vv=cross(uu,ww);
  return normalize(p.x*uu+p.y*vv+lens*ww);
}
vec3 calcNormal(vec3 p){ vec2 e=vec2(0.001,0.0);
  return normalize(vec3(map(p+e.xyy).x-map(p-e.xyy).x, map(p+e.yxy).x-map(p-e.yxy).x, map(p+e.yyx).x-map(p-e.yyx).x)); }
vec2 march(vec3 ro, vec3 rd, float tmax){
  float t=0.0;
  for(int i=0;i<96;i++){ vec2 h=map(ro+rd*t); if(h.x<0.001*max(1.0,t*0.5)) return vec2(t,h.y); t+=h.x; if(t>tmax) break; }
  return vec2(-1.0,0.0);
}
vec2 marchLo(vec3 ro, vec3 rd, float tmax){
  float t=0.02;
  for(int i=0;i<48;i++){ vec2 h=map(ro+rd*t); if(h.x<0.003*max(1.0,t)) return vec2(t,h.y); t+=h.x; if(t>tmax) break; }
  return vec2(-1.0,0.0);
}
float softShadow(vec3 ro, vec3 rd, float k, float tmax){ float res=1.0, t=0.03;
  for(int i=0;i<32;i++){ float h=map(ro+rd*t).x; res=min(res,k*h/t); t+=clamp(h,0.02,0.3); if(h<0.001||t>tmax) break; }
  return clamp(res,0.0,1.0); }
float calcAO(vec3 p, vec3 n){ float o=0.0, s=1.0;
  for(int i=1;i<=5;i++){ float h=0.04*float(i); o+=(h-map(p+n*h).x)*s; s*=0.7; } return clamp(1.0-2.5*o,0.0,1.0); }
