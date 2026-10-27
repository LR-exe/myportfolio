"use client";
import { useEffect, useRef } from "react";
export default function ScrollField() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current, ctx = canvas.getContext("2d");
    const track = document.getElementById("story-track");
    if (!track) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame, until = 0, last = 0, points = [], w, h;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%";
    function resize() {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w; canvas.height = h;
      points = Array.from({ length: w < 700 ? 65 : 140 }, () => ({ x: Math.random() * w, y: Math.random() * h, phase: Math.random() * 6.28 }));
    }
    function draw(now) {
      frame = null;
      if (reduced.matches || document.hidden) { ctx.clearRect(0, 0, w, h); return; }
      if (now - last > 50) {
        last = now;
        ctx.clearRect(0, 0, w, h);
        const visibility = Math.min(1, track.scrollLeft / w) * Math.max(0, Math.min(1, (until - now) / 500));
        ctx.font = "14px monospace";
        for (const point of points) {
          ctx.fillStyle = `rgba(0,0,0,${visibility * (0.04 + 0.06 * (Math.sin(now / 400 + point.phase) + 1) / 2)})`;
          ctx.fillText(chars[Math.floor(Math.random() * chars.length)], (point.x - track.scrollLeft * 0.15 % w + w) % w, point.y);
        }
      }
      if (now < until) frame = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, w, h);
    }
    function scroll() { until = performance.now() + 700; if (!frame) frame = requestAnimationFrame(draw); }
    resize();
    window.addEventListener("resize", resize);
    track.addEventListener("scroll", scroll, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); track.removeEventListener("scroll", scroll); };
  }, []);
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-10 h-full w-full" />;
}
