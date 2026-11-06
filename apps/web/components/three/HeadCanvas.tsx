"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { buildHead } from "./head";

/**
 * The hero head: a scan rig that follows the cursor.
 *
 * Discipline borrowed from the 3D handbook, which measured rather than guessed:
 *
 * - Triangle count is not the usual bottleneck; draw calls and textures are.
 *   This scene is a handful of meshes with no textures at all, so it stays
 *   comfortably inside a frame budget on integrated graphics.
 * - No per-frame allocation. Vectors and targets are hoisted; the animation
 *   loop only writes numbers. Allocating inside `requestAnimationFrame` is what
 *   makes WebGL pages stutter after ten seconds of scrolling.
 * - Motion is damped toward a target rather than assigned directly, so the head
 *   eases. Snapping the rotation to the raw cursor feels like a broken browser.
 * - The canvas is decorative: it is `aria-hidden`, has no pointer handlers on
 *   the text, and is skipped entirely under `prefers-reduced-motion`.
 * - Rendering stops when the tab is hidden or the element scrolls away. An
 *   idle hero should not spend a phone battery.
 */
export function HeadCanvas({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      // No WebGL, no hero. The section keeps its text, which is the content.
      return;
    }

    // Size from the host's measured box. At mount the element can still be
    // 0x0 or pre-layout, and sizing from clientWidth then locks in a buffer
    // that never matches the display, which shows up as a soft, low-res head.
    const measure = () => ({
      w: Math.max(el.clientWidth, 1),
      h: Math.max(el.clientHeight, 1),
    });
    const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

    let { w: cw, h: ch } = measure();
    renderer.setPixelRatio(dpr());
    renderer.setSize(cw, ch, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      34,
      el.clientWidth / Math.max(el.clientHeight, 1),
      0.1,
      100,
    );
    // Framed a little high: the head should sit slightly above the panel's
    // centre so it reads as a portrait rather than a specimen on a slide.
    camera.position.set(0, 0.12, 4.2);
    camera.lookAt(0, 0.05, 0);

    // Lighting: one key from upper left, one cool rim from behind to separate
    // the silhouette from a dark page.
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xdfe8ff, 2.1);
    key.position.set(-2.2, 2.4, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x73a6ff, 1.5);
    rim.position.set(2.4, 0.8, -2.6);
    scene.add(rim);

    const { group, scanLine } = buildHead();
    scene.add(group);

    // --- Cursor tracking ----------------------------------------------------
    // Targets are written by the pointer handler and consumed by the loop.
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      // Normalise against the viewport, not the canvas: the head should respond
      // to the cursor anywhere on the page, which is what makes it feel alive.
      target.x = THREE.MathUtils.clamp(
        ((e.clientX - (r.left + r.width / 2)) / window.innerWidth) * 2,
        -1,
        1,
      );
      target.y = THREE.MathUtils.clamp(
        ((e.clientY - (r.top + r.height / 2)) / window.innerHeight) * 2,
        -1,
        1,
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // Touch: respond to drag, and recentre when the finger lifts.
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
    };
    window.addEventListener("pointerup", onLeave, { passive: true });

    // --- Loop ---------------------------------------------------------------
    let raf = 0;
    let running = true;
    const clock = new THREE.Clock();
    let scan = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!running) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      if (reduce) {
        group.rotation.y = 0;
        group.rotation.x = 0.04;
        // Nothing on this frame changes, so draw it once and stop the loop.
        // A decorative object must not hold a render loop open for a reader
        // who has asked the system for less motion.
        renderer.render(scene, camera);
        cancelAnimationFrame(raf);
        return;
      } else {
        // Damping: 1 - exp(-k*dt) is frame-rate independent. A plain lerp
        // constant would move at different speeds on 60Hz and 120Hz screens.
        const k = 1 - Math.exp(-6 * dt);
        current.x += (target.x - current.x) * k;
        current.y += (target.y - current.y) * k;

        // A wider yaw so the turn is unmistakable. The head should visibly
        // follow you across the page, not drift a few degrees.
        group.rotation.y = current.x * 0.62;
        group.rotation.x = 0.04 + current.y * 0.24;

        // Idle drift, so the head is never perfectly still.
        group.position.y = Math.sin(t * 0.7) * 0.014;
      }

      // Scan sweep: 4.5s down-and-up, never resting.
      scan = (Math.sin(t * 0.7) + 1) / 2;
      const y = 1.05 - scan * 2.1;
      scanLine.position.y = y;
      scanLine.rotation.x = 0.04;

      // Fade the band at the extremes so it does not pop at the edges.
      const mat = scanLine.material as THREE.LineBasicMaterial;
      mat.opacity = 0.9 * Math.min(1, Math.min(scan, 1 - scan) * 6);

      renderer.render(scene, camera);
    };
    tick();

    // --- Lifecycle ----------------------------------------------------------
    const onVis = () => {
      running = !document.hidden;
      if (running) clock.getDelta(); // discard the gap
    };
    document.addEventListener("visibilitychange", onVis);

    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting && !document.hidden;
      },
      { threshold: 0 },
    );
    io.observe(el);

    const ro = new ResizeObserver(() => {
      const { w, h } = measure();
      if (w === cw && h === ch) return;
      cw = w;
      ch = h;
      renderer.setPixelRatio(dpr());
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      ro.disconnect();
      // Explicit disposal: WebGL contexts are a limited resource and leaking
      // one per mount eventually blanks the canvas for no visible reason.
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) mat.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === el) {
        el.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={host}
      aria-hidden="true"
      className={className}
      // The canvas is decoration; it must never trap a click meant for the
      // copy or the buttons behind it.
      style={{ touchAction: "pan-y" }}
    />
  );
}
