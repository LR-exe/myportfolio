// Sample the visible chapter into ink positions without a screenshot library.
export function sampleChapter(panel, width, height) {
  const mask = document.createElement('canvas');
  mask.width = width; mask.height = height;
  const ctx = mask.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, width, height);
  panel.querySelectorAll('canvas').forEach(canvas => {
    const rect = canvas.getBoundingClientRect();
    if (canvas.width && canvas.height) ctx.drawImage(canvas, rect.left, rect.top, rect.width, rect.height);
  });
  const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let node;
  while ((node = walker.nextNode())) {
    if (!node.textContent.trim()) continue;
    const style = getComputedStyle(node.parentElement);
    if (style.color === 'rgba(0, 0, 0, 0)' || style.visibility === 'hidden') continue;
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    ctx.fillStyle = '#000'; ctx.textBaseline = 'top';
    for (let i = 0; i < node.length; i++) {
      if (!node.textContent[i].trim()) continue;
      range.setStart(node, i); range.setEnd(node, i + 1);
      const rect = range.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < height && rect.right > 0 && rect.left < width) ctx.fillText(node.textContent[i], rect.left, rect.top);
    }
  }
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const points = [];
  const step = width < 700 ? 7 : 9;
  for (let y = 0; y < height; y += step) for (let x = 0; x < width; x += step) {
    const index = (y * width + x) * 4;
    if (pixels[index] < 180 && pixels[index + 3] > 50) points.push({ x, y });
  }
  // Shuffle so glyphs dissolve individually rather than in scan lines.
  for (let i = points.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [points[i], points[j]] = [points[j], points[i]];
  }
  return points;
}

export function createChapterTransition(track, canvas, onChange) {
  const ctx = canvas.getContext('2d');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%#';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame, busy = false, disposed = false;
  const ease = t => t * t * (3 - 2 * t);
  const clamp = t => Math.max(0, Math.min(1, t));
  function go(index) {
    index = Math.max(0, Math.min(track.children.length - 1, index));
    const current = Math.round(track.scrollLeft / track.clientWidth);
    if (busy || index === current) return;
    const arrive = () => { track.scrollTo({ left: track.children[index].offsetLeft, behavior: 'instant' }); onChange(index); };
    if (reduced.matches) { arrive(); return; }
    busy = true;
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;
    const source = sampleChapter(track.children[current], w, h);
    const count = Math.min(2400, Math.max(1000, source.length));
    const particles = Array.from({ length: count }, (_, i) => {
      const cloud = { x: Math.random() * w, y: Math.random() * h };
      return { source: source[i % Math.max(1, source.length)] || cloud, cloud, delay: Math.random() * .18, size: 12 + Math.random() * 12, char: Math.floor(Math.random() * chars.length), phase: Math.random() * 6.28 };
    });
    const start = performance.now();
    let destination, switched = false;
    const draw = now => {
      if (disposed) return;
      const t = (now - start) / 2100;
      if (t >= .5 && !switched) {
        arrive();
        destination = sampleChapter(track.children[index], w, h);
        switched = true;
      }
      // Content and its glyph silhouette crossfade in place at both ends.
      track.style.opacity = String(t < .5 ? 1 - clamp(t / .18) : clamp((t - .80) / .20));
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#111'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
      particles.forEach((p, i) => {
        const spreading = ease(clamp((t - p.delay * .5) / .38));
        const gathering = ease(clamp((t - .5 - p.delay) / .30));
        const target = destination?.[i % Math.max(1, destination.length)];
        let x = p.source.x + (p.cloud.x - p.source.x) * spreading;
        let y = p.source.y + (p.cloud.y - p.source.y) * spreading;
        if (target) { x += (target.x - x) * gathering; y += (target.y - y) * gathering; }
        const size = 6 + (p.size - 6) * spreading * (1 - gathering);
        const flicker = .45 + .55 * Math.abs(Math.sin(now / 170 + p.phase));
        ctx.globalAlpha = clamp(t / .12) * (1 - clamp((t - .8) / .2)) * (target || t < .5 ? 1 : 1 - gathering) * flicker;
        ctx.font = `${Math.round(size)}px monospace`;
        ctx.fillText(chars[(p.char + Math.floor(now / (85 + i % 90))) % chars.length], x, y);
      });
      ctx.globalAlpha = 1;
      if (t < 1) frame = requestAnimationFrame(draw);
      else { track.style.opacity = ''; ctx.clearRect(0, 0, w, h); busy = false; }
    };
    frame = requestAnimationFrame(draw);
  }
  return { go, dispose() { disposed = true; cancelAnimationFrame(frame); track.style.opacity = ''; ctx.clearRect(0, 0, canvas.width, canvas.height); } };
}
