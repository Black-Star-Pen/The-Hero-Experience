import { Navigate, Outlet, useLocation } from "react-router";
import { Alert } from "../../../components/ui/Alert.tsx";
import { Container } from "../../../components/ui/Container.tsx";
import { Loading } from "../../../components/ui/Spinner.tsx";
import { useSession } from "../api.ts";
import { loginLink } from "../redirect.ts";

/** Layout route: renders the page for signed-in users, sends visitors to the sign-in page. */
export function RequireAuth() {
  const session = useSession();
  const location = useLocation();

  if (session.isPending) return <Loading />;
  if (session.isError) {
    return (
      <Container size="narrow">
        <Alert tone="error">{session.error.message}</Alert>
      </Container>
    );
  }
  if (!session.data) {
    return (
      <Navigate to={loginLink(location.pathname + location.search)} replace />
    );
  }
  return <Outlet />;
}
