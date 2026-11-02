import { useEffect, useRef } from 'react';

/**
 * Interactive signal lattice (the Lumio "Lab" idea): a 3D dot-grid that
 * rotates with the cursor, swells near it and sends a pulse on click.
 * Colour comes from the CSS `color` of .m3d-lattice (see motion3d.css).
 */
export default function Lattice({ className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return undefined;
    const ctx = c.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = innerWidth < 720;
    const COLS = small ? 16 : 32, ROWS = small ? 14 : 20;
    let w = 0, h = 0, raf = 0, visible = true, col = '#7aa7ff';
    const m = { x: 0, y: 0, sx: 0, sy: 0, px: -9999, py: -9999 };
    const pulses = [];
    const pts = Array.from({ length: COLS * ROWS }, () => ({ x: 0, y: 0, e: 0 }));

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2), r = c.getBoundingClientRect();
      w = r.width; h = r.height; c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      col = getComputedStyle(c).color;
    };
    const onMove = (e) => {
      const r = c.getBoundingClientRect();
      m.px = e.clientX - r.left; m.py = e.clientY - r.top;
      m.x = (e.clientX / innerWidth) * 2 - 1; m.y = (e.clientY / innerHeight) * 2 - 1;
    };
    const onDown = (e) => {
      const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (x >= 0 && y >= 0 && x <= r.width && y <= r.height) pulses.push({ x, y, t0: performance.now() });
    };

    const draw = (now) => {
      if (!reduce) raf = requestAnimationFrame(draw);
      if (!visible) return;
      m.sx += (m.x - m.sx) * 0.06; m.sy += (m.y - m.sy) * 0.06;
      ctx.clearRect(0, 0, w, h);
      const a = m.sx * 0.22, b = -m.sy * 0.14, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), D = 900;
      for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
        const u = i / (COLS - 1) - 0.5, v = j / (ROWS - 1) - 0.5;
        let X = u * w * 1.1, Y = v * h * 1.1;
        let Z = Math.sin(u * 7 + now * 0.0006) * Math.cos(v * 6 + now * 0.0008) * 16;
        const sx0 = w / 2 + X, sy0 = h / 2 + Y;
        const dx = sx0 - m.px, dy = sy0 - m.py, f = Math.exp(-(dx * dx + dy * dy) / (2 * 150 * 150));
        Z += f * 80; X -= dx * f * 0.1; Y -= dy * f * 0.1;
        for (const p of pulses) {
          const age = (now - p.t0) / 1000, d = Math.hypot(sx0 - p.x, sy0 - p.y) - age * 520, k = Math.max(0, 1 - Math.abs(d) / 70);
          Z += k * Math.max(0, 1 - age / 1.8) * 100;
        }
        const x1 = X * ca - Z * sa, z1 = X * sa + Z * ca, y1 = Y * cb - z1 * sb, z2 = Y * sb + z1 * cb, s = D / (D - z2);
        const p = pts[j * COLS + i];
        p.x = w / 2 + x1 * s; p.y = h / 2 + y1 * s; p.e = Math.min(1, Math.max(0, Z / 90 + 0.12));
      }
      while (pulses.length && now - pulses[0].t0 > 2200) pulses.shift();
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1;
      for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
        const p = pts[j * COLS + i];
        ctx.globalAlpha = 0.07 + p.e * 0.5;
        ctx.beginPath();
        if (i < COLS - 1) { ctx.moveTo(p.x, p.y); ctx.lineTo(pts[j * COLS + i + 1].x, pts[j * COLS + i + 1].y); }
        if (j < ROWS - 1) { ctx.moveTo(p.x, p.y); ctx.lineTo(pts[(j + 1) * COLS + i].x, pts[(j + 1) * COLS + i].y); }
        ctx.stroke();
        ctx.globalAlpha = 0.25 + p.e * 0.75;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1 + p.e * 2.4, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    resize();
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
    io.observe(c);
    addEventListener('resize', resize); addEventListener('pointermove', onMove, { passive: true }); addEventListener('pointerdown', onDown);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      removeEventListener('resize', resize); removeEventListener('pointermove', onMove); removeEventListener('pointerdown', onDown);
    };
  }, []);
  return <canvas ref={ref} className={`m3d-lattice ${className}`} aria-hidden="true" />;
}
