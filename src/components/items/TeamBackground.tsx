import { ReactNode, useEffect, useRef, useState } from "react";
import { getTeam, TeamId } from "../../lib/teams";
import { useShaderBackground } from "../../hooks/useShaderBackground";
import { cn } from "../../lib/utils";

// =============================================================================
// FRAGMENT SHADERS — one per team
// =============================================================================

/**
 * Townsfolk — Moonlit aurora + soft god rays.
 * Smooth, readable motion with a bright “hope” core.
 */
const TOWNSFOLK_SHADER = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

float hash(vec2 p){
  p = fract(p*vec2(123.34, 456.21));
  p += dot(p, p+34.345);
  return fract(p.x*p.y);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f*f*(3.0-2.0*f);
  float a = hash(i);
  float b = hash(i+vec2(1.0,0.0));
  float c = hash(i+vec2(0.0,1.0));
  float d = hash(i+vec2(1.0,1.0));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}

float fbm(vec2 p){
  float v = 0.0;
  float a = 0.55;
  mat2 m = mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<5;i++){
    v += a*noise(p);
    p = m*p + 0.07;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv;
  p.x *= u_resolution.x / u_resolution.y;

  float t = u_time * 0.08;

  // Aurora curtains: vertical bands with flowing turbulence
  float curtains = fbm(vec2(p.x*2.2, p.y*1.4 + t*1.2));
  float bands = sin((p.x*3.0 + curtains*1.8) * 3.14159);
  bands = pow(max(0.0, bands), 2.2);

  float flow = fbm(vec2(p.x*1.2 - t*0.7, p.y*2.2 + t*0.4));
  float aur = smoothstep(0.15, 0.95, bands) * (0.55 + 0.55*flow);

  // Soft rays from above (subtle “guiding light”)
  vec2 c = uv - vec2(0.5, 0.62);
  float ang = atan(c.y, c.x);
  float rays = pow(max(0.0, cos(ang*10.0 + fbm(p*2.0 + t)*2.0)), 7.0);
  rays *= smoothstep(0.9, 0.15, length(c));

  // Gentle stars
  float stars = step(0.995, noise(p*vec2(120.0, 70.0) + t*0.2)) * 0.8;

  // Vignette
  vec2 vc = uv - 0.5;
  float vig = smoothstep(1.05, 0.2, dot(vc, vc));

  vec3 deep   = vec3(0.01, 0.02, 0.07);
  vec3 mid    = vec3(0.05, 0.10, 0.28);
  vec3 bright = vec3(0.10, 0.22, 0.55);
  vec3 glow   = vec3(0.18, 0.35, 0.75);

  vec3 col = mix(deep, mid, 0.6*aur);
  col = mix(col, bright, aur*0.65);
  col += glow * rays * 0.22;
  col += vec3(0.15, 0.25, 0.5) * stars * 0.35;

  // Slight lift near center
  float core = smoothstep(0.55, 0.0, length(uv-0.5));
  col += glow * core * 0.06;

  col *= vig;
  gl_FragColor = vec4(col, 1.0);
}
`;

/**
 * Outsiders — Fractured prism + unstable distortion.
 * Looks “wrong” on purpose: refraction, facets, and wandering warps.
 */
const OUTSIDER_SHADER = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

float hash(vec2 p){
  return fract(sin(dot(p, vec2(41.0, 289.0))) * 43758.5453);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f*f*(3.0-2.0*f);
  float a = hash(i);
  float b = hash(i+vec2(1.0,0.0));
  float c = hash(i+vec2(0.0,1.0));
  float d = hash(i+vec2(1.0,1.0));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}

float fbm(vec2 p){
  float v = 0.0;
  float a = 0.6;
  for(int i=0;i<5;i++){
    v += a*noise(p);
    p = p*2.02 + vec2(17.1, 9.2);
    a *= 0.5;
  }
  return v;
}

// Cheap Voronoi-ish facet edges
float cellEdges(vec2 p){
  vec2 g = floor(p);
  vec2 f = fract(p);
  float md = 10.0;
  for(int y=-1;y<=1;y++){
    for(int x=-1;x<=1;x++){
      vec2 o = vec2(float(x), float(y));
      vec2 r = o + vec2(hash(g+o), hash(g+o+12.3)) - f;
      md = min(md, dot(r,r));
    }
  }
  float d = sqrt(md);
  return 1.0 - smoothstep(0.08, 0.16, d);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = uv;
  p.x *= u_resolution.x / u_resolution.y;

  float t = u_time * 0.10;

  // Wandering warp: like reality slipping
  vec2 warp = vec2(
    fbm(p*2.3 + vec2(0.0, t*1.4)),
    fbm(p*2.3 + vec2(4.2, -t*1.1))
  );
  p += (warp - 0.5) * 0.18;

  // Prism swirl field
  vec2 c = p - vec2(0.5 * (u_resolution.x/u_resolution.y), 0.5);
  float r = length(c);
  float a = atan(c.y, c.x);

  float swirl = sin(a*3.0 + fbm(p*3.0 - t)*2.5) * 0.5 + 0.5;
  float mist  = fbm(p*3.2 + vec2(t*0.6, -t*0.3));
  float v = mix(mist, swirl, 0.55);

  // Facets (fractured glass) overlay
  float facets = cellEdges(p*5.0 + fbm(p*2.0 + t)*1.2);
  float cracks = smoothstep(0.55, 0.95, facets);

  // Vignette
  vec2 vc = uv - 0.5;
  float vig = smoothstep(1.10, 0.25, dot(vc, vc));

  vec3 deep   = vec3(0.03, 0.00, 0.07);
  vec3 mid    = vec3(0.10, 0.03, 0.22);
  vec3 bright = vec3(0.22, 0.08, 0.44);
  vec3 neon   = vec3(0.38, 0.18, 0.70);

  vec3 col = mix(deep, mid, v*0.9);
  col = mix(col, bright, smoothstep(0.35, 0.9, v));
  col += neon * cracks * 0.22;

  // Slight “wrong” chroma separation feel (manual tint shift)
  col += vec3(0.06, 0.00, 0.10) * (0.4 - abs(v-0.5)) * 0.25;

  col *= vig;
  gl_FragColor = vec4(col, 1.0);
}
`;

