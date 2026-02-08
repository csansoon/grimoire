import { ReactNode, useRef } from "react";
import { getTeam, TeamId } from "../../lib/teams";
import { useShaderBackground } from "../../hooks/useShaderBackground";
import { cn } from "../../lib/utils";

// =============================================================================
// FRAGMENT SHADERS — one per team
// =============================================================================

/**
 * Townsfolk — Ethereal blue aurora.
 * Slow, layered sine waves with visible blob movement.
 */
const TOWNSFOLK_SHADER = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float t = u_time * 0.15;

    // More layered waves with bigger movement
    float w1 = sin(uv.x * 3.0 + t * 1.2) * cos(uv.y * 2.5 - t * 0.9);
    float w2 = sin(uv.x * 5.0 + uv.y * 3.0 - t * 0.7) * 0.7;
    float w3 = cos(uv.x * 2.0 - uv.y * 4.0 + t * 0.5) * 0.5;
    float w4 = sin(length(uv - vec2(0.3, 0.7)) * 4.0 - t * 0.8) * 0.4;
    float v = (w1 + w2 + w3 + w4) * 0.2 + 0.5;

    // Soft vignette
    vec2 vc = uv - 0.5;
    float vig = 1.0 - dot(vc, vc) * 1.2;

    vec3 deep   = vec3(0.01, 0.01, 0.06);
    vec3 mid    = vec3(0.05, 0.08, 0.25);
    vec3 bright = vec3(0.08, 0.15, 0.4);

    vec3 col = mix(deep, mid, v);
    col = mix(col, bright, max(0.0, w1) * 0.4);
    col += vec3(0.02, 0.04, 0.08) * max(0.0, w4) * vig;
    col *= vig;

    gl_FragColor = vec4(col, 1.0);
}
`;

/**
 * Outsider — Chaotic purple swirl.
 * Deeper purple palette, sharper crystalline shapes layered over swirling mist.
 */
const OUTSIDER_SHADER = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float t = u_time * 0.2;

    vec2 c = uv - 0.5;
    float r = length(c);
    float a = atan(c.y, c.x);

    // Swirling base — more chaotic, higher frequencies
    float w1 = sin(a * 4.0 + t * 1.3 + sin(r * 10.0 - t * 1.2));
    float w2 = sin(r * 8.0 - t + sin(a * 3.0 + t * 0.7)) * 0.8;
    float w3 = cos(uv.x * 9.0 + uv.y * 7.0 + t * 0.5) * 0.6;
    float v = (w1 + w2 + w3) * 0.18 + 0.5;

    // Sharper crystalline overlay — geometric facets
    vec2 p = uv * 4.0;
    float cell = abs(sin(p.x + t * 0.4)) * abs(cos(p.y - t * 0.3));
    float edge = smoothstep(0.15, 0.18, abs(fract(cell * 3.0 + t * 0.1) - 0.5));

    float vig = 1.0 - dot(c, c) * 1.4;

    // Deeply purple palette
    vec3 deep   = vec3(0.03, 0.0, 0.07);
    vec3 mid    = vec3(0.1, 0.03, 0.22);
    vec3 bright = vec3(0.18, 0.06, 0.38);
    vec3 accent = vec3(0.12, 0.04, 0.3);

    vec3 col = mix(deep, mid, v);
    col = mix(col, bright, max(0.0, w1) * 0.35);
    col += accent * edge * 0.25 * vig;
    col += vec3(0.02, 0.0, 0.04) * max(0.0, w2) * vig;
    col *= vig;

    gl_FragColor = vec4(col, 1.0);
}
`;

/**
 * Minion — Conspiratorial morphing spirals.
 * Integer arm counts avoid the atan seam; tightness and blend evolve over time.
 */
