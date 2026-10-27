"use client";
import { useEffect, useRef, useState } from "react";
import SceneIcon from "./SceneIcon";
const scenes = [["home", "Intro"], ["about", "About"], ["experience", "Experience"], ["work", "Work"], ["toolkit", "Toolkit"], ["contact", "Contact"]];
export default function SceneNavigation() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const trigger = useRef(null);
  const box = useRef(null);
  const nav = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { root: document.getElementById("story-track"), threshold: 0.5 });
    scenes.forEach(([id]) => { const section = document.getElementById(id); if (section) observer.observe(section); });
    const escape = event => { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    const outside = event => { if (!nav.current?.contains(event.target)) setOpen(false); };
    window.addEventListener("keydown", escape);
    window.addEventListener("pointerdown", outside);
    return () => { observer.disconnect(); window.removeEventListener("keydown", escape); window.removeEventListener("pointerdown", outside); };
  }, []);
  useEffect(() => {
    if (!open || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animations = [box.current.animate([
      { clipPath: "inset(0 0 100% 100%)", transform: "rotate(8deg) scale(.8)" },
      { clipPath: "inset(0 0 0 0)", transform: "rotate(-2deg) scale(1.02)", offset: .75 },
      { clipPath: "inset(0 0 0 0)", transform: "rotate(0) scale(1)" },
    ], { duration: 550, easing: "cubic-bezier(.2,.8,.2,1)" })];
    box.current.querySelectorAll("a").forEach((link, i) => animations.push(link.animate([
      { opacity: 0, transform: "translateY(35px) rotateX(-70deg)" },
      { opacity: 1, transform: "translateY(0) rotateX(0)" },
    ], { duration: 420, delay: 140 + i * 45, fill: "backwards", easing: "cubic-bezier(.2,.8,.2,1)" })));
    return () => animations.forEach(animation => animation.cancel());
  }, [open]);
  return <nav ref={nav} aria-label="Explore portfolio scenes" className="fixed right-4 top-4 z-40 md:right-8 md:top-8">
    <button ref={trigger} aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="scene-map" onClick={() => setOpen(!open)} className="group ml-auto grid size-14 place-items-center bg-black text-white shadow-[4px_4px_0_#ccc] transition-transform hover:-rotate-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black">
      <svg aria-hidden="true" viewBox="0 0 32 32" className="size-8" fill="none" stroke="currentColor" strokeWidth="2">
        {open ? <path d="m8 8 16 16M24 8 8 24" /> : <><path d="M4 11V4h7M21 4h7v7M28 21v7h-7M11 28H4v-7" /><path d="m16 8 8 8-8 8-8-8Z" className="origin-center transition-transform duration-500 group-hover:rotate-90" /><path d="M13 16h6M16 13v6" /></>}
      </svg>
    </button>
    {open && <div ref={box} id="scene-map" className="absolute right-0 top-20 w-[min(360px,calc(100vw-32px))] origin-top-right bg-black p-5 text-white shadow-[8px_8px_0_#d4d4d4] [perspective:700px]">
      <p className="mb-5 flex justify-between font-mono text-[9px] tracking-[.24em] text-white/45"><span>CHOOSE YOUR CHAPTER</span><span>01 / 06</span></p>
      <div className="grid grid-cols-2 gap-2">{scenes.map(([id, label], i) => <a key={id} href={`#${id}`} aria-current={active === id ? "location" : undefined} onClick={event => { event.preventDefault(); setOpen(false); trigger.current?.focus(); window.dispatchEvent(new CustomEvent("portfolio:navigate", { detail: id })); }} className="group relative overflow-hidden bg-white/10 p-4 transition duration-200 hover:-translate-y-1 hover:rotate-[-2deg] hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white aria-[current=location]:bg-white aria-[current=location]:text-black">
        <span className="flex items-start justify-between"><span className="font-mono text-[10px] opacity-40">0{i + 1}</span><SceneIcon name={id} className="size-6 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-125" /></span>
        <span className="mt-6 block text-lg font-black tracking-tight">{label}</span>
        <span aria-hidden="true" className="absolute -bottom-1 right-1 translate-y-full font-mono text-[9px] opacity-30 transition-transform group-hover:translate-y-0">{`0${i + 1} / X%`}</span>
      </a>)}</div>
      <p className="mt-5 font-mono text-[9px] tracking-widest text-white/35">SCROLL OR SWIPE TO KEEP EXPLORING</p>
    </div>}
  </nav>;
}