/**
 * Minions — Embers + smoke + heat shimmer.
 * Busy, sneaky energy: warm sparks drifting through smoldering haze.
 */
const MINION_SHADER = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f*f*(3.0-2.0*f);
  float a = hash(i);
  float b = hash(i+vec2(1.0,0.0));
  float c = hash(i+vec2(0.0,1.0));
  float d = hash(i+vec2(1.0,1.0));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}

float fbm(vec2 p){
  float v = 0.0;
  float a = 0.6;
  mat2 m = mat2(1.8, 1.2, -1.2, 1.8);
  for(int i=0;i<5;i++){
    v += a*noise(p);
    p = m*p + 0.15;
    a *= 0.5;
  }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = uv;
  p.x *= u_resolution.x / u_resolution.y;

  float t = u_time * 0.12;

  // Heat shimmer (subtle vertical waviness)
  float shimmer = fbm(vec2(p.y*1.8, p.x*2.2 + t*1.2));
  p.x += (shimmer - 0.5) * 0.05;

  // Smoke plume: rising turbulent field
  vec2 smokeP = vec2(p.x*1.6, p.y*2.8 - t*1.1);
  float smoke = fbm(smokeP) * fbm(smokeP*1.7 + 2.1);
  smoke = smoothstep(0.25, 0.95, smoke);

  // Ember glow pockets
  vec2 emberP = vec2(p.x*3.0 + t*0.35, p.y*3.6 - t*0.8);
  float embers = pow(max(0.0, 1.0 - fbm(emberP)*1.25), 3.0);

  // Sparks: tiny bright points drifting upward
  vec2 sp = uv;
  sp.y += t*0.6;
  vec2 grid = floor(sp*vec2(90.0, 120.0));
  float rnd = hash(grid);
  vec2 f = fract(sp*vec2(90.0, 120.0));
  float spark = step(0.9945, rnd) * smoothstep(0.35, 0.0, length(f-0.5));

  // Composition
  float v = smoke*0.75 + embers*0.55 + spark*1.2;

  // Vignette
  vec2 vc = uv - 0.5;
  float vig = smoothstep(1.05, 0.22, dot(vc, vc));

  vec3 deep   = vec3(0.05, 0.02, 0.00);
  vec3 mid    = vec3(0.20, 0.08, 0.01);
  vec3 bright = vec3(0.45, 0.20, 0.04);
  vec3 hot    = vec3(0.95, 0.55, 0.10);

  vec3 col = mix(deep, mid, clamp(smoke,0.0,1.0));
  col = mix(col, bright, clamp(embers,0.0,1.0)*0.75);
  col += hot * (spark*0.65 + embers*0.12);

  // Slight sooty desaturation in dense smoke
  col = mix(col, col*vec3(0.95, 0.92, 0.90), smoke*0.35);

  col *= vig;
  gl_FragColor = vec4(col, 1.0);
}
`;

/**
 * Demon — Infernal pulse + sigil ring + harsh tearing.
 * Reads as a presence: breathing core, ritual geometry, and violent interference.
 */
const DEMON_SHADER = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

float hash(vec2 p){
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f*f*(3.0-2.0*f);
  float a = hash(i);
  float b = hash(i+vec2(1.0,0.0));
  float c = hash(i+vec2(0.0,1.0));
  float d = hash(i+vec2(1.0,1.0));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}

float fbm(vec2 p){
  float v = 0.0;
  float a = 0.6;
  for(int i=0;i<5;i++){
    v += a*noise(p);
    p = p*2.0 + vec2(9.7, 3.1);
    a *= 0.5;
  }
  return v;
}

float ring(vec2 p, float r, float w){
  float d = abs(length(p)-r);
  return 1.0 - smoothstep(w, w*2.0, d);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / u_resolution.y;

  float t = u_time * 0.22;

  // Harsh tearing bands (horizontal)
  float band = floor(uv.y * 140.0 + sin(t*3.0)*6.0);
  float tear = step(0.975, hash(vec2(band, floor(t*10.0))));
  uv.x += tear * (hash(vec2(band, floor(t*13.0))) - 0.5) * 0.10;

  // Warp everything with angry turbulence
  vec2 wuv = uv;
  vec2 w = vec2(
    fbm(vec2(uv.y*4.0, uv.x*3.0 + t*1.2)),
    fbm(vec2(uv.x*4.2, uv.y*3.1 - t*1.0))
  );
  wuv += (w - 0.5) * 0.10;

  vec2 q = wuv - 0.5;
  q.x *= u_resolution.x / u_resolution.y;
  float r = length(q);
  float a = atan(q.y, q.x);

  // Breathing core pulse
  float pulse = 0.55 + 0.45*sin(t*1.4 + fbm(q*3.0)*2.0);
  float core = smoothstep(0.55, 0.0, r) * pulse;

  // Sigil ring + rotating barbs
  float sig = ring(q, 0.28 + 0.02*sin(t*0.8), 0.012);
  float barbs = pow(max(0.0, cos(a*6.0 + t*0.9)), 10.0) * ring(q, 0.28, 0.04);

  // Chaotic under-pattern
  float chaos = fbm(q*5.0 + vec2(t*0.8, -t*0.6));
  chaos = pow(chaos, 1.6);

  // Pixel grit
  vec2 px = floor(uv*vec2(90.0, 90.0))/vec2(90.0, 90.0);
  float grit = hash(px + floor(t*5.0)*0.01) * 0.06;

  float v = chaos*0.7 + core*0.9 + sig*0.6 + barbs*0.8 + grit;
  v = clamp(v, 0.0, 1.0);

  // Vignette (keep edges dark)
  vec2 vc = uv - 0.5;
  float vig = smoothstep(1.05, 0.18, dot(vc, vc));

  vec3 deep   = vec3(0.01, 0.00, 0.00);
  vec3 mid    = vec3(0.18, 0.01, 0.01);
  vec3 bright = vec3(0.55, 0.02, 0.01);
  vec3 hot    = vec3(1.00, 0.18, 0.06);

  vec3 col = mix(deep, mid, v*v);
  col = mix(col, bright, smoothstep(0.35, 1.0, v));
  col += hot * (sig*0.35 + barbs*0.25 + tear*0.55);

  // Make tearing read as “screen injury”
  col *= 1.0 - tear*0.15;
  col *= vig;

  gl_FragColor = vec4(col, 1.0);
}
`;


