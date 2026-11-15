import { type RouteConfig, index, route } from "@react-router/dev/routes";
// Relative, not "~/": this file is loaded by the React Router config too.
import { PAGED } from "./content/projects";

export default [
  index("routes/home.tsx"),
  // One page per project at /<slug>, all from the same template.
  ...PAGED.map((project) =>
    route(project.slug, "routes/project.tsx", {
      id: `project/${project.slug}`,
    }),
  ),
  route("*", "routes/404.tsx"),
] satisfies RouteConfig;
