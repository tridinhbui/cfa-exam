"use client";

import React, { FC, useRef, useEffect, useState } from "react";

export interface LiquidCrystalProps {
    /** Animation speed multiplier (default: 0.5) */
    speed?: number;
    /** Morph value from 0 (random circles) to 1 (rounded square logo) */
    morph?: number;
    /** CSS class for container styling */
    className?: string;
    /** Color palette (optional) */
    primaryColor?: [number, number, number];
}

const liquidCrystalShader = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_speed;
uniform float u_morph; // 0.0 to 1.0
out vec4 fragColor;

// SDF for a circle
float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

// SDF for a rounded box
float sdRoundedBox(vec2 p, vec2 b, vec4 r) {
    r.xy = (p.x > 0.0) ? r.xy : r.zw;
    r.x  = (p.y > 0.0) ? r.x  : r.y;
    vec2 q = abs(p) - b + r.x;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
}

// Smooth union of two distances
float opSmoothUnion(float d1, float d2, float k) {
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

// Build scene SDF
float mapScene(vec2 uv) {
  float t = u_time * u_speed;
  
  // Controlled paths to keep shapes visible within the viewport
  vec2 p1_rand = vec2(cos(t * 1.1 + 0.5), sin(t * 0.7 + 1.2)) * 0.4;
  vec2 p2_rand = vec2(cos(t * 0.8 - 1.5), sin(t * 1.3 + 2.4)) * 0.45;
  vec2 p3_rand = vec2(cos(t * 0.6 + 3.1), sin(t * 0.9 - 0.8)) * 0.42;
  vec2 p4_rand = vec2(cos(t * 1.5 - 0.2), sin(t * 0.5 + 4.5)) * 0.38;

  // Tighter convergence to form a small energetic cluster at the center
  vec2 p1_target = vec2(0.02, 0.02);
  vec2 p2_target = vec2(-0.02, 0.02);
  vec2 p3_target = vec2(-0.02, -0.02);
  vec2 p4_target = vec2(0.02, -0.02);
  
  // Interpolated positions
  vec2 p1 = mix(p1_rand, p1_target, u_morph);
  vec2 p2 = mix(p2_rand, p2_target, u_morph);
  vec2 p3 = mix(p3_rand, p3_target, u_morph);
  vec2 p4 = mix(p4_rand, p4_target, u_morph);
  
  // Significantly smaller radii to avoid the 'giant purple circle' look
  float r1 = mix(0.12, 0.08, u_morph);
  float r2 = mix(0.1, 0.08, u_morph);
  float r3 = mix(0.14, 0.08, u_morph);
  float r4 = mix(0.11, 0.08, u_morph);

  float b1 = sdCircle(uv - p1, r1);
  float b2 = sdCircle(uv - p2, r2);
  float b3 = sdCircle(uv - p3, r3);
  float b4 = sdCircle(uv - p4, r4);

  // Smooth union for fluid merging
  float u12 = opSmoothUnion(b1, b2, 0.15);
  float u34 = opSmoothUnion(b3, b4, 0.15);
  return opSmoothUnion(u12, u34, 0.2);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  float d = mapScene(uv);

  // AI-inspired colors (Cyan and Bright Blue to match the brain logo)
  vec3 col_inner = vec3(0.0, 0.8, 1.0); // Cyan
  vec3 col_outer = vec3(0.1, 0.4, 0.9); // Electric Blue
  
  // Dynamic color pulse
  float pulse = 0.5 + 0.5 * sin(u_time * 2.0);
  vec3 base_col = mix(col_outer, col_inner, pulse);
  
  // Energy glow effect - glows more as it clusters
  vec3 col = base_col * (0.02 / (abs(d) + 0.01));
  
  // Rim highlights
  col += col_inner * (1.0 - smoothstep(0.0, 0.01, abs(d)));
  
  if (d < 0.0) {
      col = mix(col, vec3(1.0), 0.2); // Brighten core
  }

  // Fade out as it converges into the logo
  float mask = 1.0 - smoothstep(0.0, 0.01, d);
  float fade = 1.0 - pow(u_morph, 1.5); // Snappier fade
  fragColor = vec4(col, mask * fade);
}
`;

const LiquidCrystalLogo: FC<LiquidCrystalProps> = ({
    speed = 0.5,
    morph = 0,
    className = "",
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<any>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl2", { alpha: true });
        if (!gl) return;

        class Renderer {
            prog: WebGLProgram;
            uRes: WebGLUniformLocation;
            uTime: WebGLUniformLocation;
            uSpeed: WebGLUniformLocation;
            uMorph: WebGLUniformLocation;
            buf: WebGLBuffer;

            constructor() {
                const compile = (type: GLenum, src: string) => {
                    const s = gl!.createShader(type)!;
                    gl!.shaderSource(s, src);
                    gl!.compileShader(s);
                    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
                        console.error(gl!.getShaderInfoLog(s));
                        gl!.deleteShader(s);
                        return null;
                    }
                    return s;
                };

                const vsSrc = `#version 300 es
        in vec2 position;
        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
        }`;
                const vs = compile(gl!.VERTEX_SHADER, vsSrc)!;
                const fs = compile(gl!.FRAGMENT_SHADER, liquidCrystalShader)!;

                this.prog = gl!.createProgram()!;
                gl!.attachShader(this.prog, vs);
                gl!.attachShader(this.prog, fs);
                gl!.linkProgram(this.prog);

                const quadVerts = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]);
                this.buf = gl!.createBuffer()!;
                gl!.bindBuffer(gl!.ARRAY_BUFFER, this.buf);
                gl!.bufferData(gl!.ARRAY_BUFFER, quadVerts, gl!.STATIC_DRAW);
                const posLoc = gl!.getAttribLocation(this.prog, "position");
                gl!.enableVertexAttribArray(posLoc);
                gl!.vertexAttribPointer(posLoc, 2, gl!.FLOAT, false, 0, 0);

                this.uRes = gl!.getUniformLocation(this.prog, "u_resolution")!;
                this.uTime = gl!.getUniformLocation(this.prog, "u_time")!;
                this.uSpeed = gl!.getUniformLocation(this.prog, "u_speed")!;
                this.uMorph = gl!.getUniformLocation(this.prog, "u_morph")!;
            }

            render(timeMs: number, currentMorph: number) {
                const w = gl!.canvas.width;
                const h = gl!.canvas.height;
                gl!.viewport(0, 0, w, h);
                gl!.clearColor(0, 0, 0, 0);
                gl!.clear(gl!.COLOR_BUFFER_BIT);
                gl!.useProgram(this.prog);
                gl!.uniform2f(this.uRes, w, h);
                gl!.uniform1f(this.uTime, timeMs * 0.001);
                gl!.uniform1f(this.uSpeed, speed);
                gl!.uniform1f(this.uMorph, currentMorph);
                gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
            }
        }

        rendererRef.current = new Renderer();

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.clientWidth * dpr;
            canvas.height = canvas.clientHeight * dpr;
        };
        window.addEventListener("resize", resize);
        resize();

        let rafId: number;
        const animate = (t: number) => {
            rendererRef.current.render(t, morph);
            rafId = requestAnimationFrame(animate);
        };
        rafId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(rafId);
        };
    }, [morph, speed]);

    return (
        <canvas
            ref={canvasRef}
            className={`block pointer-events-none ${className}`}
            style={{ width: "100%", height: "100%" }}
        />
    );
};

export default LiquidCrystalLogo;
