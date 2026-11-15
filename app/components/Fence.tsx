import { Logo } from "@tomsawyerlabs/ui";
import { useEffect, useRef } from "react";
import { Link, NavLink } from "react-router";

// Tom Sawyer's fence. On the home page it fills the first screen with our
// name painted on it, then shrinks into the top bar as you scroll. Every
// other page starts with it already shrunk.
//
// Without JavaScript the hero is an ordinary full-screen block above the
// page (no shrinking); the `js` class on <html> (set in root.tsx before first
// paint) is what pins it and turns the shrink on.

/** Enough pickets to cross a wide screen; the row is right-aligned and
 *  clipped on the left, so the unpainted end always shows. */
const PICKETS = 44;

/** Deterministic per-picket variety, so the server and client agree. */
function picketStyle(i: number): React.CSSProperties {
  const shade = ((i * 37) % 11) / 10; // 0..1
  const lift = ((i * 53) % 7) - 3; // -3..3 px
  return {
    "--shade": shade.toFixed(2),
    "--lift": `${lift}px`,
  } as React.CSSProperties;
}

function paintOf(i: number): "full" | "partial" | "bare" {
  const fromRight = PICKETS - 1 - i;
  if (fromRight === 0) return "bare";
  if (fromRight === 1) return "partial";
  return "full";
}

export function Fence({ hero = false }: { hero?: boolean }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!hero || !el) return;
    const brand = el.querySelector<HTMLElement>(".fence__brand");
    if (!brand) return;

    let frame = 0;
    // The logo's full-size box (it's laid out at hero size; we only ever
    // transform it), and where it ends up in the bar.
    let base = brand.getBoundingClientRect();
    let target = { x: 0, y: 0, scale: 1 };

    const measure = () => {
      brand.style.transform = "";
      base = brand.getBoundingClientRect();
      const bar = parseFloat(getComputedStyle(el).getPropertyValue("--bar-h"));
      const height = bar - 14;
      const scale = height / base.height;
      const inset = parseFloat(getComputedStyle(el).fontSize); // 1rem-ish
      target = {
        scale,
        x: inset + (base.width * scale) / 2 - (base.left + base.width / 2),
        y: bar / 2 + 4 - (base.top + base.height / 2),
      };
    };

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const bar = parseFloat(getComputedStyle(el).getPropertyValue("--bar-h"));
      const range = Math.max(1, vh - bar);
      const y = Math.min(Math.max(window.scrollY, 0), range);
      const p = y / range;
      el.style.setProperty("--p", p.toFixed(4));
      el.style.height = `${vh - y}px`;
      el.toggleAttribute("data-collapsed", p >= 1);
      const s = 1 + (target.scale - 1) * p;
      brand.style.transform = `translate(${target.x * p}px, ${target.y * p}px) scale(${s})`;
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      update();
    };

    measure();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
    };
  }, [hero]);

  const BrandTag = hero ? "h1" : "div";

  return (
    <>
      <header ref={ref} className="fence" data-hero={hero ? "" : undefined}>
        <div className="fence__sky" aria-hidden="true" />
        <div className="fence__rails" aria-hidden="true">
          <span />
          <span />
        </div>
        <div className="fence__pickets" aria-hidden="true">
          {Array.from({ length: PICKETS }, (_, i) => (
            <span
              key={i}
              className="picket"
              data-paint={paintOf(i)}
              style={picketStyle(i)}
            />
          ))}
        </div>

        <BrandTag className="fence__brand">
          <Link to="/" aria-label="Tom Sawyer Labs, home">
            <Logo className="fence__logo" />
          </Link>
        </BrandTag>

        {hero && (
          <>
            <p className="fence__tagline">
              Open-source tools from our shop. Grab a brush.
            </p>
            <a className="fence__more" href="#main">
              See what we build
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 9l7 7 7-7" />
              </svg>
            </a>
          </>
        )}

        <nav className="fence__nav" aria-label="Site">
          <Link to="/#projects">Projects</Link>
          <NavLink to="/practice-field">Practice field</NavLink>
          <a href="https://github.com/TomSawyerLabs">GitHub</a>
        </nav>
      </header>
      {hero && <div className="fence-spacer" aria-hidden="true" />}
    </>
  );
}
