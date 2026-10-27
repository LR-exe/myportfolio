"use client";

import { useEffect, useRef, useState } from "react";
import SceneIcon from "./SceneIcon";
import { createChapterTransition } from "./chapterTransition";

const chapters = [
  ["home", "A person, before a portfolio.", "Scroll, swipe, or use the arrows to begin."],
  ["about", "It starts with a question.", "What happens when an idea becomes something you can use?"],
  ["experience", "Then the work becomes bigger than one screen.", "Building products led me to building a company."],
  ["work", "Ideas have to survive the real world.", "Different projects. Different problems. One builder's mindset."],
  ["toolkit", "And what you learn is worth passing on.", "The next part of building is helping someone else begin."],
  ["contact", "The next chapter is still unwritten.", "Maybe it starts with your idea."],
];
const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%#";
const display = "font-black leading-[0.95] tracking-[-0.035em] [font-family:'Arial_Black',Impact,sans-serif]";

function Decode({ text, active, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { node.textContent = text; return; }
    const start = performance.now();
    const timer = setInterval(() => {
      const progress = Math.min(1, (performance.now() - start) / 850);
      node.textContent = [...text].map((char, i) => char === " " || i < progress * text.length ? char : characters[Math.floor(Math.random() * characters.length)]).join("");
      if (progress === 1) clearInterval(timer);
    }, 45);
    return () => clearInterval(timer);
  }, [text, active]);
  return <span aria-label={text} className={className}><span ref={ref} aria-hidden="true">{text}</span></span>;
}

const projects = [
  { name: "Ikaai India", kind: "A business needs control over its own content.", description: "A custom CMS connecting a Next.js frontend to a Django backend.", stack: ["Next.js", "Django", "Custom CMS"], url: "https://ikaaiindia.in" },
  { name: "Harsh Tech Automation", kind: "The interface is only the beginning.", description: "Frontend and CMS development with Srijan Maurya. React, Spring Boot and PostgreSQL, deployed with Docker and a custom CI/CD pipeline. Manual testing.", stack: ["React", "Spring Boot", "PostgreSQL"], url: "https://harshtechautomation.com" },
  { name: "StudX", kind: "Sometimes the experience is the story.", description: "A static React frontend shaped through animation and interaction.", stack: ["React", "Motion", "Interaction"], url: "https://studx.in" },
  { name: "Krazyfox", kind: "Another idea becomes a place on the web.", description: "A Next.js website from my selected development work.", stack: ["Next.js", "Frontend", "Web"], url: "https://krazyfox.in" },
];

