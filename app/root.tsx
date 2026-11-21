import { Suspense, lazy, useEffect, useState } from "react";
import interLatin from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";
import markerLatin from "@fontsource/permanent-marker/files/permanent-marker-latin-400-normal.woff2?url";
import {
  Links,
  type LinksFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { GradientGlow } from "./components/GradientGlow";
import "@fontsource-variable/inter/index.css";
import "@fontsource-variable/jetbrains-mono/index.css";
import "@fontsource/permanent-marker/index.css";
import "./styles/global.css";
import "./styles/fence.css";
import "./styles/pages.css";

// Review comments (dev server only). `import.meta.env.DEV` is false in a
// build, so the overlay and its import are dropped from production bundles.
const ReviewOverlay = import.meta.env.DEV
  ? lazy(() => import("./review/ReviewOverlay"))
  : null;

/** Mounts the review overlay after hydration, so prerendered HTML matches. */
function Review() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!ReviewOverlay || !mounted) return null;
  return (
    <Suspense fallback={null}>
      <ReviewOverlay />
    </Suspense>
  );
}

// The fonts the first screen paints with. Without a preload the browser
// only finds them after the CSS is parsed and the page laid out, and the
// hero's tagline (the largest thing on the first screen) waits on Permanent
// Marker. Same files the @fontsource CSS points at, so they're fetched once.
export const links: LinksFunction = () =>
  [markerLatin, interLatin].map((href) => ({
    rel: "preload",
    href,
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  }));

const footerQuotes = [
  "Do the math, change the world!",
  "#BeLikeMike",
  "Hopefully, the 27th time's the charm!",
  "Make your grandmother proud.",
  "Embrace life. Build robots. Do great things.",
  "Those who are willing are those who achieve great things.",
  "We walk in the pits!",
  "More do, less talk.",
];

// Server-rendered with the first quote, then a random one after hydration,
// so the prerendered HTML and the first client render agree.
function RandomQuote() {
  const [quote, setQuote] = useState(footerQuotes[0]);
  useEffect(() => {
    setQuote(footerQuotes[Math.floor(Math.random() * footerQuotes.length)]);
  }, []);
  return quote;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the head script adds the `js` class first.
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="theme-color"
          content="#8ccbec"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#070d1f"
          media="(prefers-color-scheme: dark)"
        />
        <link
          rel="icon"
          href="/favicon-light.ico"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/favicon-dark.ico"
          media="(prefers-color-scheme: dark)"
        />
        {/* Before first paint: lets CSS pin and shrink the fence only when
            JavaScript will be there to drive it. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        {import.meta.env.DEV && (
          <script
            dangerouslySetInnerHTML={{
              __html: `if(new URLSearchParams(location.search).has('light'))document.documentElement.dataset.forceLight=''`,
            }}
          />
        )}
        <Meta />
        <Links />
      </head>
      <body>
        <GradientGlow />
        {children}
        <footer className="site-footer">
          <div className="wrap">
            <p className="site-footer__quote">
              <RandomQuote />
            </p>
            <nav aria-label="Elsewhere">
              <a href="https://github.com/TomSawyerLabs">GitHub</a>
              <a href="https://facebook.com/TomSawyerLabs">Facebook</a>
              <a href="https://twilltech.com/tomsawyerlabs">
                Part of TWILL Technology
              </a>
            </nav>
          </div>
        </footer>
        <Review />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