const TEAM_SHADERS: Record<TeamId, string> = {
    townsfolk: TOWNSFOLK_SHADER,
    outsider: OUTSIDER_SHADER,
    minion: MINION_SHADER,
    demon: DEMON_SHADER,
};

// =============================================================================
// COMPONENTS
// =============================================================================

type TeamBackgroundProps = {
    teamId: TeamId;
    children: ReactNode;
};

// ─── Internal: single shader canvas ─────────────────────────────────────────

function ShaderCanvas({ teamId }: { teamId: TeamId }) {
    const team = getTeam(teamId);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useShaderBackground(canvasRef, TEAM_SHADERS[teamId]);
    return (
        <canvas
            ref={canvasRef}
            className={cn(
                "absolute inset-0 w-full h-full bg-gradient-to-br",
                team.colors.gradient,
            )}
        />
    );
}

// ─── Internal: fading-out shader layer ──────────────────────────────────────

function FadeOutLayer({
    teamId,
    onDone,
}: {
    teamId: TeamId;
    onDone: () => void;
}) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // Trigger the fade on the next frame so the browser paints at opacity 1 first
        const raf = requestAnimationFrame(() =>
            requestAnimationFrame(() => setVisible(false)),
        );
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: visible ? 1 : 0 }}
            onTransitionEnd={onDone}
        >
            <ShaderCanvas teamId={teamId} />
        </div>
    );
}

