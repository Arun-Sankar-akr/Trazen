import { useEffect } from 'react';

/**
 * Fast pointer tracker (no lag):
 *  - time-based damping (~60ms), not per-frame lerp
 *  - writes transforms straight onto the few elements that need them (no page-wide CSS vars)
 *  - rects are cached, loop sleeps when nothing is moving
 * tilt:  [[selector, maxDeg], ...]       depth: { selector: [parallaxPx, translateZpx] }
 */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const MAGNETIC = '.ax-pill, .demo-button, .demo-nav-cta, .rest-book, .forma-nav-link, .forma-cta a, .forma-hero-bottom a, .rest-hero-content a, .visit-details a, .demo-contact a';

export default function useMotion3D({ tilt = [], depth = {}, cursor = true, magnetic = true } = {}, routeKey = '') {
  useEffect(() => {
    const mq = (q) => window.matchMedia(q).matches;
    if (mq('(prefers-reduced-motion: reduce)')) return undefined;
    const fine = mq('(hover: hover) and (pointer: fine)');
    const undo = [];
    const tgt = { nx: 0, ny: 0 }, sm = { nx: 0, ny: 0 };
    const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
    let raf = 0, last = 0, stale = true, cx = mouse.x, cy = mouse.y;

    const layers = [], items = [], mags = [];
    let ring = null;

    /* depth layers */
    Object.entries(depth).forEach(([sel, [px, z = 0]]) => document.querySelectorAll(sel).forEach((el) => {
      layers.push({ el, px, z });
      undo.push(() => { el.style.translate = ''; });
    }));

    /* tilt cards */
    tilt.forEach(([sel, deg = 8]) => document.querySelectorAll(sel).forEach((el) => {
      el.classList.add('m3d-tilt');
      const it = { el, deg, rx: 0, ry: 0, s: 1, trx: 0, try_: 0, hover: false, active: false, r: null };
      const enter = () => { it.r = el.getBoundingClientRect(); it.hover = true; it.active = true; wake(); };
      const move = (e) => {
        if (!it.r) it.r = el.getBoundingClientRect();
        const px = (e.clientX - it.r.left) / it.r.width - 0.5, py = (e.clientY - it.r.top) / it.r.height - 0.5;
        it.try_ = clamp(px * 2, -1, 1) * deg; it.trx = clamp(-py * 2, -1, 1) * deg;
      };
      const leave = () => { it.hover = false; it.r = null; wake(); };
      if (fine) { el.addEventListener('pointerenter', enter); el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave); }
      items.push(it);
      undo.push(() => {
        el.removeEventListener('pointerenter', enter); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave);
        el.classList.remove('m3d-tilt'); el.style.transform = '';
      });
    }));

    /* magnetic buttons */
    if (magnetic && fine) document.querySelectorAll(MAGNETIC).forEach((el) => {
      el.classList.add('m3d-mag'); mags.push({ el, r: null, ox: 0, oy: 0 });
      undo.push(() => { el.classList.remove('m3d-mag'); el.style.translate = ''; });
    });

    /* cursor ring */
    if (cursor && fine) {
      ring = document.createElement('div');
      ring.className = 'm3d-cursor'; ring.setAttribute('aria-hidden', 'true');
      document.body.appendChild(ring);
      const over = (e) => ring.classList.toggle('is-hot', !!e.target.closest('a, button, summary, input, select, textarea, .m3d-tilt'));
      const down = () => ring.classList.add('is-down'), up = () => ring.classList.remove('is-down');
      addEventListener('pointerover', over); addEventListener('pointerdown', down); addEventListener('pointerup', up);
      undo.push(() => { removeEventListener('pointerover', over); removeEventListener('pointerdown', down); removeEventListener('pointerup', up); ring.remove(); });
    }

    /* loop: only runs while something is moving */
    function tick(now) {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      let busy = false;

      const kd = 1 - Math.exp(-dt * 16);
      sm.nx += (tgt.nx - sm.nx) * kd; sm.ny += (tgt.ny - sm.ny) * kd;
      if (Math.abs(tgt.nx - sm.nx) > 0.001 || Math.abs(tgt.ny - sm.ny) > 0.001) busy = true;
      for (const l of layers) l.el.style.translate = `${(-sm.nx * l.px).toFixed(2)}px ${(-sm.ny * l.px).toFixed(2)}px ${l.z}px`;

      const kt = 1 - Math.exp(-dt * 18);
      for (const it of items) {
        if (!it.active) continue;
        const gx = it.hover ? it.trx : 0, gy = it.hover ? it.try_ : 0, gs = it.hover ? 1.03 : 1;
        it.rx += (gx - it.rx) * kt; it.ry += (gy - it.ry) * kt; it.s += (gs - it.s) * kt;
        const off = Math.abs(gx - it.rx) + Math.abs(gy - it.ry) + Math.abs(gs - it.s) * 50;
        if (!it.hover && off < 0.02) { it.active = false; it.el.style.transform = ''; continue; }
        busy = true;
        it.el.style.transform = `perspective(1000px) rotateX(${it.rx.toFixed(2)}deg) rotateY(${it.ry.toFixed(2)}deg) scale3d(${it.s.toFixed(3)},${it.s.toFixed(3)},1)`;
      }

      if (ring) {
        const kc = 1 - Math.exp(-dt * 32);
        cx += (mouse.x - cx) * kc; cy += (mouse.y - cy) * kc;
        ring.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
        if (Math.abs(mouse.x - cx) > 0.3 || Math.abs(mouse.y - cy) > 0.3) busy = true;
      }

      if (mags.length) {
        if (stale) { mags.forEach((m) => { m.r = m.el.getBoundingClientRect(); }); stale = false; }
        for (const m of mags) {
          const mx = m.r.left + m.r.width / 2 - m.ox, my = m.r.top + m.r.height / 2 - m.oy;
          const dx = mouse.x - mx, dy = mouse.y - my, near = Math.hypot(dx, dy) < Math.max(m.r.width * 0.8, 90);
          const nx = near ? dx * 0.25 : 0, ny = near ? dy * 0.35 : 0;
          if (nx !== m.ox || ny !== m.oy) { m.ox = nx; m.oy = ny; m.el.style.translate = near ? `${nx.toFixed(1)}px ${ny.toFixed(1)}px` : ''; stale = true; }
        }
      }
      if (busy) raf = requestAnimationFrame(tick);
    }
    function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }

    const onMove = (e) => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      if (ring) ring.classList.add('is-on');
      tgt.nx = (e.clientX / innerWidth) * 2 - 1; tgt.ny = (e.clientY / innerHeight) * 2 - 1;
      wake();
    };
    const onScroll = () => {
      stale = true; items.forEach((i) => { if (!i.hover) i.r = null; });
      if (!fine) { tgt.nx = Math.sin(scrollY / 380) * 0.7; tgt.ny = Math.cos(scrollY / 520) * 0.5; wake(); }
    };
    if (fine) addEventListener('pointermove', onMove, { passive: true });
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    undo.push(() => { removeEventListener('pointermove', onMove); removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(raf); });

    if (layers.length) wake();
    return () => undo.forEach((fn) => fn());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);
}