import { useEffect, RefObject } from "react";

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

function compileShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string,
): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

/**
 * Renders a GLSL fragment shader on a canvas element as a full-screen background.
 *
 * The shader receives two uniforms:
 *   - `u_time`       (float)  — elapsed seconds since mount
 *   - `u_resolution` (vec2)   — canvas size in pixels
 *
 * Renders at a reduced resolution (`pixelScale`, default 0.5) for performance,
 * and pauses automatically when the document is hidden.
 */
export function useShaderBackground(
    canvasRef: RefObject<HTMLCanvasElement | null>,
    fragmentShader: string,
    pixelScale: number = 0.5,
) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl", {
            alpha: false,
            antialias: false,
            depth: false,
            stencil: false,
            preserveDrawingBuffer: false,
        });
        if (!gl) return;

        // --- Compile & link program ---
        const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
        const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
        if (!vs || !fs) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.warn("Shader link error:", gl.getProgramInfoLog(program));
            return;
        }

        // --- Full-screen quad (two triangles) ---
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
            gl.STATIC_DRAW,
        );

        const posLoc = gl.getAttribLocation(program, "a_position");
        const timeLoc = gl.getUniformLocation(program, "u_time");
        const resLoc = gl.getUniformLocation(program, "u_resolution");

        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        // --- Resize handler (renders at reduced resolution) ---
        const resize = () => {
            const w = Math.max(1, Math.floor(canvas.clientWidth * pixelScale));
            const h = Math.max(1, Math.floor(canvas.clientHeight * pixelScale));
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
                gl.viewport(0, 0, w, h);
            }
        };
        resize();

        const observer = new ResizeObserver(resize);
        observer.observe(canvas);

        // --- Animation loop ---
        let animationId = 0;
        let paused = false;
        const startTime = performance.now();

        const render = () => {
            if (!paused) {
                const time = (performance.now() - startTime) / 1000;
                gl.useProgram(program);
                gl.uniform1f(timeLoc, time);
                gl.uniform2f(resLoc, canvas.width, canvas.height);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
            }
            animationId = requestAnimationFrame(render);
        };

        // Pause when tab is hidden to save GPU
        const onVisibility = () => {
            paused = document.hidden;
        };
        document.addEventListener("visibilitychange", onVisibility);

        render();

        // --- Cleanup ---
        return () => {
            cancelAnimationFrame(animationId);
            document.removeEventListener("visibilitychange", onVisibility);
            observer.disconnect();
            gl.deleteBuffer(buffer);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            gl.deleteProgram(program);
        };
    }, [canvasRef, fragmentShader, pixelScale]);
}
