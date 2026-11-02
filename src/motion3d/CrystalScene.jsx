import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * CrystalScene - full-page "floating crystals" animation (replaces the wires).
 * ~48 low-poly 3D shapes (icosahedra, octahedra, rings, cubes) drift at different depths:
 *   - cursor: shapes are pushed away, spin up and swell; a light follows the pointer
 *   - scroll: near shapes travel faster than far ones (real depth parallax down the whole page)
 *   - click: a burst throws nearby shapes outward and spins them
 * palette = { a, b, hot } hex colours; changing it cross-fades smoothly.
 */
const CAM = 9;
const rand = (a, b) => a + Math.random() * (b - a);
const mod = (n, m) => ((n % m) + m) % m;

export default function CrystalScene({ palette, layer = 'back' }) {
  const box = useRef(null);
  const pal = useRef(palette);
  pal.current = palette;

  useEffect(() => {
    const mount = box.current;
    if (!mount) return undefined;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); }
    catch { return undefined; }
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = innerWidth < 720;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = CAM;

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4); sun.position.set(3, 5, 6); scene.add(sun);
    const glow = new THREE.PointLight(0xff6a3d, 70, 14, 2); scene.add(glow);   // follows the pointer

    const geos = [
      new THREE.IcosahedronGeometry(0.55, 0), new THREE.OctahedronGeometry(0.62, 0),
      new THREE.TorusGeometry(0.45, 0.17, 12, 28), new THREE.BoxGeometry(0.75, 0.75, 0.75),
    ];
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.38, metalness: 0.12, flatShading: true, transparent: true, opacity: 0.62, depthWrite: false });
    const per = small ? 6 : 12;
    const meshes = [], shapes = [];
    geos.forEach((g, gi) => {
      const m = new THREE.InstancedMesh(g, mat, per);
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); meshes.push(m);
      for (let i = 0; i < per; i++) shapes.push({
        m: gi, i, bx: rand(-1, 1), by: rand(-1, 1), z: rand(-7, 2.5), s: rand(0.45, 1.05),
        tone: Math.random() < 0.55 ? 0 : Math.random() < 0.6 ? 1 : 2,
        rx: rand(0, 6.28), ry: rand(0, 6.28), sx: rand(-0.5, 0.5), sy: rand(-0.5, 0.5), spin: 0,
        ox: 0, oy: 0, vx: 0, vy: 0,
      });
    });

    const cA = new THREE.Color(palette.a), cB = new THREE.Color(palette.b), cH = new THREE.Color(palette.hot);
    const tA = new THREE.Color(), tB = new THREE.Color(), tH = new THREE.Color(), cD = new THREE.Color();
    const dummy = new THREE.Object3D();
    const half = { x: 6, y: 3.7 }, p = { x: 0, y: 0 }, s = { x: 0, y: 0, scroll: 0 }, ptr = { x: 99, y: 99 };
    let raf = 0, last = performance.now(), click = null;

    const resize = () => {
      const w = innerWidth, h = innerHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
      half.y = Math.tan(THREE.MathUtils.degToRad(22.5)) * CAM; half.x = half.y * camera.aspect;
    };
    const toWorld = (cx, cy, o) => { o.x = (cx / innerWidth * 2 - 1) * half.x; o.y = -(cy / innerHeight * 2 - 1) * half.y; };
    const onMove = (e) => { p.x = e.clientX; p.y = e.clientY; };
    const onDown = (e) => { const o = { x: 0, y: 0 }; toWorld(e.clientX, e.clientY, o); click = o; };

    const frame = (now) => {
      if (!reduce) raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const k = 1 - Math.exp(-dt * 14);
      s.x += (p.x - s.x) * k; s.y += (p.y - s.y) * k;
      s.scroll += (scrollY - s.scroll) * (1 - Math.exp(-dt * 8));
      toWorld(s.x, s.y, ptr);
      const wpp = (half.y * 2) / innerHeight;

      tA.set(pal.current.a); tB.set(pal.current.b); tH.set(pal.current.hot);
      const c = 1 - Math.exp(-dt * 4);
      cA.lerp(tA, c); cB.lerp(tB, c); cH.lerp(tH, c); cD.copy(cA).multiplyScalar(0.3);
      glow.color.copy(cH); glow.position.set(ptr.x, ptr.y, 3.2);
      camera.position.x = ((s.x / innerWidth) * 2 - 1) * 0.5; camera.position.y = -((s.y / innerHeight) * 2 - 1) * 0.35; camera.lookAt(0, 0, 0);

      for (const sh of shapes) {
        const kz = (CAM - sh.z) / CAM, near = (sh.z + 7) / 9.5;
        const rangeY = half.y * kz * 1.35, rangeX = half.x * kz * 1.1;
        const x = sh.bx * rangeX;
        const y = mod(sh.by * rangeY - s.scroll * wpp * (0.35 + 0.75 * near) + rangeY, 2 * rangeY) - rangeY;
        const dx = x + sh.ox - ptr.x * kz, dy = y + sh.oy - ptr.y * kz, dist = Math.hypot(dx, dy) + 1e-3, R = 3.2 * kz;
        const f = dist < R ? (1 - dist / R) ** 2 : 0;
        sh.vx += (dx / dist) * f * dt * 26; sh.vy += (dy / dist) * f * dt * 26;
        if (click) {
          const cdx = x + sh.ox - click.x * kz, cdy = y + sh.oy - click.y * kz, cd = Math.hypot(cdx, cdy) + 1e-3;
          if (cd < 6 * kz) { const imp = 10 / (cd + 0.7); sh.vx += (cdx / cd) * imp; sh.vy += (cdy / cd) * imp; sh.spin += 6; }
        }
        sh.vx -= sh.ox * dt * 5; sh.vy -= sh.oy * dt * 5;
        const damp = Math.exp(-dt * 3); sh.vx *= damp; sh.vy *= damp;
        sh.ox += sh.vx * dt; sh.oy += sh.vy * dt; sh.spin *= Math.exp(-dt * 2.5);
        sh.rx += (sh.sx + f * 3 + sh.spin) * dt; sh.ry += (sh.sy + f * 2 + sh.spin * 0.6) * dt;
        const sc = sh.s * (1 + f * 0.3);
        dummy.position.set(x + sh.ox, y + sh.oy, sh.z); dummy.rotation.set(sh.rx, sh.ry, 0); dummy.scale.setScalar(sc); dummy.updateMatrix();
        meshes[sh.m].setMatrixAt(sh.i, dummy.matrix);
        meshes[sh.m].setColorAt(sh.i, sh.tone === 0 ? cA : sh.tone === 1 ? cB : cD);
      }
      click = null;
      meshes.forEach((m) => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; });
      renderer.render(scene, camera);
    };

    p.x = s.x = innerWidth * 0.5; p.y = s.y = innerHeight * 0.5;
    resize();
    addEventListener('resize', resize); addEventListener('pointermove', onMove, { passive: true }); addEventListener('pointerdown', onDown);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('resize', resize); removeEventListener('pointermove', onMove); removeEventListener('pointerdown', onDown);
      geos.forEach((g) => g.dispose()); mat.dispose(); meshes.forEach((m) => m.dispose());
      renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={box} className={`m3d-crystals${layer === 'top' ? ' is-top' : ''}`} aria-hidden="true" />;
}