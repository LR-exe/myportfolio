"use client";

import { useEffect, useRef, useState } from "react";

const SYMBOLS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%#<>";

function Scramble({ children, as: Tag = "span", className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    const text = String(children);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer;
    const stop = () => { clearInterval(timer); element.textContent = text; };
    const play = () => {
      stop();
      if (reduced.matches) return;
      const start = performance.now();
      timer = setInterval(() => {
        const progress = Math.min(1, (performance.now() - start) / 850);
        element.textContent = [...text].map((char, index) => char === " " || index < progress * text.length ? char : SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]).join("");
        if (progress === 1) stop();
      }, 45);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) play(); else stop();
    }, { threshold: 0.5 });
    observer.observe(element);
    const interactive = element.closest("a, button") || element;
    interactive.addEventListener("pointerenter", play);
    interactive.addEventListener("focus", play);
    return () => { stop(); observer.disconnect(); interactive.removeEventListener("pointerenter", play); interactive.removeEventListener("focus", play); };
  }, [children]);
  return <Tag aria-label={String(children)} className={className}><span ref={ref} aria-hidden="true">{children}</span></Tag>;
}


function AboutPanel() {
  const [active, setActive] = useState(0);
  const modes = [
    { name: "BUILD", title: "FROM INTERFACE TO INFRASTRUCTURE.", text: "I'm Lokesh Omkar Rathi, a full-stack developer based in Nashik. I connect interfaces with the systems that make them useful, from animated websites to custom content management systems.", detail: "NEXT.JS / DJANGO / POSTGRESQL" },
    { name: "CREATE", title: "BUILDING A COMPANY, TOO.", text: "As co-founder at Dhivardhana Solutions, I work across client products and the everyday decisions that shape a growing business.", detail: "DHIVARDHANA SOLUTIONS / NASHIK" },
    { name: "SHARE", title: "MAKE KNOWLEDGE PRACTICAL.", text: "Through workshops, seminars, and project guidance, I help students explore development and AI tools by building things they can understand and improve.", detail: "WORKSHOPS / MENTORING / PROJECTS" },
  ];
  const mode = modes[active];
  return <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
    <div>
      <Scramble as="h2" className={heading}>IDEAS INTO REALITY.</Scramble>
      <p className="mt-7 max-w-sm text-sm leading-6 text-black/50">Three sides of the same person. Pick a perspective.</p>
      <div role="group" aria-label="Explore my background" className="mt-9 space-y-2">
        {modes.map((item, i) => <button key={item.name} aria-pressed={active === i} onClick={() => setActive(i)} className="group flex min-h-14 w-full max-w-sm items-center justify-between px-4 py-3 text-left transition hover:bg-neutral-100 focus-visible:outline-2 aria-pressed:bg-black aria-pressed:text-white"><span className="font-mono text-[10px] opacity-40">0{i + 1}</span><Scramble className="text-lg font-black tracking-[0.14em]">{item.name}</Scramble><span aria-hidden="true" className="h-px w-6 bg-current transition-all group-hover:w-10" /></button>)}
      </div>
      <a href="https://github.com/L-O-R" target="_blank" rel="noreferrer" className="mt-7 inline-block py-3 font-mono text-[10px] tracking-widest hover:underline"><Scramble>EXPLORE MY GITHUB /</Scramble></a>
    </div>
    <div className="relative overflow-hidden bg-neutral-100 p-8 md:p-10">
      <div aria-hidden="true" className="mb-8 flex items-end justify-between"><span className="font-mono text-7xl font-black leading-none text-black/10">0{active + 1}</span><span className="font-mono text-[9px] tracking-widest text-black/35">LOKESH O. RATHI<br />NASHIK / INDIA</span></div>
      <div key={mode.name} className="min-h-64"><Scramble as="h3" className="max-w-md text-3xl font-black leading-tight">{mode.title}</Scramble><Scramble as="p" className="mt-6 max-w-md text-base leading-7 text-black/60">{mode.text}</Scramble><Scramble as="p" className="mt-8 font-mono text-[10px] tracking-widest text-black/40">{mode.detail}</Scramble></div>
    </div>
  </div>;

}

