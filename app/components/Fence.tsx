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

  // The shrink only ever changes transforms and opacity, so scrolling never
  // re-lays-out or repaints the fence: the pickets' noise textures and the
  // logo's halo are rasterized once and the compositor moves them. Resizing
  // the header instead (the obvious way) re-rasterized every picket on
  // every frame.
  //
  // The header keeps its full height and slides up (translateY(-y)), so its
  // overflow clip is what makes it look shorter; the stage inside slides
  // back down by the same amount, so the scene stays put while the clip's
  // bottom edge rises.
  useEffect(() => {
    const el = ref.current;
    if (!hero || !el) return;
    const q = <T extends HTMLElement>(s: string) => el.querySelector<T>(s)!;
    const stage = q(".fence__stage");
    const brand = q(".fence__brand");
    const halo = q(".fence__halo");
    const pickets = q(".fence__pickets");
    const railBox = q(".fence__rails");
    const rails = Array.from(railBox.children) as HTMLElement[];
    const fading = [q(".fence__tagline"), q(".fence__more")];

    let frame = 0;
    let collapsed: boolean | null = null;
    // Measured once per resize; nothing is read back while scrolling.
    let m = {
      full: 0, // header height (100svh)
      bar: 0,
      sky: 0, // sky above the pickets in the hero
      railsH: 0, // the rails' box height in the hero
      rails: [] as { frac: number; h: number }[],
      brand: { x: 0, y: 0, scale: 1 },
    };

    const railHeight = (box: number) => Math.min(Math.max(box * 0.07, 10), 34);

    const measure = () => {
      el.style.transform = stage.style.transform = brand.style.transform = "";
      for (const r of [pickets, railBox, ...rails]) r.style.transform = "";
      const cs = getComputedStyle(el);
      const full = el.offsetHeight;
      const bar = parseFloat(cs.getPropertyValue("--bar-h"));
      const railsH = railBox.offsetHeight;
      const base = brand.getBoundingClientRect();
      const scale = (bar - 14) / base.height;
      const inset = parseFloat(cs.fontSize); // 1rem-ish
      m = {
        full,
        bar,
        sky: pickets.offsetTop,
        railsH,
        rails: rails.map((r) => ({
          frac: r.offsetTop / railsH,
          h: railHeight(railsH),
        })),
        brand: {
          scale,
          x: inset + (base.width * scale) / 2 - (base.left + base.width / 2),
          y: bar / 2 + 4 - (base.top + base.height / 2),
        },
      };
    };

    const update = () => {
      frame = 0;
      const range = Math.max(1, m.full - m.bar);
      const y = Math.min(Math.max(window.scrollY, 0), range);
      const p = y / range;

      el.style.transform = `translateY(${-y}px)`;
      stage.style.transform = `translateY(${y}px)`;

      // The pickets rise to fill the sky's place.
      const rise = `translateY(${-m.sky * p}px)`;
      pickets.style.transform = rise;
      railBox.style.transform = rise;
      // The rails stay at the same fraction of the visible fence's height.
      const railsH = m.railsH - y + m.sky * p;
      rails.forEach((r, i) => {
        const { frac, h } = m.rails[i];
        const shift = frac * (railsH - m.railsH);
        r.style.transform = `translateY(${shift}px) scaleY(${railHeight(railsH) / h})`;
      });

      const b = m.brand;
      const s = 1 + (b.scale - 1) * p;
      brand.style.transform = `translate(${b.x * p}px, ${b.y * p}px) scale(${s})`;
      halo.style.opacity = p.toFixed(3);
      const fade = Math.min(Math.max(1 - p * 3, 0), 1).toFixed(3);
      for (const f of fading) f.style.opacity = fade;

      if (collapsed !== p >= 1) {
        collapsed = p >= 1;
        el.toggleAttribute("data-collapsed", collapsed);
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      update();
    };

    let live = true;
    onResize();
    // A late webfont can move things after the first measure.
    document.fonts?.ready.then(() => live && onResize());
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      live = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
    };
  }, [hero]);

  const BrandTag = hero ? "h1" : "div";

  return (
    <>
      <header ref={ref} className="fence" data-hero={hero ? "" : undefined}>
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
