"use client";

import { useRef, useEffect } from "react";
import styles from "./hero-animation.module.css";

const CARD_CONFIGS = [
  {
    id: 3, src: "/images/bg-card-3.webp",
    animClass: "floatLeftWall",
    style: { position: "absolute" as const, left: "0px", top: "18%", width: "92px", height: "192px" },
    duration: "13s", delay: "1.5s",
  },
  {
    id: 4, src: "/images/bg-card-4.webp",
    animClass: "floatRightWall",
    style: { position: "absolute" as const, right: "0px", top: "22%", width: "92px", height: "192px" },
    duration: "11s", delay: "5.5s",
  },
  {
    id: 5, src: "/images/bg-card-5.webp",
    animClass: "floatCeilingTR",
    style: { position: "absolute" as const, top: "-20px", right: "3%", width: "242px", height: "132px" },
    duration: "11s", delay: "0.5s",
  },
  {
    id: 6, src: "/images/bg-card-6.webp",
    animClass: "floatCeilingTL",
    style: { position: "absolute" as const, top: "-20px", left: "4%", width: "222px", height: "128px" },
    duration: "13s", delay: "7s",
  },
];

export default function HeroAnimation() {
  return (
    <div className="hero-anim" aria-hidden="true">
      <HeroCanvas />
      <div className="hero-anim-cards">
        {CARD_CONFIGS.map((card) => (
          <div
            key={card.id}
            className={styles[card.animClass as keyof typeof styles]}
            style={{
              ...card.style,
              backgroundImage: `url(${card.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "4px",
              boxShadow: "0 6px 24px rgba(0,0,0,0.85)",
              animationDuration: card.duration,
              animationDelay: card.delay,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationFillMode: "both",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Canvas tunnel (separate component for clean lifecycle) ── */

function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let tm = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.offsetWidth;
      h = parent.offsetHeight;
      if (w > 0 && h > 0) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    resize();

    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    const draw = () => {
      if (!w || !h) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const vx = w / 2;
      const vy = h * 0.42;
      tm += 0.0022;
      const t = tm % 1;

      ctx.fillStyle = "#06060a";
      ctx.fillRect(0, 0, w, h);

      // ── Rays from vanishing point to edges ──
      const rays: [number, number][] = [
        [0, 0],        [w * 0.25, 0], [w * 0.5, 0], [w * 0.75, 0], [w, 0],
        [w, h * 0.33], [w, h * 0.67], [w, h],
        [w * 0.75, h], [w * 0.5, h],  [w * 0.25, h], [0, h],
        [0, h * 0.67], [0, h * 0.33],
      ];
      rays.forEach(([rx, ry]) => {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(rx, ry);
        ctx.stroke();
      });

      // ── Floor depth lines ──
      for (let i = 0; i < 14; i++) {
        const d0 = ((i / 14) + t) % 1;
        const d = d0 * d0;
        const y = vy + d * (h - vy);
        const x1 = vx - d * vx;
        const x2 = vx + d * (w - vx);
        ctx.strokeStyle = `rgba(255, 255, 255, ${d0 * 0.28})`;
        ctx.lineWidth = 0.4 + d * 0.85;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
      }

      // ── Ceiling depth lines ──
      for (let i = 0; i < 14; i++) {
        const d0 = ((i / 14) + t) % 1;
        const d = d0 * d0;
        const y = vy - d * vy;
        const x1 = vx - d * vx;
        const x2 = vx + d * (w - vx);
        ctx.strokeStyle = `rgba(255, 255, 255, ${d0 * 0.20})`;
        ctx.lineWidth = 0.4 + d * 0.6;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.stroke();
      }

      // ── Left + right wall verticals ──
      for (let i = 0; i < 10; i++) {
        const d0 = ((i / 10) + t) % 1;
        const d = d0 * d0;
        const topY = vy - d * vy;
        const botY = vy + d * (h - vy);
        const xL = vx - d * vx;
        const xR = vx + d * (w - vx);
        ctx.strokeStyle = `rgba(255, 255, 255, ${d0 * 0.16})`;
        ctx.lineWidth = 0.4;
        ctx.beginPath();
        ctx.moveTo(xL, topY);
        ctx.lineTo(xL, botY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xR, topY);
        ctx.lineTo(xR, botY);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-anim-canvas" />;
}
