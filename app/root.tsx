import { Footer, GradientBackground } from "@tomsawyerlabs/ui";
import { useEffect, useState } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "@tomsawyerlabs/ui/styles.css";
import "./styles/site.css";

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

function RandomQuote() {
  const [quote, setQuote] = useState(footerQuotes[0]);
  useEffect(() => {
    setQuote(footerQuotes[Math.floor(Math.random() * footerQuotes.length)]);
  }, []);
  return quote;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
        <Meta />
        <Links />
      </head>
      <body>
        <GradientBackground />
        {children}
        <Footer>
          <RandomQuote />
        </Footer>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
