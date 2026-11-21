import { useEffect, useRef } from "react";

// The old site's background glow (global.css, "Background glow"): four soft
// spots that drift toward the pointer, each with its own pull (negative
// drifts away), as in useGradientMouse from @tomsawyerlabs/ui. Pointer moves
// only set where each spot is heading; CSS transitions ease the transforms,
// so nothing runs or repaints per frame.
const SPOTS = [
  { x: 15, y: 20, pull: 0.18 },
  { x: 85, y: 10, pull: -0.12 },
  { x: 70, y: 80, pull: 0.2 },
  { x: 30, y: 90, pull: -0.1 },
];

/**
 * The glow layers. They follow a mouse, except for people who ask for
 * reduced motion; touch screens get them standing still.
 */
export function GradientGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const spots = [...(ref.current?.children ?? [])] as HTMLElement[];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let pending = 0;
    let mouseX = 50;
    let mouseY = 50;

    const apply = () => {
      pending = 0;
      SPOTS.forEach((s, i) => {
        const dx = (mouseX - s.x) * s.pull;
        const dy = (mouseY - s.y) * s.pull;
        spots[i].style.transform = `translate(${dx}vw, ${dy}vh)`;
      });
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouseX = (e.clientX / window.innerWidth) * 100;
      mouseY = (e.clientY / window.innerHeight) * 100;
      pending ||= requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointer);
      cancelAnimationFrame(pending);
    };
  }, []);
  return (
    <div className="glow" aria-hidden="true" ref={ref}>
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}
