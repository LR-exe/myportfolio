"use client";

import { useEffect, useRef } from "react";

export default function ScrambleCursor() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const enabled = window.matchMedia("(pointer: fine) and (hover: hover) and (prefers-reduced-motion: no-preference)");
    const symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%";
    let timer;
    let angle = 0;
    let visible = false;
    let interactive = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = 100 * dpr;
    canvas.height = 100 * dpr;
    ctx.scale(dpr, dpr);
    function draw() {
      ctx.clearRect(0, 0, 100, 100);
      ctx.fillStyle = "white";
      ctx.font = "11px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      angle += interactive ? 0.09 : 0.045;
      ctx.beginPath();
      ctx.arc(50, 50, interactive ? 4 : 2, 0, Math.PI * 2);
      ctx.fill();
      const radius = interactive ? 39 : 29;
      for (let i = 0; i < 14; i++) {
        const phase = angle + i * Math.PI * 2 / 14;
        ctx.save();
        ctx.translate(50 + Math.cos(phase) * radius, 50 + Math.sin(phase) * radius);
        ctx.rotate(phase + Math.PI / 2);
        ctx.fillText(symbols[Math.floor(Math.random() * symbols.length)], 0, 0);
        ctx.restore();
      }
    }
    function hide() { visible = false; canvas.style.opacity = "0"; clearInterval(timer); }
    function move(event) {
      if (!enabled.matches || event.pointerType === "touch") return;
      interactive = Boolean(event.target.closest?.("a,button,[role=button]"));
      canvas.style.transform = `translate3d(${event.clientX - 50}px,${event.clientY - 50}px,0)`;
      if (!visible) { visible = true; canvas.style.opacity = "1"; draw(); timer = setInterval(draw, 100); }
    }
    const visibility = () => { if (document.hidden) hide(); };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    document.addEventListener("visibilitychange", visibility);
    enabled.addEventListener("change", hide);
    return () => { hide(); window.removeEventListener("pointermove", move); document.documentElement.removeEventListener("pointerleave", hide); window.removeEventListener("blur", hide); document.removeEventListener("visibilitychange", visibility); enabled.removeEventListener("change", hide); };
  }, []);
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-50 h-[100px] w-[100px] opacity-0 mix-blend-difference" />;
}
