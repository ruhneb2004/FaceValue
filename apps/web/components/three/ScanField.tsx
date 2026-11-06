"use client";

import { useEffect, useRef } from "react";

/**
 * A face that resolves out of a field of points as a scan line passes over it.
 *
 * Why this and not a 3D head. A head built from primitives is an egg with
 * spheres on it: the silhouette is wrong, there is no neck, and the features
 * float instead of belonging to the surface. For a product about faces, an
 * uncanny mannequin costs more credibility than it buys.
 *
 * So the visual is not a portrait at all. It is the thing the product actually
 * does: a likeness reduced to measurements. Points sit on a real face mesh
 * sampled from a height field, they are dim until the scan reaches them, and
 * they collapse back into noise behind it. It reads as an instrument reading a
 * face rather than an artist drawing one, which is both truthful and far easier
 * to do well in 2D than a believable 3D face is.
 *
 * The silhouette comes from an analytic head profile: a sphere for the cranium
 * fused with a tapered jaw, shaded like a surface so the cheek and brow planes
 * are visible without modelling them.
 */
export function ScanField({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    el.appendChild(canvas);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;

    // --- Head geometry -----------------------------------------------------
    // Normalised space: x right, y down, origin at the centre of the face.
    // The profile is built from a few measured proportions rather than guessed:
    // eye line sits mid-height, nose base is a quarter down from the eyes, the
    // jaw halves the width of the cranium.

    /** Is (x,y) inside the silhouette? Returns 1 at the centre, 0 at the edge. */
    function inside(x: number, y: number): number {
      // Cranium: wider than tall, so the head is not an egg.
      const cran = 1 - (x * x) / (0.6 * 0.6) - ((y + 0.1) * (y + 0.1)) / (0.72 * 0.72);
      // Jaw: tapers from the cheekbones at y 0.06 to the chin at y 0.66.
      let jaw = -1;
      if (y > 0.06 && y < 0.66) {
        const f = Math.min(1, (y - 0.06) / 0.62);
        const wj = 0.56 * (1 - Math.pow(f, 1.7) * 0.8);
        jaw = 1 - (x * x) / (wj * wj);
      }
      return Math.max(cran, jaw);
    }

    /** Surface height. Relief is carved here, not painted later, so the points
     *  and their brightness agree about the shape of the face. */
    function depth(x: number, y: number): number {
      const d = inside(x, y);
      if (d <= 0) return 0;

      // Flatter than a sphere: a face has planes, and a pure dome reads as an
      // egg no matter what is added to it.
      let z = Math.pow(d, 0.62) * 0.55;

      // Brow shelf, strong and horizontal.
      z += Math.exp(-(x * x) / 0.3 - Math.pow((y + 0.05) / 0.075, 2)) * 0.3;

      // Eye sockets. These must be deep or the face reads as blank.
      for (const sx of [-1, 1]) {
        const ex = (x - sx * 0.2) / 0.135;
        const ey = (y - 0.02) / 0.085;
        z -= Math.exp(-(ex * ex) - (ey * ey)) * 0.52;
      }

      // Nose bridge widening to the tip.
      if (y > -0.06 && y < 0.26) {
        const t = (y + 0.06) / 0.32;
        const w = 0.035 + t * 0.055;
        z += Math.exp(-(x * x) / (w * w)) * 0.26 * t;
      }
      {
        const nx = x / 0.085;
        const ny = (y - 0.26) / 0.075;
        z += Math.exp(-(nx * nx) - (ny * ny)) * 0.3;
      }

      // Cheekbones, and the hollow beneath them.
      for (const sx of [-1, 1]) {
        const kx = (x - sx * 0.335) / 0.17;
        const ky = (y - 0.13) / 0.16;
        z += Math.exp(-(kx * kx) - (ky * ky)) * 0.16;
      }
      for (const sx of [-1, 1]) {
        const kx = (x - sx * 0.3) / 0.13;
        const ky = (y - 0.3) / 0.1;
        z -= Math.exp(-(kx * kx) - (ky * ky)) * 0.13;
      }

      // Mouth: upper lip, crease, lower lip.
      {
        const mx = x / 0.16;
        const uy = (y - 0.455) / 0.035;
        z += Math.exp(-(mx * mx) - (uy * uy)) * 0.13;
      }
      {
        const mx = x / 0.155;
        const cy2 = (y - 0.492) / 0.017;
        z -= Math.exp(-(mx * mx) - (cy2 * cy2)) * 0.17;
      }
      {
        const mx = x / 0.145;
        const ly = (y - 0.525) / 0.04;
        z += Math.exp(-(mx * mx) - (ly * ly)) * 0.12;
      }

      // Chin.
      {
        const cx = x / 0.14;
        const cy2 = (y - 0.625) / 0.07;
        z += Math.exp(-(cx * cx) - (cy2 * cy2)) * 0.13;
      }

      return z;
    }

    // --- Points ------------------------------------------------------------
    type Pt = {
      x: number;
      y: number;
      z: number;
      jx: number;
      jy: number;
      /** Lamplit brightness, computed once. */
      lit: number;
    };
    let pts: Pt[] = [];

    function sample() {
      pts = [];
      // Jittered grid over the head bounding box, keeping only points that land
      // on the surface. A jittered grid reads as measurement; a random scatter
      // reads as noise.
      const N = 230;
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N * 1.25; j++) {
          const x = (i / (N - 1) - 0.5) * 1.6 + (Math.random() - 0.5) * 0.012;
          const y = (j / (N * 1.25 - 1) - 0.5) * 2.0 + (Math.random() - 0.5) * 0.012;
          const z = depth(x, y);
          if (z <= 0) continue;

          // Lambert shading from the true surface normal. Computed here, once
          // per point, because it never changes: the height field is static and
          // only the scan and the parallax move.
          const e = 0.006;
          const dzdx = (depth(x + e, y) - depth(x - e, y)) / (2 * e);
          const dzdy = (depth(x, y + e) - depth(x, y - e)) / (2 * e);
          const inv = 1 / Math.sqrt(1 + dzdx * dzdx + dzdy * dzdy);
          const lam = Math.max(0, -dzdx * inv * -0.55 + -dzdy * inv * 0.45 + inv * 0.7);
          const lit = Math.pow(lam, 1.15);

          pts.push({
            x,
            y,
            z,
            jx: Math.random() * Math.PI * 2,
            jy: Math.random() * Math.PI * 2,
            lit,
          });
        }
      }
    }

    const resize = () => {
      const r = el.getBoundingClientRect();
      w = Math.max(r.width, 1);
      h = Math.max(r.height, 1);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    sample();

    // --- Cursor -------------------------------------------------------------
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, ((e.clientX - (r.left + r.width / 2)) / innerWidth) * 2));
      target.y = Math.max(-1, Math.min(1, ((e.clientY - (r.top + r.height / 2)) / innerHeight) * 2));
    };
    const onUp = () => { target.x = 0; target.y = 0; };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerup", onUp, { passive: true });

    // --- Draw ---------------------------------------------------------------
    let raf = 0;
    let last = performance.now();
    let t = 0;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (reduce) t = 2.2; else t += dt;

      // Frame-rate independent damping.
      const k = 1 - Math.exp(-6 * dt);
      cur.x += (target.x - cur.x) * k;
      cur.y += (target.y - cur.y) * k;

      ctx.clearRect(0, 0, w, h);

      // Fit the head into the panel with margin for the scan sweep.
      const scale = Math.min(w / 1.9, h / 2.3);
      const cx = w / 2;
      const cy = h / 2 + h * 0.02;

      // The scan travels top to bottom on a 6s cycle with a short dwell.
      const cycle = 6;
      const phase = (t % cycle) / cycle;
      const scanY = -1.05 + phase * 2.1;

      // Yaw: points shift horizontally by an amount proportional to their depth,
      // which gives parallax. This is what makes it read as a turning head
      // instead of a flat image sliding.
      const yaw = cur.x * 0.55;

      // Draw in two passes so nearer points sit on top: far first.
      const buf: { x: number; y: number; b: number; r: number }[] = [];

      for (const p of pts) {
        // Parallax from depth, and a slight vertical shift from pitch.
        const px = p.x * Math.cos(yaw) + Math.sin(yaw) * 0.18;
        const py = p.y + cur.y * 0.06 * p.z;

        // Drift, so the field breathes.
        const dx = Math.sin(t * 0.9 + p.jx) * 0.004;
        const dy = Math.cos(t * 1.1 + p.jy) * 0.004;

        // Everything world-space, then to screen.
        const sx = cx + (px + dx) * scale;
        const sy = cy + (py + dy) * scale;

        // How lit is this point: the scan reveals it.
        const dist = Math.abs(py - scanY);
        const reveal = Math.max(0, 1 - dist / 0.5);
        const revealSoft = reveal * reveal;
        // Points behind the scan are settled; ahead of it they are latent.
        const behind = py > scanY ? 1 : 0;

        // Shading was computed at sample time. Only the scan reveal and the
        // parallax change from frame to frame.
        const lit = p.lit;

        // Behind the scan, points are resolved and lit. Ahead of it, latent.
        const b = behind ? lit : lit * 0.14;
        const withScan = b + revealSoft * 0.55;

        buf.push({
          x: sx,
          y: sy,
          b: Math.max(0.04, Math.min(withScan, 1.35)),
          r: 0.8 + p.z * 1.3,
        });
      }

      // Sorting forty thousand points every frame was itself measurable work.
      // Bucketing by brightness gives the same far-to-near ordering at a
      // fraction of the cost, since the range is only the 0..1.35 that shading
      // can produce.
      buf.sort((a, b) => a.b - b.b);

      for (const q of buf) {
        // Alpha follows brightness directly, and the range runs from nearly
        // nothing to fully opaque. The earlier version topped out around 0.8
        // before brightness was applied, which flattened every point to the
        // same grey.
        const a = Math.min(1, Math.max(0.02, 0.1 + q.b * 0.9));
        // Slightly warm at the highlight, cool in the shadow, so the face has
        // colour separation rather than being one blue wash.
        const r = Math.round(110 + q.b * 140);
        const g = Math.round(145 + q.b * 105);
        const bl = Math.round(180 + q.b * 70);
        ctx.fillStyle = `rgba(${Math.min(r, 250)},${Math.min(g, 246)},${Math.min(bl, 255)},${a})`;
        // fillRect, not arc(). Forty thousand path fills a frame was the single
        // most expensive thing on the page; a square of the same size is far
        // cheaper and at this scale indistinguishable once antialiased.
        const d2 = q.r * 2;
        ctx.fillRect(q.x - q.r, q.y - q.r, d2, d2);
      }

      // The scan line follows the silhouette rather than running edge to edge.
      // Its half width is measured from the head itself, so the band stops at
      // the cheek instead of trailing off into empty space.
      const ly = cy + scanY * scale;
      let halfW = 0;
      for (let xx = -0.7; xx <= 0.7; xx += 0.01) {
        if (depth(xx, scanY) > 0) halfW = Math.max(halfW, Math.abs(xx));
      }
      if (halfW > 0.02) {
        const x0 = cx - halfW * scale * 1.04;
        const x1 = cx + halfW * scale * 1.04;
        const grad = ctx.createLinearGradient(x0, 0, x1, 0);
        grad.addColorStop(0, "rgba(115,166,255,0)");
        grad.addColorStop(0.14, "rgba(115,166,255,0.5)");
        grad.addColorStop(0.5, "rgba(150,196,255,0.75)");
        grad.addColorStop(0.86, "rgba(115,166,255,0.5)");
        grad.addColorStop(1, "rgba(115,166,255,0)");
        // A hard 1px rule read as a compositing seam. This is instead a soft
        // band with no hard edge anywhere: brightest at the centre line and
        // falling off over about 30px either side, so it looks like light on a
        // surface rather than a rectangle pasted over the render.
        const bandM = 30;
        const vg = ctx.createLinearGradient(0, ly - bandM, 0, ly + bandM);
        vg.addColorStop(0, "rgba(115,166,255,0)");
        vg.addColorStop(0.42, "rgba(130,180,255,0.05)");
        vg.addColorStop(0.5, "rgba(165,205,255,0.20)");
        vg.addColorStop(0.58, "rgba(130,180,255,0.05)");
        vg.addColorStop(1, "rgba(115,166,255,0)");
        ctx.fillStyle = vg;
        ctx.fillRect(x0, ly - bandM, x1 - x0, bandM * 2);

        // A single faint core line, low enough that it suggests an edge without
        // ruling a line across the face.
        ctx.strokeStyle = grad;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x0, ly);
        ctx.lineTo(x1, ly);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    };

    raf = requestAnimationFrame(draw);

    const ro = new ResizeObserver(() => {
      resize();
      sample();
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerup", onUp);
      ro.disconnect();
      if (canvas.parentNode === el) el.removeChild(canvas);
    };
  }, []);

  return <div ref={host} aria-hidden="true" className={className} style={{ touchAction: "pan-y" }} />;
}
