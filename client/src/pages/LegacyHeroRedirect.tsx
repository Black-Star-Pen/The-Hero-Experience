import { Navigate, useParams } from "react-router";

/** URL of the hero pages in the first version of the project. */
export function LegacyHeroRedirect() {
  const { id } = useParams();
  return <Navigate to={`/heros/${id}`} replace />;
}