export default function StoryJourney({ children }) {
  const trackRef = useRef(null);
  const transitionRef = useRef(null);
  const [active, setActive] = useState(0);
  const [perspective, setPerspective] = useState(0);
  const [project, setProject] = useState(0);
  const [milestone, setMilestone] = useState(1);
  const [lesson, setLesson] = useState(0);
  const selected = projects[project];

  useEffect(() => {
    const track = trackRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame;
    let wheelTimer, wheelTotal = 0, wheelLocked = false;
    const transition = createChapterTransition(track, transitionRef.current, setActive);
    const go = transition.go;
    const navigate = (event) => {
      const index = chapters.findIndex(([id]) => id === event.detail);
      if (index >= 0) go(index);
    };
    const update = () => {
      frame = null;
      setActive(Math.max(0, Math.min(chapters.length - 1, Math.round(track.scrollLeft / track.clientWidth))));
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const wheel = (event) => {
      if (event.ctrlKey) return;
      const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      // Keep vertical reading available inside a chapter, especially on small screens.
      let node = event.target;
      while (!horizontal && node && node !== track) {
        if (node.scrollHeight > node.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(node).overflowY)) {
          if ((event.deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 2) || (event.deltaY < 0 && node.scrollTop > 1)) return;
        }
        node = node.parentElement;
      }
      event.preventDefault();
      const delta = (horizontal ? event.deltaX : event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? track.clientWidth : 1);
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => { wheelLocked = false; wheelTotal = 0; }, 180);
      if (wheelLocked) return;
      wheelTotal += delta;
      if (Math.abs(wheelTotal) > 45) {
        wheelLocked = true;
        go(Math.round(track.scrollLeft / track.clientWidth) + Math.sign(wheelTotal));
      }
    };
    const keys = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target.closest("input,textarea,select,button,a,[contenteditable=true]")) return;
      const current = Math.round(track.scrollLeft / track.clientWidth);
      if (event.key === "ArrowRight" || event.key === "PageDown") { event.preventDefault(); go(current + 1); }
      if (event.key === "ArrowLeft" || event.key === "PageUp") { event.preventDefault(); go(current - 1); }
      if (event.key === "Home") { event.preventDefault(); go(0); }
      if (event.key === "End") { event.preventDefault(); go(chapters.length - 1); }
    };
    let touchStart = null;
    const touchDown = event => { if (event.touches.length === 1) touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY }; };
    const touchUp = event => {
      if (!touchStart) return;
      const dx = touchStart.x - event.changedTouches[0].clientX;
      const dy = touchStart.y - event.changedTouches[0].clientY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) go(Math.round(track.scrollLeft / track.clientWidth) + Math.sign(dx));
      touchStart = null;
    };
    track.addEventListener("touchstart", touchDown, { passive: true });
    track.addEventListener("touchend", touchUp, { passive: true });
    let width = track.clientWidth;
    const resize = () => { const index = Math.round(track.scrollLeft / width); width = track.clientWidth; track.scrollTo({ left: index * width, behavior: "instant" }); update(); };
    track.addEventListener("scroll", scroll, { passive: true });
    track.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", keys);
    window.addEventListener("portfolio:navigate", navigate);
    window.addEventListener("resize", resize);
    const hashIndex = chapters.findIndex(([id]) => id === window.location.hash.slice(1));
    if (hashIndex > 0) go(hashIndex);
    update();
    return () => { transition.dispose(); track.removeEventListener("touchstart", touchDown); track.removeEventListener("touchend", touchUp); cancelAnimationFrame(frame); clearTimeout(wheelTimer); track.removeEventListener("scroll", scroll); track.removeEventListener("wheel", wheel); window.removeEventListener("keydown", keys); window.removeEventListener("portfolio:navigate", navigate); window.removeEventListener("resize", resize); };
  }, []);

  const jump = (index) => window.dispatchEvent(new CustomEvent("portfolio:navigate", { detail: chapters[index][0] }));
  const panel = "relative h-full w-screen shrink-0 snap-start overflow-y-auto overflow-x-hidden px-7 pb-12 pt-20 md:px-[7vw] md:pb-16 md:pt-24";
  const kicker = "mb-7 font-mono text-[10px] uppercase tracking-[0.25em] text-black/40";
  return <div className="relative h-svh overflow-hidden">
    <div aria-hidden="true" className="pointer-events-none fixed left-6 top-6 z-20 font-mono text-[10px] tracking-widest text-black/35 md:left-10">LOR / A WORK IN PROGRESS</div>
    <div id="story-track" ref={trackRef} tabIndex={0} aria-label="Horizontal portfolio story. Use left and right arrows to explore." className="flex h-full w-full touch-pan-y overflow-x-hidden overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black">
      <div className="relative h-full w-screen shrink-0 snap-start overflow-y-auto">{children}</div>

      <section id="about" tabIndex={-1} aria-labelledby="origin-title" className={panel}>
        <div className="grid min-h-full items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          <div data-story-reveal><p className={kicker}>01 / CURIOSITY</p><h2 id="origin-title" className={`${display} text-[clamp(64px,11vw,170px)]`}>WHAT<br />IF<span className="text-black/15">?</span></h2><p className="mt-6 max-w-xs font-mono text-xs leading-6 text-black/50">A question becomes an experiment.<br />An experiment becomes something real.</p></div>
          <div data-story-reveal>
            <div role="group" aria-label="Explore what drives me" className="mb-10 flex flex-wrap gap-2">{["CURIOSITY", "BUILDING", "SHARING"].map((label, i) => <button key={label} aria-pressed={perspective === i} onClick={() => setPerspective(i)} className="min-h-11 px-4 font-mono text-[10px] tracking-widest transition hover:bg-neutral-100 aria-pressed:bg-black aria-pressed:text-white">{label}</button>)}</div>
            <h3 className="max-w-xl text-3xl font-black leading-tight md:text-5xl"><Decode active={active === 1} text={["I wanted to know how things work.", "Then I wanted to build them.", "Now I help others start."][perspective]} /></h3>
            <p className="mt-7 max-w-lg text-base leading-8 text-black/60">{["I'm Lokesh Omkar Rathi, a developer based in Nashik. My work moves between the interface people see and the systems running behind it.", "Custom content systems, animated interfaces, backend logic, deployment. I enjoy connecting the pieces until an idea becomes useful.", "Workshops and technical mentoring give that curiosity somewhere else to go: into someone else's first project."][perspective]}</p>
            <button onClick={() => jump(2)} className="mt-9 inline-flex items-center gap-4 py-3 font-mono text-xs tracking-widest">THEN IT GOT BIGGER <SceneIcon name="contact" className="size-5" /></button>
          </div>
        </div>
      </section>

      <section id="experience" tabIndex={-1} aria-labelledby="experience-title" className={panel}>
        <div className="mx-auto flex min-h-full max-w-6xl flex-col justify-center"><p className={kicker}>02 / TAKING OWNERSHIP</p><h2 id="experience-title" data-story-reveal className={`${display} max-w-5xl text-[clamp(34px,4vw,64px)]`}><Decode active={active === 2} text="FROM BUILDING PRODUCTS. TO BUILDING A COMPANY." /></h2>
          <div className="relative mt-8 grid gap-3 md:grid-cols-3">{[["FEB 2026", "The idea", "Planning began."], ["JUL 2026", "The beginning", "Dhivardhana Solutions started."], ["SEP 2026", "A place to build", "Our office opened on September 6."]].map(([date, title, text], i) => <button data-story-reveal key={date} aria-pressed={milestone === i} onClick={() => setMilestone(i)} className="group relative p-5 text-left transition duration-300 hover:bg-neutral-100 aria-pressed:bg-black aria-pressed:text-white"><p className="font-mono text-xs opacity-45">{date}</p><p className="mt-5 text-2xl font-black">{title}</p><p className="mt-3 text-sm opacity-60">{text}</p></button>)}</div>
          <p className="mt-8 max-w-3xl text-base leading-7 text-black/60"><Decode active={active === 2} text={["The planning stage: turning the intention to start a company into concrete work.", "As Co-Founder and Full-Stack Developer, I work across client products and the decisions that shape Dhivardhana Solutions.", "A physical space in Nashik for the company and its learning work. Building products and helping people build skills now share a home."][milestone]} /></p>
        </div>
      </section>

      <section id="work" tabIndex={-1} aria-labelledby="work-title" className={panel}>
        <div className="grid min-h-full items-center gap-10 md:grid-cols-2 md:gap-16">
          <div data-story-reveal><p className={kicker}>03 / PUTTING IT INTO PRACTICE</p><div role="group" aria-label="Choose a project" className="mb-8 flex gap-3">{projects.map((item, i) => <button key={item.name} aria-label={item.name} aria-pressed={project === i} onClick={() => setProject(i)} className="grid size-11 place-items-center font-mono text-sm transition hover:bg-neutral-100 aria-pressed:bg-black aria-pressed:text-white">0{i + 1}</button>)}</div><p className="mb-4 max-w-sm text-sm text-black/50">{selected.kind}</p><h2 id="work-title" className={`${display} text-[clamp(40px,5vw,80px)]`}><Decode text={selected.name} active={active === 3} /></h2><p className="mt-6 max-w-lg text-base leading-7 text-black/60">{selected.description}</p><a href={selected.url} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-4 bg-black px-6 py-4 font-mono text-xs tracking-widest text-white">VISIT PROJECT <SceneIcon name="contact" className="size-5" /></a></div>
          <div data-story-reveal className="relative min-h-72 overflow-hidden bg-neutral-100 p-8 md:p-12"><p className="font-mono text-[9px] tracking-[0.2em] text-black/35">INSIDE THE BUILD / 0{project + 1}</p><div aria-hidden="true" className="absolute -right-3 top-4 text-[180px] font-black leading-none text-black/[0.035]">0{project + 1}</div><div className="relative mt-10 space-y-4">{selected.stack.map((item, i) => <div key={item} className="flex items-center gap-6 bg-white px-5 py-6 shadow-[4px_4px_0_#e5e5e5]"><span className="font-mono text-[10px] text-black/35">0{i + 1}</span><span className="text-xl font-black"><Decode text={item} active={active === 3} /></span><span className="ml-auto"><SceneIcon name={i === 0 ? "work" : "toolkit"} className="size-6" /></span></div>)}</div></div>
        </div>
      </section>

      <section id="toolkit" tabIndex={-1} aria-labelledby="mentor-title" className={panel}>
        <div className="grid min-h-full items-center gap-12 md:grid-cols-2"><div data-story-reveal><p className={kicker}>04 / PASSING IT ON</p><h2 id="mentor-title" className={`${display} text-[clamp(48px,7vw,110px)]`}>BUILD.<br />LEARN.<br /><span className="text-black/20">SHARE.</span></h2></div><div data-story-reveal><p className="max-w-lg text-2xl font-bold leading-snug">Knowing how to build is useful. Helping someone else discover it is another kind of progress.</p><p className="mt-5 max-w-lg leading-7 text-black/55">Through workshops, seminars, and project guidance, I help students explore development and AI tools.</p><div role="group" aria-label="Explore my toolkit" className="mt-9 flex flex-wrap gap-2">{["INTERFACES", "SYSTEMS", "DELIVERY"].map((item, i) => <button key={item} aria-pressed={lesson === i} onClick={() => setLesson(i)} className="min-h-11 px-4 font-mono text-[10px] tracking-widest transition hover:bg-neutral-100 aria-pressed:bg-black aria-pressed:text-white">{item}</button>)}</div><div className="mt-5 min-h-28 bg-neutral-100 p-6"><p className="font-mono text-sm leading-7"><Decode active={active === 4} text={["Next.js / React / JavaScript / Tailwind CSS", "Django / Python / Spring Boot / PostgreSQL", "Docker / CI/CD / Manual testing"][lesson]} /></p></div></div></div>
      </section>

      <section id="contact" tabIndex={-1} aria-labelledby="contact-title" className={panel}>
        <div className="flex min-h-full flex-col justify-center"><p className={kicker}>05 / AN OPEN ENDING</p><h2 id="contact-title" data-story-reveal className={`${display} text-[clamp(70px,14vw,210px)]`}><Decode active={active === 5} text="YOUR TURN." /></h2><div data-story-reveal className="mt-9 flex flex-col justify-between gap-8 md:flex-row md:items-end"><p className="max-w-lg text-lg leading-8 text-black/55">A website. A product. A problem worth solving.<br />Tell me what you want to build next.</p><a href="https://www.linkedin.com/in/lr25/" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-6 self-start bg-black px-7 py-5 font-mono text-xs tracking-widest text-white">START A CONVERSATION <SceneIcon name="contact" className="size-6" /></a></div><a href="https://github.com/L-O-R" target="_blank" rel="noreferrer" className="mt-9 self-start py-3 font-mono text-xs tracking-widest text-black/45 hover:text-black">EXPLORE THE CODE / GITHUB</a></div>
      </section>
    </div>
    <canvas ref={transitionRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 h-full w-full" />
  </div>;
}
