import type { MetaFunction } from "react-router";
import logo from "../logo.svg?raw";

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
  return (
    <main className="container">
      <div className="logo" dangerouslySetInnerHTML={{ __html: logo }} />
      <h1>Home of our Open Source projects</h1>
      <h1>
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
      </h1>
    </main>
  );
}
