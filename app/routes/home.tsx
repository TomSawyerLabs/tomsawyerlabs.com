import { Link } from "react-router";
import { Fence } from "~/components/Fence";
import { ProjectCard } from "~/components/ProjectCard";
import { CATEGORIES, PROJECTS, projectsIn } from "~/content/projects";
import { SITE, pageMeta } from "~/site";
import type { Route } from "./+types/home";

export const meta: Route.MetaFunction = () =>
  pageMeta({ title: SITE.name, description: SITE.description, path: "/" });

export default function Home() {
  const field = PROJECTS.find((p) => p.slug === "practice-field");
  const pfms = PROJECTS.find((p) => p.slug === "pfms");

  return (
    <>
      <Fence hero />
      <main id="main">
        <section className="section intro">
          <div className="wrap intro__grid">
            <h2>
              <span className="brushed">Everyone gets a brush.</span>
            </h2>
            <div className="intro__text">
              <p>
                In the book, Tom Sawyer gets half the town to whitewash Aunt
                Polly's fence for him, and they pay him for the privilege. We
                run it the other way around. We build tools for our own shop and
                our community, then publish them so anyone can pick up a brush.
              </p>
              <p>
                Tom Sawyer Labs is the open-source and public-benefit side of{" "}
                <a href="https://twilltech.com">TWILL Technology</a>.
              </p>
            </div>
          </div>
        </section>

        {field && (
          <section className="section" aria-labelledby="field-heading">
            <div className="wrap">
              <article className="feature">
                <div className="feature__art" aria-hidden="true">
                  <FieldSketch />
                </div>
                <div className="feature__body">
                  <p className="kicker">FIRST Robotics</p>
                  <h2 id="field-heading">{field.name}</h2>
                  <p>{field.summary}</p>
                  {field.facts && (
                    <dl className="facts">
                      {field.facts.map((f) => (
                        <div key={f.label}>
                          <dt>{f.label}</dt>
                          <dd>{f.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  <p className="feature__links">
                    <Link className="button" to={`/${field.slug}`}>
                      About the field
                    </Link>
                    {pfms && <Link to={`/${pfms.slug}`}>{pfms.name} →</Link>}
                  </p>
                </div>
              </article>
            </div>
          </section>
        )}

        <section id="projects" className="section">
          <div className="wrap">
            <div className="section__head">
              <h2>
                <span className="brushed">What we build</span>
              </h2>
              <p>
                Everything here is open source. Most of it started because we
                needed it in the shop.
              </p>
            </div>

            {CATEGORIES.map((c) => {
              const items = projectsIn(c.id).filter(
                (p) => p.slug !== "practice-field",
              );
              if (!items.length) return null;
              return (
                <section
                  key={c.id}
                  className="category"
                  aria-labelledby={`cat-${c.id}`}
                >
                  <header className="category__head">
                    <h3 id={`cat-${c.id}`}>{c.name}</h3>
                    <p>{c.blurb}</p>
                  </header>
                  <ul className="cards">
                    {items.map((p) => (
                      <li key={p.slug}>
                        <ProjectCard project={p} />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}

/** A pencil sketch of an FRC field from above: walls, alliance stations,
 *  the center line. Drawn in the page's ink so it follows the theme. */
function FieldSketch() {
  return (
    <svg viewBox="0 0 400 200" className="sketch">
      <defs>
        <filter id="pencil">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
        </filter>
      </defs>
      <g filter="url(#pencil)" fill="none" strokeLinecap="round">
        <path
          className="sketch__line"
          d="M40 22 L360 20 Q372 20 374 32 L376 168 Q376 180 362 180 L40 181 Q27 180 26 168 L25 34 Q26 22 40 22 Z"
        />
        <path className="sketch__line thin" d="M200 21 L201 180" />
        <circle className="sketch__line thin" cx="200" cy="100" r="24" />
        <path className="sketch__red" d="M14 55 L14 145" />
        <path className="sketch__blue" d="M386 55 L386 145" />
        <path className="sketch__line thin" d="M110 22 L108 180" />
        <path className="sketch__line thin" d="M290 21 L292 180" />
        <rect
          className="sketch__red"
          x="70"
          y="78"
          width="22"
          height="22"
          rx="3"
        />
        <rect
          className="sketch__blue"
          x="306"
          y="100"
          width="22"
          height="22"
          rx="3"
        />
      </g>
    </svg>
  );
}
