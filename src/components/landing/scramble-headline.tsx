"use client";

import { useRef, useEffect, useState } from "react";

const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
const STATIC_CHARS = new Set([" ", ".", ","]);

function randChar(): string {
  return POOL[Math.floor(Math.random() * POOL.length)];
}

function ScrambleLine({ text, delay, accent }: { text: string; delay: number; accent?: boolean }) {
  const [chars, setChars] = useState<string[]>(() => text.split(""));
  const [ops, setOps] = useState<number[]>(() => text.split("").map(() => 1));
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const t = text;
    const CHARS = Array.from(text);
    const RESOLVED: boolean[] = new Array(text.length).fill(false);
    let t0 = 0;
    const S = 44;
    const D = 500;
    let raf: number;
    let timeout: ReturnType<typeof setTimeout>;

    const tick = (now: number) => {
      if (!mountedRef.current) return;
      const elapsed = now - t0;

      let allDone = true;
      const next: string[] = [];
      const nextOps: number[] = [];

      for (let i = 0; i < t.length; i++) {
        const c = CHARS[i];
        if (STATIC_CHARS.has(c)) {
          next.push(c);
          nextOps.push(1);
          continue;
        }
        if (RESOLVED[i]) {
          next.push(c);
          nextOps.push(1);
          continue;
        }
        const ce = elapsed - i * S;
        if (ce < 0) {
          next.push(randChar());
          nextOps.push(0.28);
          allDone = false;
        } else if (ce >= D) {
          RESOLVED[i] = true;
          next.push(c);
          nextOps.push(1);
          allDone = false;
        } else {
          next.push(randChar());
          nextOps.push(0.28 + (ce / D) * 0.72);
          allDone = false;
        }
      }

      setChars(next);
      setOps(nextOps);

      if (!allDone) {
        raf = requestAnimationFrame(tick);
      }
    };

    timeout = setTimeout(() => {
      if (!mountedRef.current) return;
      t0 = performance.now();
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      mountedRef.current = false;
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, delay]);

  return (
    <span
      className="scramble-line"
      style={accent ? { color: "var(--accent)", fontStyle: "normal" } : undefined}
    >
      {chars.map((c, i) => (
        <span key={i} style={{ opacity: ops[i] ?? 1 }}>
          {c}
        </span>
      ))}
    </span>
  );
}

export default function ScrambleHeadline() {
  return (
    <h1 className="hero-headline" aria-label="Turn crypto noise into validated signal.">
      <ScrambleLine text="Turn crypto noise" delay={600} />
      <ScrambleLine text="into" delay={940} />
      <ScrambleLine text="validated signal." delay={1280} accent />
    </h1>
  );
}
