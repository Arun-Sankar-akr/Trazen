import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * WebGL hero object: wireframe core + inner crystal + orbit rings + particle field.
 * It turns to face the cursor (fast damping), drifts with scroll and "kicks" on click.
 * Colour = CSS `color` of .m3d-hero3d (see motion3d.css).
 */
export default function Hero3D({ className = '' }) {
  const box = useRef(null);
  useEffect(() => {
    const mount = box.current;
    if (!mount) return undefined;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); }
    catch { return undefined; }                         // no WebGL -> just no background
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = innerWidth < 720;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 8;
    const color = new THREE.Color(getComputedStyle(mount).color);
    const mat = (o, w = false) => new THREE.MeshBasicMaterial({ color, wireframe: w, transparent: true, opacity: o });

    const group = new THREE.Group(); scene.add(group);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 1), mat(0.5, true));
    const inner = new THREE.Mesh(new THREE.OctahedronGeometry(0.85, 0), mat(0.9, true));
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.008, 8, 180), mat(0.55));
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.006, 8, 180), mat(0.3));
    ringA.rotation.x = Math.PI / 2.3; ringB.rotation.set(Math.PI / 3, Math.PI / 5, 0);
    group.add(core, inner, ringA, ringB);

    const N = small ? 260 : 700, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 3.6 + Math.random() * 6, a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(b) * Math.cos(a); pos[i * 3 + 1] = r * Math.sin(b) * Math.sin(a); pos[i * 3 + 2] = r * Math.cos(b);
    }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const stars = new THREE.Points(pg, new THREE.PointsMaterial({ color, size: 0.04, transparent: true, opacity: 0.8, sizeAttenuation: true }));
    group.add(stars);

    const p = { x: 0, y: 0 }, s = { x: 0, y: 0 };      // pointer target / smoothed (-1..1)
    let kick = 0, visible = true, raf = 0, last = performance.now();
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
      group.position.x = w > h ? 2.6 : 0; group.scale.setScalar(w > h ? 1 : 0.75);
    };
    const onMove = (e) => { p.x = (e.clientX / innerWidth) * 2 - 1; p.y = (e.clientY / innerHeight) * 2 - 1; };
    const onScroll = () => { if (!fine) { p.x = Math.sin(scrollY / 380) * 0.7; p.y = Math.cos(scrollY / 520) * 0.5; } };
    const onDown = (e) => { const r = mount.getBoundingClientRect(); if (e.clientY >= r.top && e.clientY <= r.bottom) kick = 1; };

    const frame = (now) => {
      if (!reduce) raf = requestAnimationFrame(frame);
      if (!visible) { last = now; return; }
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const k = 1 - Math.exp(-dt * 12);                 // ~80ms response
      s.x += (p.x - s.x) * k; s.y += (p.y - s.y) * k;
      kick *= Math.exp(-dt * 4);
      const t = now * 0.001;
      group.rotation.y = s.x * 0.9 + t * 0.12;
      group.rotation.x = s.y * 0.6 + scrollY * 0.0006;
      group.position.y = -scrollY * 0.0014;
      core.rotation.y = t * 0.25; inner.rotation.set(t * 0.6, t * 0.4, 0);
      ringA.rotation.z = t * 0.2; ringB.rotation.z = -t * 0.14;
      stars.rotation.y = -s.x * 0.2 - t * 0.02;
      group.scale.setScalar((mount.clientWidth > mount.clientHeight ? 1 : 0.75) * (1 + kick * 0.22));
      inner.scale.setScalar(1 + kick * 0.6);
      renderer.render(scene, camera);
    };

    resize();
    const ro = new ResizeObserver(resize); ro.observe(mount);
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }); io.observe(mount);
    if (fine) addEventListener('pointermove', onMove, { passive: true });
    addEventListener('scroll', onScroll, { passive: true }); addEventListener('pointerdown', onDown);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      removeEventListener('pointermove', onMove); removeEventListener('scroll', onScroll); removeEventListener('pointerdown', onDown);
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
  }, []);
  return <div ref={box} className={`m3d-hero3d ${className}`} aria-hidden="true" />;
}