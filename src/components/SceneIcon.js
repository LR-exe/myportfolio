// Original monochrome navigation glyphs, drawn for this portfolio.
export default function SceneIcon({ name, className = "", ...props }) {
  const artwork = {
    home: <><path d="M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5" /><path d="m8 15 4-9 4 9M9 13h6" /></>,
    about: <><path d="M4 8V4h4M16 4h4v4M4 16v4h4M16 20h4v-4" /><circle cx="12" cy="9" r="2.5" /><path d="M7 17c1-5 9-5 10 0" /></>,
    experience: <><path d="M3 20h18M5 16v-4h4v4M10 16V8h4v8M15 16V4h4v12" /><path d="m3 6 4-3 3 1" /></>,
    work: <><path d="M3 8h13v12H3zM7 4h13v12M7 12h5M7 16h3" /><path d="m15 3 6 0 0 6" /></>,
    toolkit: <><path d="m8 4-5 8 5 8M16 4l5 8-5 8M14 7l-4 10" /><path d="M11 3h2M11 21h2" /></>,
    contact: <><path d="m3 11 18-8-8 18-3-7-7-3ZM10 14l6-6" /><path d="M3 17v4h4" /></>,
    compass: <><path d="M9 3H3v6M15 3h6v6M21 15v6h-6M9 21H3v-6" /><path d="m16 8-3 5-5 3 3-5 5-3Z" /></>,
    close: <><path d="m7 7 10 10M17 7 7 17M3 8V3h5M16 21h5v-5" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" focusable="false" className={className} {...props}>{artwork[name] || artwork.compass}</svg>;
}
