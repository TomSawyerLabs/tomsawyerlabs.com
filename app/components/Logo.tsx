import { logoSvg } from "@tomsawyerlabs/ui";

// The wordmark is 52 KB of path data, and the home page draws it three times
// (the hero name, its halo, and the bar's copy). So it goes into the page once,
// as a <symbol> at the top of <body>, and every logo is a <use> of it.
//
// The path data is only rendered on the server. The sprite lives in the root
// layout, which stays mounted for the life of the page, so hydration keeps the
// server's markup and the client bundle never carries the logo at all.

// The logo file's viewBox. The symbol maps it into each <use>, whose own
// viewBox is just the size: repeating the offset would shift the logo twice.
const VIEW_BOX = "0 -1150 2100 1600";
const SIZE = "0 0 2100 1600";

/** Once per page, in the root layout. */
export function LogoSprite() {
  return (
    <svg
      aria-hidden="true"
      width="0"
      height="0"
      style={{ position: "absolute", overflow: "hidden" }}
    >
      <symbol
        id="tsl-logo"
        viewBox={VIEW_BOX}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: import.meta.env.SSR ? innerMarkup(logoSvg) : "",
        }}
      />
    </svg>
  );
}

/** The wordmark in the surrounding text colour, as wide as its box. */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox={SIZE} width="100%" fill="currentColor" aria-hidden="true">
        <use href="#tsl-logo" />
      </svg>
    </div>
  );
}

/** What's inside the logo file's outer <svg>: its paths. */
function innerMarkup(svg: string): string {
  const start = svg.indexOf(">", svg.indexOf("<svg")) + 1;
  return svg.slice(start, svg.lastIndexOf("</svg>"));
}