const work = [
  { name: "Ikaai India", type: "CUSTOM CMS / FULL STACK", text: "A custom content management system connecting a Next.js frontend with a Django backend.", tags: "Next.js · Django", url: "https://ikaaiindia.in" },
  { name: "Harsh Tech Automation", type: "BUSINESS PLATFORM / COLLABORATION", text: "Frontend and CMS work with Srijan Maurya, using Spring Boot and PostgreSQL with Docker and CI/CD deployment.", tags: "React · Spring Boot · PostgreSQL", url: "https://harshtechautomation.com" },
  { name: "StudX", type: "ANIMATED FRONTEND", text: "A static React experience built around motion, interaction, and an expressive frontend.", tags: "React · Animation", url: "https://studx.in" },
  { name: "Krazyfox", type: "WEB DEVELOPMENT", text: "A Next.js website from my selected development work.", tags: "Next.js", url: "https://krazyfox.in" },
];
const heading = "text-[clamp(2.5rem,6vw,6rem)] font-black leading-[1.05] tracking-[0.025em] [font-family:'Arial_Black',Impact,sans-serif] [text-shadow:3px_4px_0_#d4d4d4]";
const section = "mx-auto max-w-[1480px] px-6 py-24 md:px-16 md:py-40";

export default function PortfolioSections() {
  const root = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animations = new Map();
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animations.get(entry.target)?.cancel();
      animations.set(entry.target, entry.target.animate([
        { opacity: 0, transform: "translateY(28px)", filter: "blur(5px)" },
        { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
      ], { duration: 750, easing: "cubic-bezier(.2,.8,.2,1)" }));

    }), { threshold: 0.12 });
    root.current.querySelectorAll("[data-reveal]").forEach((node) => observer.observe(node));
    return () => { observer.disconnect(); animations.forEach((animation) => animation.cancel()); };
  }, []);
  return (
    <div ref={root}>
      <section id="about" tabIndex={-1} className={section}>
        <p className="mb-9 font-mono text-xs tracking-[0.2em]">01 / THE PERSON BEHIND THE CODE</p>
        <div data-reveal><AboutPanel /></div>
      </section>

      <section id="experience" tabIndex={-1} className={section}>
        <p className="mb-8 font-mono text-xs tracking-[0.2em]">02 / EXPERIENCE</p>
        <Scramble as="h2" className={heading}>BUILT THROUGH DOING.</Scramble>
        <div className="mt-16 space-y-5">
          {[
            ["JUL 2026 / PRESENT", "Co-Founder & Full-Stack Developer", "Dhivardhana Solutions", "Building the company alongside client websites, custom content management systems, and frontend-to-backend development."],
            ["PROJECT ENGAGEMENTS", "Independent Development", "Client projects", "Work across Ikaai India, Harsh Tech Automation, StudX, and other web projects. Custom interfaces, backend systems, and deployment, including collaboration with Srijan Maurya on Harsh Tech Automation."],
            ["WORKSHOPS & SEMINARS", "Technical Mentor", "Learning through building", "Helping students explore development and AI tools through practical workshops, seminars, and project guidance."],
          ].map(([date, title, company, description], i) => <article data-reveal key={title} className="group relative overflow-hidden bg-neutral-100 p-7 transition-colors duration-500 hover:bg-black hover:text-white md:p-12"><span aria-hidden="true" className="absolute -right-2 -top-6 text-[150px] font-black leading-none opacity-[0.04]">0{i + 1}</span><div className="relative grid gap-6 md:grid-cols-[1fr_2fr]"><div><p className="font-mono text-[10px] tracking-widest opacity-50">{date}</p><Scramble as="h3" className="mt-4 text-xl font-black">{company}</Scramble></div><div><Scramble as="h4" className="text-2xl font-black md:text-3xl">{title}</Scramble><Scramble as="p" className="mt-5 max-w-2xl leading-relaxed opacity-65">{description}</Scramble></div></div></article>)}
        </div>
      </section>

      <section id="work" tabIndex={-1} className={section}>
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6"><div><p className="mb-8 font-mono text-xs tracking-[0.2em]">03 / SELECTED WORK</p><Scramble as="h2" className={heading}>BUILT TO WORK.</Scramble></div><p className="max-w-xs text-sm leading-relaxed text-black/55">Interfaces, systems, and the details that connect them.</p></div>
        <div className="grid gap-x-12 gap-y-16 md:grid-cols-2">
          {work.map((project, index) => (
            <a data-reveal key={project.name} href={project.url} target="_blank" rel="noreferrer" className="group block pt-5 focus-visible:outline-2 focus-visible:outline-offset-8">
              <div className="flex justify-between font-mono text-[10px] tracking-widest text-black/60"><span>{project.type}</span><span>0{index + 1} ↗</span></div>
              <div className="relative my-7 flex min-h-52 items-end overflow-hidden bg-neutral-100 p-7 transition-colors duration-500 group-hover:bg-black group-hover:text-white md:min-h-64">
                <span aria-hidden="true" className="absolute right-4 top-1 font-mono text-8xl font-black text-black/5 transition-colors group-hover:text-white/10">0{index + 1}</span>
                <Scramble as="h3" className="relative max-w-sm text-4xl font-black leading-tight tracking-tight md:text-5xl">{project.name}</Scramble>
              </div>
              <Scramble as="p" className="max-w-lg text-base leading-relaxed text-black/65">{project.text}</Scramble>
              <p className="mt-6 font-mono text-xs uppercase tracking-wider">{project.tags}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="toolkit" tabIndex={-1} className={section}>
        <p className="mb-8 font-mono text-xs tracking-[0.2em]">04 / MY TOOLKIT</p>
        <Scramble as="h2" className={heading}>ACROSS THE STACK.</Scramble>
        <div className="mt-14 space-y-4">
          {[["01", "INTERFACES", "Next.js / React / JavaScript / Tailwind CSS"], ["02", "SYSTEMS", "Django / Python / Spring Boot / PostgreSQL"], ["03", "DELIVERY", "Docker / CI/CD / Manual testing"], ["04", "MENTORING", "Technical workshops / AI tools / Project guidance"]].map(([number, title, text]) => <div data-reveal key={number} className="grid gap-4 bg-neutral-100 p-7 transition hover:bg-neutral-200 md:grid-cols-[60px_1fr_1.4fr]"><span className="font-mono text-xs text-black/40">{number}</span><Scramble as="h3" className="text-xl font-black tracking-wider">{title}</Scramble><Scramble as="p" className="text-base text-black/60">{text}</Scramble></div>)}
        </div>
      </section>

      <section className={section}>
        <p className="mb-8 font-mono text-xs tracking-[0.2em]">05 / HOW I APPROACH A BUILD</p>
        <Scramble as="h2" className={heading}>MAKE IT MAKE SENSE.</Scramble>
        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {[["01", "UNDERSTAND", "Start with the people, the problem, and what the product needs to do."], ["02", "BUILD", "Shape the interface and the backend together, with clear decisions at each step."], ["03", "REFINE", "Work through the details, test the experience, and prepare it for deployment."]].map(([number, title, text]) => <article data-reveal key={number} className="bg-neutral-100 p-7"><span className="font-mono text-xs text-black/40">{number} /</span><Scramble as="h3" className="my-6 text-2xl font-black">{title}</Scramble><Scramble as="p" className="max-w-sm leading-relaxed text-black/60">{text}</Scramble></article>)}
        </div>
      </section>

      <section id="contact" tabIndex={-1} className={`${section} pb-16`}>
        <p className="mb-8 font-mono text-xs tracking-[0.2em]">06 / START A CONVERSATION</p>
        <Scramble as="h2" className={heading}>LET’S BUILD SOMETHING.</Scramble>
        <div data-reveal className="mt-12 flex flex-col justify-between gap-8 md:flex-row md:items-end"><p className="max-w-lg text-lg leading-relaxed text-black/60">Have a website, a product, or a technical challenge in mind? Tell me what you’re working on.</p><a href="https://www.linkedin.com/in/lr25/" target="_blank" rel="noreferrer" className="inline-flex self-start border-2 border-black px-8 py-5 font-mono text-sm tracking-wider transition hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4"><Scramble>LET’S TALK ON LINKEDIN ↗</Scramble></a></div>
        <footer className="mt-24 flex flex-wrap justify-between gap-5 pt-7 font-mono text-[10px] uppercase tracking-widest text-black/50"><span>Lokesh Omkar Rathi · Nashik, India</span><a href="#home" className="text-black hover:underline">BACK TO TOP ↑</a></footer>
      </section>
    </div>
  );
}
