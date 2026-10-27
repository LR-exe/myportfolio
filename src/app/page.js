"use client";

import { useEffect, useRef } from "react";
import StoryJourney from "@/components/StoryJourney";
import ScrambleCursor from "@/components/ScrambleCursor";
import SceneNavigation from "@/components/SceneNavigation";
import ScrollField from "@/components/ScrollField";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ012345678998%01";
const ROLES = ["Full-Stack Developer", "Co-Founder", "Technical Mentor"];
const clamp = (v) => Math.min(1, Math.max(0, v));
const ease = (v) => v * v * (3 - 2 * v);

export default function Home() {
  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  const portraitRef = useRef(null);
  const roleRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const photo = new window.Image();
    let photoReady = false;
    let disposed = false;
    let frame;
    let width, height, particles, photoBox, titleBox, start;
    let resizeTimer;
    let lastRole = -1;
    let roleAnimation;
    let roleTimer;
    let scrambleTimer;
    let titleFont, titleSize, titleLeading, titleSpacing;
    const atlas = document.createElement("canvas");
    atlas.width = CHARS.length * 48;
    atlas.height = 64;
    const ink = atlas.getContext("2d");
    ink.fillStyle = "black";
    ink.font = "40px monospace";
    ink.textAlign = "center";
    ink.textBaseline = "middle";
    [...CHARS].forEach((char, index) => ink.fillText(char, index * 48 + 24, 32));

    function drawTitle(context) {
      context.font = titleFont;
      context.textAlign = "left";
      context.textBaseline = "top";
      context.fillStyle = "black";
      context.shadowColor = "#c6c6c6";
      context.shadowOffsetX = 4;
      context.shadowOffsetY = 5;
      ["LOKESH", "RATHI."].forEach((line, index) => {
        let x = titleBox.x;
        const y = titleBox.y + index * titleLeading + (titleLeading - titleSize) / 2;
        for (const letter of line) {
          context.fillText(letter, x, y);
          x += context.measureText(letter).width + titleSpacing;
        }
      });
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
      context.shadowColor = "transparent";
    }

    function flipRole() {
      roleAnimation?.cancel();
      roleAnimation = roleRef.current.animate([
        { transform: "perspective(600px) rotateX(0deg)", opacity: 1 },
        { transform: "perspective(600px) rotateX(90deg)", opacity: 0 },
      ], { duration: 260, easing: "ease-in", fill: "forwards" });
      roleAnimation.onfinish = () => {
        if (disposed) return;
        lastRole = (lastRole + 1) % ROLES.length;
        const target = ROLES[lastRole];
        let tick = 0;
        clearInterval(scrambleTimer);
        scrambleTimer = setInterval(() => {
          tick++;
          roleRef.current.textContent = [...target].map((c, i) => i < tick * 2 || c === " " ? c : CHARS[Math.floor(Math.random() * CHARS.length)]).join("");
          if (tick * 2 >= target.length) clearInterval(scrambleTimer);
        }, 40);
        subtitleRef.current.textContent = ["Interfaces, systems, and everything between.", "Building Dhivardhana Solutions.", "Helping others turn curiosity into code."][lastRole];
        roleAnimation.cancel();
        roleAnimation = roleRef.current.animate([
          { transform: "perspective(600px) rotateX(-90deg)", opacity: 0 },
          { transform: "perspective(600px) rotateX(0deg)", opacity: 1 },
        ], { duration: 440, easing: "cubic-bezier(.2,.8,.2,1)" });
      };
    }

    function setup() {
      if (disposed) return;
      cancelAnimationFrame(frame);
      clearInterval(roleTimer);
      clearInterval(scrambleTimer);
      roleAnimation?.cancel();
      width = Math.round(canvas.clientWidth);
      height = Math.round(canvas.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      photoBox = portraitRef.current.getBoundingClientRect();
      titleBox = titleRef.current.getBoundingClientRect();
      const origin = canvas.getBoundingClientRect();
      photoBox = { x: photoBox.x - origin.x, y: photoBox.y - origin.y, width: photoBox.width, height: photoBox.height };
      titleBox = { x: titleBox.x - origin.x, y: titleBox.y - origin.y };
      const mask = document.createElement("canvas");
      mask.width = width;
      mask.height = height;
      const paint = mask.getContext("2d", { willReadFrequently: true });
      if (photoReady) {
        const scale = Math.min(photoBox.width / photo.width, photoBox.height / photo.height);
        const w = photo.width * scale, h = photo.height * scale;
        photoBox = { x: photoBox.x + (photoBox.width - w) / 2, y: photoBox.y + (photoBox.height - h) / 2, width: w, height: h };
        paint.drawImage(photo, photoBox.x, photoBox.y, photoBox.width, photoBox.height);
      }
      const font = getComputedStyle(titleRef.current);
      paint.fillStyle = "black";
      paint.font = `${font.fontWeight} ${font.fontSize} ${font.fontFamily}`;
      paint.textBaseline = "top";
      titleFont = `${font.fontWeight} ${font.fontSize} ${font.fontFamily}`;
      titleSize = parseFloat(font.fontSize);
      titleLeading = parseFloat(font.lineHeight);
      titleSpacing = parseFloat(font.letterSpacing) || 0;
      drawTitle(paint);
      const pixels = paint.getImageData(0, 0, width, height).data;
      const targets = [];
      const step = width < 700 ? 5 : 6;
      // Jittered image samples are destinations only; the opening field is completely scattered.
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const i = (Math.floor(y) * width + Math.floor(x)) * 4;
          const brightness = 1 - (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 765;
          if (pixels[i + 3] > 80 && brightness > 0.09) targets.push({ x, y, brightness });
        }
      }
      for (let i = targets.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [targets[i], targets[j]] = [targets[j], targets[i]];
      }
      const budget = width < 700 ? 2600 : 6500;
      targets.length = Math.min(targets.length, budget);
      const count = Math.max(width < 700 ? 2300 : 4200, targets.length);
      particles = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width, y: Math.random() * height,
        target: targets[i], delay: Math.random() * 2.4,
        phase: Math.random() * 6.28, speed: 1 + Math.random() * 3,
        size: 12 + Math.random() * 12,
        char: Math.floor(Math.random() * CHARS.length),
        changeAt: Math.random() * 0.4,
      }));
      start = performance.now();
      roleRef.current.style.opacity = "0";
      subtitleRef.current.style.opacity = "0";
      lastRole = 0;
      roleRef.current.textContent = ROLES[0];
      frame = requestAnimationFrame(draw);
    }

    function draw(now) {
      if (disposed) return;
      const elapsed = reduced.matches ? 12 : (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const p of particles) {
        const progress = ease(clamp((elapsed - 2.7 - p.delay) / 3.8));
        if (elapsed > p.changeAt && progress < 0.85) {
          p.char = Math.floor(Math.random() * CHARS.length);
          p.changeAt = elapsed + 0.08 + Math.random() * 0.5;
        }
        const flicker = 0.12 + 0.75 * Math.pow((Math.sin(elapsed * p.speed * 3 + p.phase) + 1) / 2, 2);
        const resolve = clamp((elapsed - 7.6 - p.delay * 0.25) / 1.8);
        let alpha, x, y, size;
        if (p.target) {
          x = p.x + (p.target.x - p.x) * progress;
          y = p.y + (p.target.y - p.y) * progress;
          size = p.size + (5 - p.size) * progress;
          alpha = (flicker * (1 - progress) + p.target.brightness * progress) * (1 - resolve);
        } else {
          x = p.x; y = p.y; size = p.size;
          alpha = flicker * (1 - progress);
        }
        if (alpha < 0.015) continue;
        ctx.globalAlpha = alpha;
        ctx.drawImage(atlas, p.char * 48, 0, 48, 64, x - size * 0.6, y - size * 0.8, size * 1.2, size * 1.6);
      }
      // The formed glyph silhouette resolves into the photo in exactly the same coordinates.
      const finish = ease(clamp((elapsed - 7.6) / 2.4));
      ctx.globalAlpha = finish;
      if (photoReady) ctx.drawImage(photo, photoBox.x, photoBox.y, photoBox.width, photoBox.height);
      drawTitle(ctx);
      ctx.globalAlpha = 1;
      roleRef.current.style.opacity = String(finish);
      subtitleRef.current.style.opacity = String(finish);
      if (elapsed >= 10) {
        // Freeze the finished canvas. Only the occasional role flip stays active.
        if (!reduced.matches) roleTimer = window.setInterval(flipRole, 3000);
        return;
      }
      frame = requestAnimationFrame(draw);
    }

    photo.onload = () => { photoReady = true; setup(); };
    photo.onerror = () => { photoReady = false; };
    photo.src = "/portrait.png";
    setup();
    const resize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(setup, 180); };

    window.addEventListener("resize", resize);
    reduced.addEventListener("change", setup);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      clearTimeout(resizeTimer);
      clearInterval(roleTimer);
      clearInterval(scrambleTimer);
      roleAnimation?.cancel();

      window.removeEventListener("resize", resize);
      reduced.removeEventListener("change", setup);
    };
  }, []);

  return (
    <main className="bg-white text-black [&_*]:cursor-[inherit] [@media(hover:hover)_and_(pointer:fine)_and_(prefers-reduced-motion:no-preference)]:cursor-none">
      <ScrambleCursor />
      <SceneNavigation />
      <ScrollField />
      <StoryJourney>
      <section tabIndex={-1} id="home" aria-label="Introduction" className="relative min-h-svh overflow-hidden">
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
      <div className="relative flex min-h-svh w-full flex-col items-center justify-center md:flex-row">
        <div ref={portraitRef} role="img" aria-label="Portrait of Lokesh Rathi" className="h-[55svh] w-full md:h-svh md:w-1/2" />
        <div className="w-full px-7 pb-24 md:w-1/2 md:px-[3vw] md:pb-0">
          <h1 ref={titleRef} className="text-[clamp(44px,6.5vw,130px)] font-black leading-[1.12] tracking-[0.06em] text-transparent [font-family:'Arial_Black',Impact,sans-serif]">LOKESH<br />RATHI.</h1>
          <div className="mt-7 h-12 overflow-hidden [perspective:600px]">
            <p ref={roleRef} className="origin-center text-lg font-black tracking-tight text-black/75 [backface-visibility:hidden] opacity-0 md:text-2xl">Full-Stack Developer</p>
          </div>
          <p ref={subtitleRef} className="mt-4 max-w-md font-mono text-xs leading-6 tracking-wide text-black/50 opacity-0 md:text-sm">Interfaces, systems, and everything between.</p>
        </div>
      </div>

      </section>
      </StoryJourney>
    </main>
  );
}
