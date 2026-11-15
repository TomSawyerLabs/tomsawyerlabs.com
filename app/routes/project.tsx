import { Link, useLocation } from "react-router";
import { Fence } from "~/components/Fence";
import { ProjectCard } from "~/components/ProjectCard";
import { CATEGORIES, PROJECTS, type Project } from "~/content/projects";
import { SITE, pageMeta } from "~/site";
import type { Route } from "./+types/project";

/** The project a /<slug> path shows (every slug has its own route). */
function projectAt(pathname: string): Project {
  const slug = pathname.replace(/^\/+|\/+$/g, "");
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) throw new Error(`No project for ${pathname}`);
  return project;
}

export const meta: Route.MetaFunction = ({ location }) => {
  const project = projectAt(location.pathname);
  return pageMeta({
    title: `${project.name} · ${SITE.name}`,
    description: project.tagline,
    path: `/${project.slug}`,
  });
};

export default function ProjectRoute() {
  const project = projectAt(useLocation().pathname);
  const category = CATEGORIES.find((c) => c.id === project.category);
  const siblings = PROJECTS.filter(
    (p) => p.category === project.category && p.slug !== project.slug,
  );

  return (
    <>
      <Fence />
      <main id="main" className="detail">
        <div className="wrap">
          <p className="crumbs">
            <Link to="/#projects">Projects</Link>
            {category && (
              <>
                {" / "}
                <span>{category.name}</span>
              </>
            )}
          </p>

          <header className="detail__head">
            <h1>
              <span className="brushed">{project.name}</span>
            </h1>
            <p className="detail__tagline">{project.tagline}</p>
            {project.early && (
              <p className="detail__early">
                <span className="badge">early</span> Still taking shape: expect
                gaps and changes. The README has the details.
              </p>
            )}
          </header>

          <div className="detail__grid">
            <div className="detail__body">
              <p className="detail__summary">{project.summary}</p>
              {project.features.length > 0 && (
                <>
                  <h2>What it does</h2>
                  <ul className="ticks">
                    {project.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <aside className="detail__side">
              {project.facts && (
                <dl className="facts">
                  {project.facts.map((f) => (
                    <div key={f.label}>
                      <dt>{f.label}</dt>
                      <dd>{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {project.stack.length > 0 && (
                <>
                  <h2 className="side-h">Built with</h2>
                  <ul className="tags">
                    {project.stack.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </>
              )}
              {project.license && (
                <p className="side-note">
                  License: <span className="mono">{project.license}</span>
                </p>
              )}
              {project.links.length > 0 && (
                <ul className="side-links">
                  {project.links.map((l) => (
                    <li key={l.href}>
                      <a className="button" href={l.href}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>

          {siblings.length > 0 && category && (
            <section className="section related">
              <h2>More in {category.name}</h2>
              <ul className="cards">
                {siblings.map((p) => (
                  <li key={p.slug}>
                    <ProjectCard project={p} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
