"use client";

import { useEffect, useRef } from "react";

type IconDrawer = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  rot: number,
  color: string,
  alpha: number
) => void;

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const drawSpark: IconDrawer = (ctx, x, y, s, rot, color, alpha) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, s * 0.055);
  ctx.lineJoin = "round";
  const L = s * 0.7;
  const pinch = s * 0.1;
  ctx.beginPath();
  ctx.moveTo(0, -L);
  ctx.quadraticCurveTo(pinch, -pinch, L, 0);
  ctx.quadraticCurveTo(pinch, pinch, 0, L);
  ctx.quadraticCurveTo(-pinch, pinch, -L, 0);
  ctx.quadraticCurveTo(-pinch, -pinch, 0, -L);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(L * 0.62, -L * 0.62, s * 0.055, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

const drawFlask: IconDrawer = (ctx, x, y, s, rot, color, alpha) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, s * 0.05);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-s * 0.14, -s * 0.7);
  ctx.lineTo(-s * 0.14, -s * 0.15);
  ctx.lineTo(-s * 0.55, s * 0.55);
  ctx.quadraticCurveTo(-s * 0.6, s * 0.75, -s * 0.35, s * 0.75);
  ctx.lineTo(s * 0.35, s * 0.75);
  ctx.quadraticCurveTo(s * 0.6, s * 0.75, s * 0.55, s * 0.55);
  ctx.lineTo(s * 0.14, -s * 0.15);
  ctx.lineTo(s * 0.14, -s * 0.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-s * 0.22, -s * 0.7);
  ctx.lineTo(s * 0.22, -s * 0.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-s * 0.08, s * 0.4, s * 0.06, 0, Math.PI * 2);
  ctx.moveTo(s * 0.15 + s * 0.05, s * 0.55);
  ctx.arc(s * 0.15, s * 0.55, s * 0.05, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

const drawGlass: IconDrawer = (ctx, x, y, s, rot, color, alpha) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, s * 0.06);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(-s * 0.05, -s * 0.05, s * 0.42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(s * 0.28, s * 0.28);
  ctx.lineTo(s * 0.62, s * 0.62);
  ctx.stroke();
  ctx.restore();
};

const drawNotebook: IconDrawer = (ctx, x, y, s, rot, color, alpha) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, s * 0.045);
  ctx.lineJoin = "round";
  const w = s * 0.62;
  const h = s * 0.82;
  ctx.strokeRect(-w / 2, -h / 2, w, h);
  const rings = 4;
  for (let i = 0; i < rings; i++) {
    const rx = -w / 2 + (w / (rings - 1)) * i;
    ctx.beginPath();
    ctx.arc(rx, -h / 2, s * 0.045, 0, Math.PI, false);
    ctx.stroke();
  }
  for (let j = 1; j <= 3; j++) {
    const ly = -h / 2 + (h / 4) * j;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + s * 0.08, ly);
    ctx.lineTo(w / 2 - s * 0.08, ly);
    ctx.stroke();
  }
  ctx.restore();
};

const ICONS = [drawSpark, drawFlask, drawGlass, drawNotebook];
const ICON_COLOR = "#ffffff";

export default function BackgroundTexture() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    function paint() {
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = Math.max(window.innerHeight, document.documentElement.scrollHeight);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const rand = mulberry32(2026);
      const cell = 92;
      const cols = Math.ceil(w / cell) + 1;
      const rows = Math.ceil(h / cell) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (rand() > 0.8) continue;
          const jitterX = (rand() - 0.5) * cell * 0.8;
          const jitterY = (rand() - 0.5) * cell * 0.8;
          const x = c * cell + cell / 2 + jitterX;
          const y = r * cell + cell / 2 + jitterY;
          const size = 15 + rand() * 14;
          const rot = (rand() - 0.5) * 1.2;
          const icon = ICONS[Math.floor(rand() * ICONS.length)];
          const alpha = 0.1 + rand() * 0.1;
          icon(ctx, x, y, size, rot, ICON_COLOR, alpha);
        }
      }
    }

    paint();
    window.addEventListener("resize", paint);

    // Content height changes between stages (e.g. review -> results) without a
    // window resize event, so also repaint when the page's own height changes.
    const resizeObserver = new ResizeObserver(() => paint());
    resizeObserver.observe(document.documentElement);

    return () => {
      window.removeEventListener("resize", paint);
      resizeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="bg-texture" aria-hidden="true" />;
}