// ─── Public component ───────────────────────────────────────────────────────

type FadingLayer = { key: number; teamId: TeamId };

/**
 * Full-screen team-themed background with a live WebGL shader animation.
 * Falls back to the static CSS gradient if WebGL is unavailable.
 * Centers its children vertically and horizontally.
 *
 * When `teamId` changes, the old shader crossfades out smoothly over 700 ms.
 */
export function TeamBackground({ teamId, children }: TeamBackgroundProps) {
    const [fadingLayers, setFadingLayers] = useState<FadingLayer[]>([]);
    const prevTeamRef = useRef(teamId);
    const keyRef = useRef(0);

    useEffect(() => {
        if (teamId !== prevTeamRef.current) {
            const oldTeam = prevTeamRef.current;
            prevTeamRef.current = teamId;
            const key = ++keyRef.current;
            setFadingLayers((prev) => [...prev, { key, teamId: oldTeam }]);
        }
    }, [teamId]);

    const removeFadingLayer = (key: number) => {
        setFadingLayers((prev) => prev.filter((l) => l.key !== key));
    };

    return (
        <div className="isolate relative min-h-app flex flex-col items-center justify-center p-4">
            {/* Background layers */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                {/* Current shader (always underneath) */}
                <ShaderCanvas teamId={teamId} />

                {/* Previous shaders fading out on top */}
                {fadingLayers.map((layer) => (
                    <FadeOutLayer
                        key={layer.key}
                        teamId={layer.teamId}
                        onDone={() => removeFadingLayer(layer.key)}
                    />
                ))}
            </div>
            {children}
        </div>
    );
}

type CardLinkProps = {
    onClick: () => void;
    isEvil: boolean;
    children: ReactNode;
};

/**
 * Subtle underlined link-style button for card screens.
 * Adapts color to good (parchment) or evil (red) themes.
 */
export function CardLink({ onClick, isEvil, children }: CardLinkProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "mt-5 text-sm underline underline-offset-4 decoration-1 transition-colors",
                isEvil
                    ? "text-red-300/70 hover:text-red-200 decoration-red-400/40"
                    : "text-parchment-300/70 hover:text-parchment-100 decoration-parchment-400/40",
            )}
        >
            {children}
        </button>
    );
}
