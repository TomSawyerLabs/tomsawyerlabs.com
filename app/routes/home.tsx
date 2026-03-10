import { useEffect } from "react";
import type { MetaFunction } from "react-router";
import logo from "../logo.svg?raw";

// Four gradient spots with spring-based attraction to cursor
const SPOTS = [
  { baseX: 15, baseY: 20, pull: 0.18, stiffness: 0.004, damping: 0.91 },
  { baseX: 85, baseY: 10, pull: -0.12, stiffness: 0.002, damping: 0.94 },
  { baseX: 70, baseY: 80, pull: 0.2, stiffness: 0.005, damping: 0.89 },
  { baseX: 30, baseY: 90, pull: -0.1, stiffness: 0.0015, damping: 0.95 },
];

// Attraction model: spots drift toward cursor with spring damping
function useGradientMouse() {
  useEffect(() => {
    let mouseX = 50;
    let mouseY = 50;
    const state = SPOTS.map((s) => ({
      x: s.baseX,
      y: s.baseY,
      vx: 0,
      vy: 0,
    }));
    let frameId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 100;
      mouseY = (e.clientY / window.innerHeight) * 100;
    };

    const animate = () => {
      const style = document.documentElement.style;

      for (let i = 0; i < SPOTS.length; i++) {
        const spot = SPOTS[i];
        const s = state[i];

        const targetX = spot.baseX + (mouseX - spot.baseX) * spot.pull;
        const targetY = spot.baseY + (mouseY - spot.baseY) * spot.pull;

        s.vx = s.vx * spot.damping + (targetX - s.x) * spot.stiffness;
        s.vy = s.vy * spot.damping + (targetY - s.y) * spot.stiffness;
        s.x += s.vx;
        s.y += s.vy;

        style.setProperty(`--gx${i + 1}`, `${s.x}%`);
        style.setProperty(`--gy${i + 1}`, `${s.y}%`);
      }

      frameId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMouseMove);
    frameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);
}

export const meta: MetaFunction = () => {
  return [
    { title: "Tom Sawyer Labs" },
    {
      name: "description",
      content: "Home of our Open Source projects.",
    },
    { property: "og:type", content: "website" },
    { property: "og:title", content: "Tom Sawyer Labs" },
    {
      property: "og:description",
      content: "Home of our Open Source projects.",
    },
    { property: "og:url", content: "https://tomsawyerlabs.com" },
  ];
};

export default function Home() {
  useGradientMouse();

  return (
    <main className="container">
      <div className="logo" dangerouslySetInnerHTML={{ __html: logo }} />
      <h1>Home of our Open Source projects</h1>
      <nav aria-label="Social links">
        <a
          href="https://github.com/TomSawyerLabs"
          className="social-link"
          aria-label="GitHub"
        >
          <picture>
            <source
              srcSet="/github-mark-white.svg"
              media="(prefers-color-scheme: dark)"
            />
            <img src="/github-mark.svg" alt="GitHub" />
          </picture>
        </a>{" "}
        <a
          href="https://facebook.com/TomSawyerLabs"
          className="social-link"
          aria-label="Facebook"
        >
          <picture>
            <source
              srcSet="/Facebook_Logo_Secondary.png"
              media="(prefers-color-scheme: dark)"
            />
            <img src="/Facebook_Logo_Primary.png" alt="Facebook" />
          </picture>
        </a>
      </nav>
    </main>
  );
}
