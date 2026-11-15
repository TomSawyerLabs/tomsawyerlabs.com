import { Link } from "react-router";
import { Fence } from "~/components/Fence";
import type { Route } from "./+types/404";

export const meta: Route.MetaFunction = () => [
  { title: "Page not found · Tom Sawyer Labs" },
  { name: "description", content: "That page isn't here." },
];

export default function NotFound() {
  return (
    <>
      <Fence />
      <main className="wrap not-found">
        <h1>404</h1>
        <p>Nobody has painted this part of the fence yet.</p>
        <Link to="/" className="button">
          Go back home
        </Link>
      </main>
    </>
  );
}
