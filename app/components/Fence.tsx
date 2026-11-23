import { useEffect, useRef } from "react";
import { Link, NavLink } from "react-router";
import { Logo } from "./Logo";

// Tom Sawyer's fence. On the home page it fills the first screen with our
// name painted on it, then shrinks into the top bar as you scroll. Every
// other page starts with it already shrunk.
//
// The shrink is CSS alone (fence.css) wherever the browser has scroll-driven
// animations, JavaScript or not. The effect below is only the fallback for
// browsers without them (Firefox); there the `js` class on <html> (set in
// root.tsx before first paint) pins the hero, and without JavaScript it's an
// ordinary full-screen block above the page.

/** Enough pickets to cross a wide screen at their natural width; the row is
 *  right-aligned and clipped on the left, so the unpainted end always shows.
 *  Wider than that, fence.css widens each picket so the row still reaches
 *  the left edge. */
const PICKETS = 60;

/** Deterministic per-picket variety, so the server and client agree. */
function picketStyle(i: number): React.CSSProperties {
  const shade = ((i * 37) % 11) / 10; // 0..1
  const lift = ((i * 53) % 7) - 3; // -3..3 px
  return {
    "--shade": shade.toFixed(2),
    "--lift": `${lift}px`,
    // Place from the right-hand end, for the whitewash intro's order.
    "--from-right": PICKETS - 1 - i,
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

  // The whitewash intro (fence.css) only plays when a visit starts on the
  // home page: any other page's fence ends it, so arriving at or returning
  // to the home page by a link shows the fence already painted.
  useEffect(() => {
    if (!hero) document.documentElement.classList.remove("intro");
  }, [hero]);

  // The shrink is the fence-* CSS animations in fence.css, driven by the
  // scroll position where the browser supports scroll-driven animations.
  // Elsewhere, scrub them from here: they're paused 1s animations, so
  // seeking them to `progress` seconds is the same thing.
  useEffect(() => {
    const el = ref.current;
    if (!hero || !el || CSS.supports("animation-timeline: scroll()")) return;

    const anims = el
      .getAnimations({ subtree: true })
      .filter(
        (a): a is CSSAnimation =>
          a instanceof CSSAnimation && a.animationName.startsWith("fence-"),
      );
    let range = 1;
    let frame = 0;

    const measure = () => {
      const bar = parseFloat(getComputedStyle(el).getPropertyValue("--bar-h"));
      range = Math.max(1, el.offsetHeight - bar);
    };
    const update = () => {
      frame = 0;
      const p = Math.min(Math.max(window.scrollY / range, 0), 1);
      for (const a of anims) a.currentTime = p * 1000;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      update();
    };

    onResize();
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
      <header
        ref={ref}
        className="fence"
        data-hero={hero ? "" : undefined}
        style={{ "--pickets": PICKETS } as React.CSSProperties}
      >
        <div className="fence__stage">
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
              {hero && <Logo className="fence__logo fence__halo" />}
              <Logo className="fence__logo" />
            </Link>
          </BrandTag>

          {/* The bar's own copy of the name, drawn at bar size. The hero
              name is a big layer the compositor scales down ~8x, which comes
              out jagged, so at the end of the shrink it hands over to this. */}
          {hero && (
            <div className="fence__mark" aria-hidden="true">
              <Logo className="fence__logo" />
            </div>
          )}

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
        </div>
      </header>
      {hero && <div className="fence-spacer" aria-hidden="true" />}
    </>
  );
}