const MINION_SHADER = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float t = u_time * 0.2;

    vec2 p = uv * 2.0 - 1.0;
    float r = length(p);
    float a = atan(p.y, p.x);

    // Two interlocked spirals (integer arms = no seam)
    // Tightness morphs over time for evolving shapes
    float tight1 = 5.0 + sin(t * 0.2) * 2.0;
    float spiral1 = a * 3.0 + r * tight1 - t * 0.8;
    float s1 = sin(spiral1) * 0.5 + 0.5;

    float tight2 = 4.0 + cos(t * 0.15) * 1.5;
    float spiral2 = a * 5.0 - r * tight2 + t * 0.5;
    float s2 = sin(spiral2) * 0.5 + 0.5;

    // Crossfade blend ratio drifts over time
    float blend = sin(t * 0.1) * 0.3 + 0.5;

    // Pulsing radial glow
    float pulse = sin(r * 5.0 - t * 1.2) * 0.5 + 0.5;
    pulse = smoothstep(0.2, 0.8, pulse);

    // Blend with soft transitions
    float v = s1 * blend + s2 * (1.0 - blend) * 0.8 + pulse * 0.25;
    v = smoothstep(0.1, 0.9, v);

    // Smoky accent using integer multiplier (4 = no seam)
    float smoke = abs(sin(a * 4.0 + t * 0.3)) * r;

    vec2 vc = uv - 0.5;
    float vig = 1.0 - dot(vc, vc) * 1.0;

    vec3 deep   = vec3(0.04, 0.01, 0.0);
    vec3 mid    = vec3(0.22, 0.07, 0.01);
    vec3 bright = vec3(0.4, 0.14, 0.02);

    vec3 col = mix(deep, mid, v * vig);
    col = mix(col, bright, max(0.0, s1 - 0.5) * 0.5 * vig);
    col += vec3(0.08, 0.02, 0.0) * smoke * 0.2 * vig;

    gl_FragColor = vec4(col, 1.0);
}
`;

/**
 * Demon — Glitchy red chaos.
 * Thin fast glitch lines, heavily warped and aggressive base patterns.
 */
const DEMON_SHADER = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float t = u_time * 0.35;

    // Very thin, rare glitch lines — brief flickers of corruption
    float band = floor(uv.y * 80.0 + sin(t * 3.0) * 5.0);
    float glitch = step(0.985, hash(vec2(band, floor(t * 4.0))));
    uv.x += glitch * (hash(vec2(band, floor(t * 6.0))) - 0.5) * 0.06;

    // UV warping for extra chaos
    vec2 c = uv - 0.5;
    float r = length(c);
    float a = atan(c.y, c.x);
    vec2 warp = uv + vec2(
        sin(uv.y * 12.0 + t * 2.5) * 0.03,
        cos(uv.x * 10.0 - t * 2.0) * 0.03
    );

    // Many aggressive wave layers
    float w1 = sin(warp.x * 18.0 + t * 2.5) * sin(warp.y * 15.0 - t * 2.0);
    float w2 = sin(r * 12.0 - t * 3.5 + sin(a * 5.0 + t));
    float w3 = cos(a * 6.0 + t * 1.8 + sin(r * 8.0 - t * 2.0)) * 0.7;
    float w4 = sin((warp.x + warp.y) * 20.0 + t * 3.0) * 0.5;

    // Pixelated noise
    vec2 pxUv = floor(uv * 50.0) / 50.0;
    float px = hash(pxUv + floor(t * 3.0) * 0.01);

    float v = (w1 * 0.3 + w2 * 0.25 + w3 * 0.25 + w4 * 0.2) * 0.5 + 0.5;
    v += px * 0.05;

    vec2 vc = uv - 0.5;
    float vig = 1.0 - dot(vc, vc) * 0.7;

    vec3 deep   = vec3(0.01, 0.0, 0.0);
    vec3 mid    = vec3(0.2, 0.01, 0.01);
    vec3 bright = vec3(0.45, 0.02, 0.0);

    vec3 col = mix(deep, mid, v * v * vig);
    col = mix(col, bright * 0.6, max(0.0, w2) * 0.2 * vig);

    // Thin glitch highlights
    col += vec3(0.5, 0.03, 0.0) * glitch * 0.6;
    col += vec3(0.1, 0.0, 0.0) * px * glitch;

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

/**
 * Full-screen team-themed background with a live WebGL shader animation.
 * Falls back to the static CSS gradient if WebGL is unavailable.
 * Centers its children vertically and horizontally.
 */
export function TeamBackground({ teamId, children }: TeamBackgroundProps) {
    const team = getTeam(teamId);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useShaderBackground(canvasRef, TEAM_SHADERS[teamId]);

    return (
        <div className="isolate relative min-h-app flex flex-col items-center justify-center p-4">
            {/* Shader canvas — gradient is the CSS fallback if WebGL fails */}
            <canvas
                ref={canvasRef}
                className={cn(
                    "absolute inset-0 w-full h-full -z-10 bg-gradient-to-br",
                    team.colors.gradient,
                )}
            />
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
