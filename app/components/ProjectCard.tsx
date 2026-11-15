import { Link } from "react-router";
import type { Project } from "~/content/projects";

export function ProjectCard({ project }: { project: Project }) {
  const body = (
    <>
      <h4 className="card__name">
        {project.name}
        {project.early && <span className="badge">early</span>}
      </h4>
      <p className="card__tagline">{project.tagline}</p>
      {project.repo && <p className="card__repo mono">{project.repo}</p>}
    </>
  );

  if (project.page) {
    return (
      <Link className="card" to={`/${project.slug}`}>
        {body}
      </Link>
    );
  }
  const href = project.links[0]?.href;
  return href ? (
    <a className="card card--small" href={href}>
      {body}
    </a>
  ) : (
    <div className="card card--small">{body}</div>
  );
}
